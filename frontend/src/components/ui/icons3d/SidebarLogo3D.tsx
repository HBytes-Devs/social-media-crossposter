import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createFrameClock } from "../../../lib/threeFrameClock";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Tiny Three.js SMC gem for sidebar header */
export function SidebarLogo3D({ size = 40 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.72, 0),
      new THREE.MeshBasicMaterial({
        color: 0x4b5fff,
        transparent: true,
        opacity: 0.95,
      }),
    );
    scene.add(gem);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0x8c6bff,
        transparent: true,
        opacity: 0.14,
      }),
    );
    scene.add(glow);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.88, 0.03, 6, 32),
      new THREE.MeshBasicMaterial({
        color: 0x7c8cff,
        transparent: true,
        opacity: 0.55,
      }),
    );
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    const animateMotion = !prefersReducedMotion();
    let frameId = 0;
    const clock = createFrameClock();

    function animate() {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (animateMotion) {
        gem.rotation.x = 0.45 + t * 0.55;
        gem.rotation.y = t * 0.7;
        ring.rotation.z = t * 0.35;
        glow.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06);
      }
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      container.removeChild(renderer.domElement);
      gem.geometry.dispose();
      (gem.material as THREE.Material).dispose();
      glow.geometry.dispose();
      (glow.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        filter: "drop-shadow(0 6px 14px rgba(75,95,255,0.45))",
      }}
    />
  );
}
