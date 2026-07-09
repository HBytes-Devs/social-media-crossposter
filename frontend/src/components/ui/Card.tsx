import type { ReactNode } from "react";

export function Card({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-800 bg-slate-900/60 p-6 ${className}`}
    >
      {(title || description) && (
        <header className="mb-5">
          {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
