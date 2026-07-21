import { useEffect, useRef, type CSSProperties } from "react";
import { createCyberOcean } from "../../lib/cyber-ocean/createCyberOcean.js";

type Props = {
  /** Holographic dolphin + wake. Off for dashboard. */
  showDolphin?: boolean;
  /** Orbit drag / scroll zoom. Off behind UI so forms stay usable. */
  interactive?: boolean;
  /** Override seabed particle count (lower = cheaper). */
  seabedParticles?: number;
  /** Canvas pointer events — usually false on dashboard. */
  pointerEvents?: "auto" | "none";
  className?: string;
  style?: CSSProperties;
};

/**
 * Shared Cyber Ocean WebGL plane (wormhole · flow · seabed · post FX).
 */
export function CyberOceanBackground({
  showDolphin = true,
  interactive = true,
  seabedParticles,
  pointerEvents = "auto",
  className,
  style,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let destroyed = false;
    let handle: { destroy: () => void } | null = null;

    createCyberOcean(canvas, wrap, {
      showDolphin,
      interactive,
      seabedParticles,
    })
      .then((api) => {
        if (destroyed) {
          api.destroy();
          return;
        }
        handle = api;
      })
      .catch((err) => {
        console.error("[CyberOceanBackground] failed to start:", err);
      });

    return () => {
      destroyed = true;
      handle?.destroy();
    };
  }, [showDolphin, interactive, seabedParticles]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents,
        background: "#010126",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          outline: "none",
        }}
      />
    </div>
  );
}
