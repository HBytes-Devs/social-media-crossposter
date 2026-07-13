import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createFrameClock } from "../../lib/threeFrameClock";

/** One SMC source → many social platform destinations */
const PLATFORMS = [
  { name: "LinkedIn", color: 0x0a66c2 },
  { name: "X", color: 0xdde1f0 },
  { name: "Facebook", color: 0x1877f2 },
  { name: "Instagram", color: 0xe1306c },
  { name: "YouTube", color: 0xff0033 },
  { name: "TikTok", color: 0x25f4ee },
] as const;

const ORBIT_RADIUS = 2.75;
const PULSES_PER_PLATFORM = 2;
const ARC_HEIGHT = 0.45;

type PlatformNode = {
  position: THREE.Vector3;
  core: THREE.Mesh;
  ring: THREE.Mesh;
  color: THREE.Color;
  linePositions: Float32Array;
  line: THREE.Line;
  flash: number;
};

type Pulse = {
  mesh: THREE.Mesh;
  platformIndex: number;
  progress: number;
  speed: number;
  delay: number;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function orbitPosition(index: number, total: number) {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  return new THREE.Vector3(
    Math.cos(angle) * ORBIT_RADIUS,
    Math.sin(angle) * ORBIT_RADIUS * 0.82,
    Math.sin(angle * 1.4) * 0.35,
  );
}

function curvePoint(
  start: THREE.Vector3,
  end: THREE.Vector3,
  t: number,
  bend = ARC_HEIGHT,
) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(end, start);
  const perp = new THREE.Vector3(-dir.y, dir.x, dir.z * 0.35).normalize().multiplyScalar(bend);
  mid.add(perp);

  const inv = 1 - t;
  return new THREE.Vector3(
    inv * inv * start.x + 2 * inv * t * mid.x + t * t * end.x,
    inv * inv * start.y + 2 * inv * t * mid.y + t * t * end.y,
    inv * inv * start.z + 2 * inv * t * mid.z + t * t * end.z,
  );
}

function buildCurveLine(start: THREE.Vector3, end: THREE.Vector3, segments = 40) {
  const positions = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i += 1) {
    const p = curvePoint(start, end, i / segments);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

export function AuthThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const center = new THREE.Vector3(0, 0, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0d16, 0.22);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 40);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ── Central SMC hub ──
    const hubCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 2),
      new THREE.MeshBasicMaterial({
        color: 0x4b5fff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    group.add(hubCore);

    const hubGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x4b5fff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    group.add(hubGlow);

    const hubRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.014, 8, 64),
      new THREE.MeshBasicMaterial({
        color: 0x8c6bff,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    hubRing.rotation.x = Math.PI / 2.2;
    group.add(hubRing);

    const hubRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.01, 6, 64),
      new THREE.MeshBasicMaterial({
        color: 0x4b5fff,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    hubRing2.rotation.x = Math.PI / 3.1;
    hubRing2.rotation.y = 0.5;
    group.add(hubRing2);

    // ── Platform nodes + connection lines ──
    const platforms: PlatformNode[] = [];
    const disposables: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    for (let i = 0; i < PLATFORMS.length; i += 1) {
      const def = PLATFORMS[i];
      const position = orbitPosition(i, PLATFORMS.length);
      const color = new THREE.Color(def.color);

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.14, 1),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      core.position.copy(position);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.012, 6, 40),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.38,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.position.copy(position);
      ring.rotation.x = Math.PI / 2 + (i % 3) * 0.3;
      ring.rotation.y = i * 0.4;

      const lineGeometry = buildCurveLine(center, position);
      disposables.push(lineGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4b5fff,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposableMaterials.push(lineMaterial);
      const line = new THREE.Line(lineGeometry, lineMaterial);

      group.add(line);
      group.add(core);
      group.add(ring);

      platforms.push({
        position,
        core,
        ring,
        color,
        linePositions: lineGeometry.getAttribute("position").array as Float32Array,
        line,
        flash: 0,
      });
    }

    // Orbit ring linking all platforms
    const orbitRingGeo = new THREE.RingGeometry(ORBIT_RADIUS - 0.02, ORBIT_RADIUS + 0.02, 64);
    const orbitRing = new THREE.Mesh(
      orbitRingGeo,
      new THREE.MeshBasicMaterial({
        color: 0x4b5fff,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    group.add(orbitRing);
    disposables.push(orbitRingGeo);

    // ── Post pulses traveling center → platform ──
    const pulses: Pulse[] = [];
    const pulseGeo = new THREE.SphereGeometry(0.055, 10, 10);

    for (let p = 0; p < PLATFORMS.length; p += 1) {
      for (let j = 0; j < PULSES_PER_PLATFORM; j += 1) {
        const material = new THREE.MeshBasicMaterial({
          color: PLATFORMS[p].color,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        disposableMaterials.push(material);
        const mesh = new THREE.Mesh(pulseGeo, material);
        mesh.visible = false;
        group.add(mesh);
        pulses.push({
          mesh,
          platformIndex: p,
          progress: j / PULSES_PER_PLATFORM,
          speed: 0.22 + (p % 3) * 0.04,
          delay: j * 0.55 + p * 0.18,
        });
      }
    }

    // Ambient dust near center
    const dustCount = 36;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 1.2;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    disposables.push(dustGeo);
    const dustMat = new THREE.PointsMaterial({
      color: 0xb9c0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposableMaterials.push(dustMat);
    const dust = new THREE.Points(dustGeo, dustMat);
    group.add(dust);

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const pointerTarget = container.parentElement ?? container;

    function onPointerMove(event: PointerEvent) {
      const rect = pointerTarget.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    pointerTarget.addEventListener("pointermove", onPointerMove);

    let frameId = 0;
    const clock = createFrameClock();
    let hubBurst = 0;

    function animate() {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta(), 0.05);

      pointer.x += (pointer.targetX - pointer.x) * 0.04;
      pointer.y += (pointer.targetY - pointer.y) * 0.04;
      group.rotation.y = pointer.x * 0.18;
      group.rotation.x = -pointer.y * 0.1;

      // Hub pulse — new post broadcast
      const broadcast = 0.5 + Math.sin(elapsed * 1.8) * 0.5;
      hubCore.scale.setScalar(1 + broadcast * 0.1);
      hubCore.rotation.y = elapsed * 0.4;
      hubCore.rotation.x = elapsed * 0.25;
      hubGlow.scale.setScalar(1 + broadcast * 0.15);
      hubGlow.material.opacity = 0.1 + broadcast * 0.08;
      hubRing.rotation.z = elapsed * 0.35;
      hubRing2.rotation.z = -elapsed * 0.22;

      hubBurst += dt;
      if (hubBurst > 2.8) {
        hubBurst = 0;
        for (const pulse of pulses) {
          if (pulse.progress > 0.85 || !pulse.mesh.visible) {
            pulse.progress = 0;
            pulse.delay = Math.random() * 0.4;
          }
        }
      }

      // Update connection line shimmer
      for (let i = 0; i < platforms.length; i += 1) {
        const platform = platforms[i];
        const shimmer = 0.2 + Math.sin(elapsed * 2 + i * 0.9) * 0.08;
        (platform.line.material as THREE.LineBasicMaterial).opacity =
          shimmer + platform.flash * 0.35;

        platform.core.rotation.x = elapsed * 0.3 + i;
        platform.core.rotation.y = elapsed * 0.22 + i * 0.5;
        platform.ring.rotation.z = elapsed * (0.18 + i * 0.03);

        if (platform.flash > 0) {
          platform.flash = Math.max(0, platform.flash - dt * 1.8);
          const s = 1 + platform.flash * 0.45;
          platform.core.scale.setScalar(s);
          (platform.core.material as THREE.MeshBasicMaterial).opacity =
            0.75 + platform.flash * 0.25;
        } else {
          platform.core.scale.setScalar(1);
          (platform.core.material as THREE.MeshBasicMaterial).opacity = 0.9;
        }
      }

      // Move post pulses along curves
      for (const pulse of pulses) {
        if (pulse.delay > 0) {
          pulse.delay -= dt;
          pulse.mesh.visible = false;
          continue;
        }

        pulse.progress += pulse.speed * dt;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.delay = 1.1 + Math.random() * 1.6;
          pulse.mesh.visible = false;
          platforms[pulse.platformIndex].flash = 1;
          continue;
        }

        const platform = platforms[pulse.platformIndex];
        const pos = curvePoint(center, platform.position, pulse.progress, ARC_HEIGHT);
        pulse.mesh.position.copy(pos);
        pulse.mesh.visible = true;

        const trail = Math.sin(pulse.progress * Math.PI);
        pulse.mesh.scale.setScalar(0.7 + trail * 0.55);
        (pulse.mesh.material as THREE.MeshBasicMaterial).opacity = 0.55 + trail * 0.45;
      }

      // Dust orbit around hub
      const dustAttr = dustGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i += 1) {
        const angle = elapsed * 0.35 + i * 0.4;
        const r = 0.35 + (i % 5) * 0.12;
        dustAttr.array[i * 3] = Math.cos(angle) * r;
        dustAttr.array[i * 3 + 1] = Math.sin(angle) * r;
        dustAttr.array[i * 3 + 2] = Math.sin(elapsed * 0.5 + i) * 0.25;
      }
      dustAttr.needsUpdate = true;

      orbitRing.rotation.z = elapsed * 0.04;

      camera.position.x = pointer.x * 0.3;
      camera.position.y = -pointer.y * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      pointerTarget.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      container.removeChild(renderer.domElement);

      pulseGeo.dispose();
      hubCore.geometry.dispose();
      (hubCore.material as THREE.Material).dispose();
      hubGlow.geometry.dispose();
      (hubGlow.material as THREE.Material).dispose();
      hubRing.geometry.dispose();
      (hubRing.material as THREE.Material).dispose();
      hubRing2.geometry.dispose();
      (hubRing2.material as THREE.Material).dispose();
      (orbitRing.material as THREE.Material).dispose();

      for (const platform of platforms) {
        platform.core.geometry.dispose();
        (platform.core.material as THREE.Material).dispose();
        platform.ring.geometry.dispose();
        (platform.ring.material as THREE.Material).dispose();
      }
      for (const geo of disposables) geo.dispose();
      for (const mat of disposableMaterials) mat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 1,
        pointerEvents: "none",
      }}
    />
  );
}
