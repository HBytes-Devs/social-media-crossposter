import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useNavigate } from "react-router-dom";

const FONT_SANS =
  '"Figtree", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const FONT_HEADING =
  '"Stolzl", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

const STEP_M2 = "clamp(0.8rem, 0.7863rem + 0.0687vi, 0.84375rem)";
const STEP_0 = "clamp(1rem, 0.9565rem + 0.2174vi, 1.125rem)";
const STEP_1 = "clamp(1.25rem, 1.1632rem + 0.4341vi, 1.5rem)";
const SPACE_2 = "clamp(0.75rem, 0.7109rem + 0.1953vi, 0.875rem)";

const CDN = "https://buffer.com/cdn-cgi/image";
const TILE = `${CDN}/width=96,quality=75,format=auto/img/homepage/integration-tiles`;

const RAISED =
  "0 0.25rem 0.75rem -0.125rem rgba(23,23,23,0.10), 0 0 0.0625rem 0.0625rem rgba(23,23,23,0.05)";
const BRAND_DARK = "#213130";
const NEUTRAL_700 = "#646464";

const iconClass =
  "!size-8 ![block-size:2rem] ![inline-size:2rem] min-[84rem]:!size-10 min-[84rem]:![block-size:2.5rem] min-[84rem]:![inline-size:2.5rem]";

function ChannelSvg({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={iconClass}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden
      style={{ color }}
    >
      {children}
    </svg>
  );
}

type FloatTile = {
  id: string;
  x: number;
  y: number;
  size?: number;
  src?: string;
  icon?: ReactNode;
};

/** Rest positions — left/right clusters around centered copy */
const FLOATS: FloatTile[] = [
  { id: "canva", src: `${TILE}/canva.webp`, x: -38, y: -28 },
  { id: "claude", src: `${TILE}/claude.webp`, x: -28, y: -8 },
  { id: "onedrive", src: `${TILE}/onedrive.webp`, x: -42, y: 8 },
  { id: "gdrive", src: `${TILE}/google-drive.webp`, x: -32, y: 28 },
  { id: "dropbox", src: `${TILE}/dropbox.webp`, x: -30, y: -34 },
  { id: "cursor", src: `${TILE}/cursor.webp`, x: 36, y: -26 },
  { id: "chatgpt", src: `${TILE}/chatgpt.webp`, x: 28, y: -6 },
  { id: "unsplash", src: `${TILE}/unsplash.webp`, x: 42, y: 10 },
  { id: "zapier", src: `${TILE}/zapier.webp`, x: 30, y: 30 },
  {
    id: "x",
    x: -34,
    y: 14,
    icon: (
      <ChannelSvg color="#000">
        <path
          fill="currentColor"
          d="M13.903 10.469 21.348 2h-1.764l-6.465 7.353L7.955 2H2l7.808 11.12L2 22h1.764l6.828-7.765L16.044 22H22l-8.097-11.531Zm-2.417 2.748-.791-1.107L4.4 3.3h2.71l5.08 7.11.791 1.107 6.604 9.242h-2.71l-5.389-7.542Z"
        />
      </ChannelSvg>
    ),
  },
  {
    id: "linkedin",
    x: -36,
    y: -16,
    icon: (
      <ChannelSvg color="#0A66C2">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M18.338 18.338H15.67v-4.177c0-.997-.018-2.278-1.387-2.278-1.39 0-1.602 1.085-1.602 2.206v4.25h-2.668v-8.59h2.561v1.173h.036c.356-.675 1.227-1.388 2.526-1.388 2.703 0 3.202 1.78 3.202 4.092v4.712ZM7.004 8.574a1.548 1.548 0 1 1 0-3.097 1.548 1.548 0 0 1 0 3.097ZM5.67 18.338h2.67v-8.59h-2.67v8.59ZM19.668 3H4.328C3.597 3 3 3.581 3 4.297v15.404C3 20.418 3.596 21 4.329 21h15.339c.734 0 1.332-.582 1.332-1.299V4.297C21 3.581 20.402 3 19.668 3Z"
        />
      </ChannelSvg>
    ),
  },
  {
    id: "instagram",
    x: -14,
    y: 34,
    icon: (
      <ChannelSvg color="#E4405F">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M20.387 3.653C19.34 2.565 17.847 2 16.153 2H7.847C4.339 2 2 4.339 2 7.847v8.266c0 1.734.565 3.226 1.694 4.314C4.782 21.476 6.234 22 7.887 22h8.226c1.734 0 3.185-.564 4.234-1.573C21.435 19.38 22 17.887 22 16.153V7.847c0-1.694-.564-3.145-1.613-4.194Zm-.161 12.5c0 1.25-.444 2.258-1.17 2.944-.725.685-1.733 1.048-2.943 1.048H7.887c-1.21 0-2.218-.363-2.943-1.048-.726-.726-1.09-1.734-1.09-2.984V7.847c0-1.21.364-2.218 1.09-2.944.685-.685 1.733-1.048 2.943-1.048h8.306c1.21 0 2.218.363 2.944 1.089.686.725 1.089 1.733 1.089 2.903v8.306Zm-1.694-9.476a1.17 1.17 0 1 1-2.339 0 1.17 1.17 0 0 1 2.339 0ZM6.838 11.96c0-2.863 2.34-5.162 5.162-5.162s5.161 2.34 5.161 5.162S14.863 17.12 12 17.12a5.146 5.146 0 0 1-5.162-5.161Zm1.855 0A3.321 3.321 0 0 0 12 15.266a3.321 3.321 0 0 0 3.306-3.306A3.321 3.321 0 0 0 12 8.653a3.321 3.321 0 0 0-3.307 3.307Z"
        />
      </ChannelSvg>
    ),
  },
  {
    id: "tiktok",
    x: -44,
    y: 24,
    icon: (
      <ChannelSvg color="#111">
        <path
          fill="currentColor"
          d="M16.1 1c.347 3.122 2.01 4.983 4.9 5.181v3.511c-1.675.172-3.142-.402-4.849-1.485v6.568c0 8.342-8.677 10.95-12.166 4.97-2.242-3.848-.87-10.6 6.322-10.87v3.702c-.548.092-1.133.237-1.668.429-1.6.567-2.507 1.63-2.255 3.505.485 3.59 6.77 4.653 6.247-2.363V1.007h3.47V1Z"
        />
      </ChannelSvg>
    ),
  },
  {
    id: "youtube",
    x: 30,
    y: -36,
    icon: (
      <ChannelSvg color="#FF0000">
        <path
          fill="currentColor"
          d="M23.76 7.148s-.234-1.68-.954-2.42c-.912-.97-1.935-.974-2.404-1.031-3.359-.247-8.397-.247-8.397-.247h-.01s-5.038 0-8.397.247c-.469.057-1.491.061-2.404 1.032-.72.74-.954 2.42-.954 2.42S0 9.12 0 11.092v1.85c0 1.971.24 3.944.24 3.944s.234 1.68.954 2.42c.913.97 2.112.939 2.646 1.04 1.92.188 8.16.246 8.16.246s5.043-.008 8.402-.255c.469-.056 1.492-.06 2.404-1.032.72-.74.954-2.42.954-2.42s.24-1.972.24-3.944v-1.85c0-1.971-.24-3.944-.24-3.944ZM9.523 15.183V8.335l6.484 3.435-6.484 3.413Z"
        />
      </ChannelSvg>
    ),
  },
  {
    id: "bluesky",
    x: 34,
    y: 16,
    icon: (
      <ChannelSvg color="#0085FF">
        <path
          fill="currentColor"
          d="M5.769 4.212C8.29 5.972 11.004 9.539 12 11.453c.996-1.914 3.709-5.482 6.231-7.241C20.051 2.942 23 1.96 23 5.086c0 .624-.385 5.244-.611 5.994-.785 2.608-3.647 3.273-6.192 2.87 4.449.704 5.58 3.035 3.136 5.366-4.642 4.426-6.672-1.111-7.192-2.53-.096-.26-.14-.382-.141-.278 0-.104-.045.018-.14.278-.52 1.419-2.55 6.956-7.193 2.53-2.445-2.331-1.313-4.662 3.136-5.366-2.545.403-5.407-.262-6.192-2.87C1.385 10.33 1 5.71 1 5.086c0-3.126 2.949-2.144 4.769-.874Z"
        />
      </ChannelSvg>
    ),
  },
  {
    id: "pinterest",
    x: 40,
    y: -12,
    icon: (
      <ChannelSvg color="#E60023">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 1C5.925 1 1 5.925 1 12c0 4.66 2.9 8.644 6.991 10.247-.096-.87-.183-2.21.039-3.16.2-.858 1.29-5.467 1.29-5.467s-.33-.659-.33-1.633c0-1.53.887-2.672 1.99-2.672.94 0 1.392.705 1.392 1.55 0 .944-.6 2.355-.91 3.662-.26 1.095.549 1.988 1.628 1.988 1.955 0 3.458-2.061 3.458-5.037 0-2.634-1.892-4.475-4.594-4.475-3.13 0-4.967 2.347-4.967 4.774 0 .945.364 1.959.818 2.51a.33.33 0 0 1 .077.315c-.084.348-.27 1.095-.306 1.248-.048.201-.16.244-.368.147-1.374-.64-2.233-2.648-2.233-4.262 0-3.47 2.521-6.656 7.268-6.656 3.816 0 6.782 2.719 6.782 6.353 0 3.791-2.39 6.842-5.708 6.842-1.115 0-2.163-.58-2.521-1.263 0 0-.552 2.1-.686 2.615-.248.955-.919 2.153-1.367 2.883 1.03.319 2.123.491 3.257.491 6.075 0 11-4.925 11-11S18.075 1 12 1Z"
        />
      </ChannelSvg>
    ),
  },
  {
    id: "threads",
    x: 14,
    y: 36,
    icon: (
      <ChannelSvg color="#000">
        <path
          fill="currentColor"
          d="M12.186 2c-3.3 0-5.9 2.1-5.9 5.4 0 2.5 1.4 4.1 3.7 4.7-.1.4-.3 1-.4 1.4-.2.8-.4 1.5-.4 2 0 2.4 1.9 4.1 4.6 4.1 2.4 0 4.1-1.5 4.1-3.6 0-1.8-1-3.1-2.7-3.8l.1-.5c1.9.5 3.3 1.9 3.3 4.1 0 3.1-2.5 5.4-5.9 5.4-3.6 0-6.1-2.4-6.1-5.8 0-1.1.3-2.2.7-3.2C5.7 11 4 8.8 4 6.1 4 2.4 7.1 0 12.186 0 17.1 0 20 2.5 20 6.1c0 2.6-1.5 4.7-3.8 5.6-.2-.6-.5-1.1-.9-1.6 1.5-.7 2.5-2.2 2.5-4 0-2.7-2.1-4.6-5.614-4.6z"
        />
      </ChannelSvg>
    ),
  },
  {
    id: "facebook",
    x: 44,
    y: 28,
    icon: (
      <ChannelSvg color="#1877F2">
        <path
          fill="currentColor"
          d="M23 12.067C23 5.955 18.075 1 12 1S1 5.955 1 12.067C1 17.591 5.023 22.17 10.281 23v-7.734H7.488v-3.199h2.793V9.63c0-2.774 1.643-4.306 4.155-4.306 1.204 0 2.462.216 2.462.216v2.724h-1.387c-1.366 0-1.792.853-1.792 1.728v2.076h3.05l-.487 3.2h-2.563V23C18.977 22.17 23 17.591 23 12.067Z"
        />
      </ChannelSvg>
    ),
  },
];

function HeroFloatField({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const homeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const moveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; ox: number; oy: number; phase: number }>
  >([]);
  const mouseRef = useRef({ x: 0, y: 0, sx: 0, sy: 0, active: 0, inside: false });
  const rafRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MAX_PULL = 36;
    const ACTIVATION = 240;
    const STIFFNESS = 140;
    const DAMPING = 22;
    const MOUSE_SMOOTH = 14;
    const IDLE_AMP = 1.6;
    const IDLE_SPEED = 0.45;

    stateRef.current = FLOATS.map((_, i) => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ox: 0,
      oy: 0,
      phase: i * 0.73,
    }));

    const measure = () => {
      stateRef.current.forEach((s, i) => {
        const el = homeRefs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        s.ox = r.left + r.width / 2;
        s.oy = r.top + r.height / 2;
      });
    };

    const section = sectionRef.current;
    if (!section) return;

    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.inside = true;
    };
    const onLeave = () => {
      mouseRef.current.inside = false;
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerenter", onMove);
    section.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });

    moveRefs.current.forEach((node, i) => {
      if (!node) return;
      node.style.willChange = "transform";
      node.style.transition = "none";
      node.style.opacity = "0";
      requestAnimationFrame(() => {
        node.style.transition = `opacity .6s cubic-bezier(.22,1,.36,1) ${i * 0.04}s`;
        node.style.opacity = "1";
        window.setTimeout(() => {
          node.style.transition = "none";
        }, 600 + i * 40);
      });
    });

    const softFalloff = (dist: number, radius: number) => {
      if (dist >= radius) return 0;
      const t = 1 - dist / radius;
      const s = t * t * (3 - 2 * t);
      return s * s;
    };

    let last = performance.now();
    const t0 = last;

    const tick = (now: number) => {
      const rawDt = (now - last) / 1000;
      const dt = Math.min(0.033, Math.max(0.001, rawDt));
      last = now;
      const t = (now - t0) / 1000;
      const mouse = mouseRef.current;

      const presenceTarget = mouse.inside ? 1 : 0;
      mouse.active += (presenceTarget - mouse.active) * Math.min(1, 8 * dt);
      if (mouse.active < 0.001) mouse.active = 0;

      if (mouse.inside || mouse.active > 0) {
        const k = 1 - Math.exp(-MOUSE_SMOOTH * dt);
        mouse.sx += (mouse.x - mouse.sx) * k;
        mouse.sy += (mouse.y - mouse.sy) * k;
      }

      FLOATS.forEach((_, i) => {
        const s = stateRef.current[i];
        const node = moveRefs.current[i];
        if (!s || !node) return;

        let targetX = 0;
        let targetY = 0;

        if (!reduceMotion && mouse.active > 0.01) {
          const dx = mouse.sx - s.ox;
          const dy = mouse.sy - s.oy;
          const dist = Math.hypot(dx, dy) || 1;
          const falloff = softFalloff(dist, ACTIVATION) * mouse.active;
          if (falloff > 0) {
            const force = falloff * MAX_PULL;
            targetX = (dx / dist) * force;
            targetY = (dy / dist) * force;
          }
        }

        if (!reduceMotion) {
          const pullMag = Math.hypot(targetX, targetY);
          const idleScale =
            (1 - Math.min(1, pullMag / MAX_PULL) * 0.9) * (1 - mouse.active * 0.35);
          targetX += Math.sin(t * IDLE_SPEED + s.phase) * IDLE_AMP * idleScale;
          targetY += Math.cos(t * (IDLE_SPEED * 0.85) + s.phase * 1.1) * IDLE_AMP * idleScale;
        }

        const ax = (targetX - s.x) * STIFFNESS - s.vx * DAMPING;
        const ay = (targetY - s.y) * STIFFNESS - s.vy * DAMPING;
        s.vx += ax * dt;
        s.vy += ay * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        if (Math.abs(s.vx) < 0.01 && Math.abs(s.x - targetX) < 0.02) {
          s.vx = 0;
          s.x = targetX;
        }
        if (Math.abs(s.vy) < 0.01 && Math.abs(s.y - targetY) < 0.02) {
          s.vy = 0;
          s.y = targetY;
        }

        node.style.transform = `translate3d(${s.x}px,${s.y}px,0)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    measure();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerenter", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      cancelAnimationFrame(rafRef.current);
    };
  }, [sectionRef]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:!block"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundColor: "#fefdfb",
          backgroundImage: [
            "linear-gradient(to top, #fefdfb 0, transparent 12%, transparent 88%, #fefdfb 100%)",
            "linear-gradient(to right, #fefdfb 0, transparent 18%, transparent 82%, #fefdfb 100%)",
            "linear-gradient(#f1f1ea 1px, transparent 1px)",
            "linear-gradient(90deg, #f1f1ea 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "100% 100%, 100% 100%, 3rem 3rem, 3rem 3rem",
        }}
      />

      {FLOATS.map((f, i) => {
        const size = f.size ?? 48;
        const style: CSSProperties = {
          top: `calc(50% + ${f.y}%)`,
          left: `calc(50% + ${f.x}%)`,
          width: size,
          height: size,
          marginTop: -size / 2,
          marginLeft: -size / 2,
        };
        return (
          <div
            key={f.id}
            ref={(node) => {
              homeRefs.current[i] = node;
            }}
            className="absolute"
            style={style}
          >
            <div
              ref={(node) => {
                moveRefs.current[i] = node;
              }}
              className={[
                "grid size-full place-items-center rounded-[0.25rem] !bg-[#fefdfb]",
                "opacity-60 will-change-transform",
              ].join(" ")}
              style={{ boxShadow: RAISED }}
            >
              {f.icon ? (
                f.icon
              ) : (
                <img
                  src={f.src}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                  className={`${iconClass} rounded-[0.25rem] object-contain`}
                  style={{ color: "transparent" }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Hero — pure Tailwind (pre side-rail revision restored).
 */
export function LandingHero() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const sectionRef = useRef<HTMLElement | null>(null);

  const go = (e?: FormEvent) => {
    e?.preventDefault();
    const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
    navigate(`/register${q}`);
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      className={[
        "relative !overflow-hidden text-center",
        "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)] !leading-[1.4]",
        "tracking-[0.0075em] text-[#213130]",
      ].join(" ")}
      style={{
        fontFamily: FONT_SANS,
        fontSize: STEP_0,
        letterSpacing: "0.0075em",
        lineHeight: 1.4,
        backgroundColor: "#fefdfb",
      }}
    >
      <h1 className="sr-only">SMC</h1>

      <HeroFloatField sectionRef={sectionRef} />

      <div
        className={[
          "relative z-[2] mx-auto grid w-full max-w-[93.5rem] place-items-center",
          "px-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
          /* Shorter bottom pad on small screens (no float field below md) */
          "![padding-block:3.5rem_4.5rem]",
          "md:![padding-block:4.5rem_7rem]",
          "min-[84rem]:![padding-block:5rem_11rem]",
        ].join(" ")}
      >
        <p
          className={[
            "mx-auto mt-0 max-w-[20ch] text-[#213130]",
            "![margin-block-end:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
            "![font-size:clamp(2.44375rem,2.0551rem+1.9315vi,3.55rem)]",
            "md:![font-size:clamp(3.05rem,2.4663rem+2.9271vi,4.7375rem)]",
            "!font-normal !leading-[1.1] !tracking-[-0.02em]",
            "![font-family:Stolzl,ui-sans-serif,system-ui,sans-serif]",
          ].join(" ")}
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBlockEnd: "clamp(1rem, 0.9609rem + 0.1953vi, 1.125rem)",
            maxInlineSize: "20ch",
          }}
        >
          Your social media workspace
        </p>

        <p
          className={[
            "mx-auto mt-0 max-w-[60ch] text-[#213130]",
            "![margin-block-end:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
            "![padding-block:clamp(0.75rem,0.7109rem+0.1953vi,0.875rem)]",
            "![font-size:clamp(1.25rem,1.1632rem+0.4341vi,1.5rem)]",
            "!font-normal !leading-[1.4] !tracking-[0.0075em]",
          ].join(" ")}
          style={{
            fontFamily: FONT_SANS,
            fontSize: STEP_1,
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: "0.0075em",
            marginBlockEnd: "clamp(1rem, 0.9609rem + 0.1953vi, 1.125rem)",
            paddingBlock: "clamp(0.75rem, 0.7109rem + 0.1953vi, 0.875rem)",
            maxInlineSize: "60ch",
          }}
        >
          Connected to every platform and tool you use.
        </p>

        <form
          onSubmit={go}
          className="!mx-auto !flex w-full max-w-[22rem] !flex-col !items-center !text-center md:!max-w-none md:!w-auto"
          noValidate
        >
          <label className="sr-only" htmlFor="smc-hero-email">
            Enter your email
          </label>

          <div
            className={[
              "!flex w-full !flex-col !items-stretch !justify-center",
              "![gap:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
              "md:!flex-row md:!items-center md:!gap-0",
              "md:!rounded-full md:!border md:!border-solid md:!border-[#646464]",
              "md:!bg-[#fefdfb] md:!p-1",
              "md:![box-shadow:0_0.25rem_0.75rem_-0.125rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]",
            ].join(" ")}
          >
            <input
              id="smc-hero-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={[
                "w-full min-w-0 flex-1 !rounded-full !border !border-solid !border-[#646464]",
                "!bg-white !text-[#213130] !outline-none",
                "![padding:1em_1.5em]",
                "![box-shadow:0_0.25rem_0.75rem_-0.125rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]",
                "placeholder:!text-[#646464]",
                "focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#213130]",
                "md:!border-0 md:!bg-transparent md:![box-shadow:none]",
                "md:!min-w-[16rem] lg:!min-w-[24rem]",
                "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)] !leading-[1.4] !tracking-[0.0075em]",
              ].join(" ")}
              style={{
                fontFamily: FONT_SANS,
                fontSize: STEP_0,
                letterSpacing: "0.0075em",
                lineHeight: 1.4,
                color: BRAND_DARK,
              }}
            />

            <button
              type="submit"
              className={[
                "group/cta relative !inline-flex w-full !shrink-0",
                "!rounded-full !border-0 !bg-transparent !p-0",
                "!text-[#213130] !outline-none",
                "focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#213130]",
                "md:!w-auto",
              ].join(" ")}
              style={{ color: BRAND_DARK }}
            >
              <span
                className={[
                  "!inline-flex w-full !items-center !justify-center",
                  "!rounded-full !border !border-solid !border-[#b0ec9c] !bg-[#b0ec9c]",
                  "![column-gap:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
                  "![padding-block:1em] ![padding-inline:1.25em_1em]",
                  "transition-[background-color,border-color] duration-150 ease-out",
                  "group-hover/cta:!border-[#90d788] group-hover/cta:!bg-[#90d788]",
                  "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)] !font-normal",
                  "!leading-[1.4] !tracking-[0.0075em] !text-[#213130]",
                ].join(" ")}
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: STEP_0,
                  fontWeight: 400,
                  letterSpacing: "0.0075em",
                  lineHeight: 1.4,
                  color: BRAND_DARK,
                }}
              >
                Get started for free
                <svg
                  className="!size-5 ![block-size:1.25rem] ![inline-size:1.25rem] shrink-0 transition-transform duration-150 ease-out group-hover/cta:-rotate-45"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M11.47 4.47a.75.75 0 0 1 1.06 0l7 7a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 1 1-1.06-1.06l5.72-5.72H5a.75.75 0 0 1 0-1.5h12.19l-5.72-5.72a.75.75 0 0 1 0-1.06Z"
                  />
                </svg>
              </span>
            </button>
          </div>

          <p
            className={[
              "!mb-0 !max-w-[25ch] !text-center !text-[#646464]",
              "![margin-block-start:clamp(0.75rem,0.7109rem+0.1953vi,0.875rem)]",
              "md:!max-w-full md:![padding-inline-start:clamp(1.5rem,1.4414rem+0.293vi,1.6875rem)]",
              "![font-size:clamp(0.8rem,0.7863rem+0.0687vi,0.84375rem)]",
              "!font-normal !leading-[1.4] !tracking-[0.0075em]",
            ].join(" ")}
            style={{
              fontFamily: FONT_SANS,
              fontSize: STEP_M2,
              lineHeight: 1.4,
              letterSpacing: "0.0075em",
              color: NEUTRAL_700,
              marginBlockStart: SPACE_2,
            }}
          >
            By entering your email, you agree to receive emails from SMC.
          </p>
        </form>
      </div>
    </section>
  );
}
