"use client";

import { useEffect, useId, useState } from "react";

export function HeroNetworkBackground() {
  const uid = useId().replace(/:/g, "");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(Boolean(mql?.matches));
    onChange();
    mql?.addEventListener?.("change", onChange);
    return () => mql?.removeEventListener?.("change", onChange);
  }, []);

  const particleDur = reduceMotion ? "0s" : "3.8s";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(255 255 255)" stopOpacity="0.12" />
            <stop offset="35%" stopColor="rgb(209 0 0)" stopOpacity="0.26" />
            <stop offset="100%" stopColor="rgb(255 255 255)" stopOpacity="0.12" />
          </linearGradient>
          <filter id={`glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.35" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 0.8 0 0 0
                0 0 0.6 0 0
                0 0 0 0.6 0"
              result="color"
            />
            <feMerge>
              <feMergeNode in="color" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Directed paths: pros -> network -> work */}
          <path id={`p1-${uid}`} d="M 12 62 C 22 54, 28 50, 36 46" />
          <path id={`p2-${uid}`} d="M 12 62 C 22 70, 30 74, 38 78" />
          <path id={`p3-${uid}`} d="M 36 46 C 46 42, 56 44, 64 48" />
          <path id={`p4-${uid}`} d="M 38 78 C 48 70, 56 64, 64 58" />
          <path id={`p5-${uid}`} d="M 64 48 C 74 46, 84 42, 92 36" />
          <path id={`p6-${uid}`} d="M 64 58 C 74 60, 84 62, 92 64" />

          <path
            id={`headline-${uid}`}
            d="M 10 22 C 28 14, 50 12, 90 16"
          />
        </defs>

        {/* soft wash */}
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={`url(#grad-${uid})`}
          opacity="0.045"
        />

        {/* network lines */}
        <g
          stroke={`url(#grad-${uid})`}
          strokeWidth="0.55"
          fill="none"
          opacity="0.55"
        >
          <use href={`#p1-${uid}`} />
          <use href={`#p2-${uid}`} />
          <use href={`#p3-${uid}`} />
          <use href={`#p4-${uid}`} />
          <use href={`#p5-${uid}`} />
          <use href={`#p6-${uid}`} />
        </g>

        {/* nodes (3 clusters: pros / network / work) */}
        <g filter={`url(#glow-${uid})`}>
          {/* pros cluster */}
          <circle cx="12" cy="62" r="2.1" fill="rgb(209 0 0)" opacity="0.16" />
          <circle cx="15" cy="58" r="1.2" fill="rgb(255 255 255)" opacity="0.12" />
          <circle cx="16" cy="66" r="1.1" fill="rgb(255 255 255)" opacity="0.10" />

          {/* network hub */}
          <circle cx="36" cy="46" r="1.6" fill="rgb(255 255 255)" opacity="0.12" />
          <circle cx="38" cy="78" r="1.6" fill="rgb(255 255 255)" opacity="0.12" />
          <circle cx="64" cy="52" r="2.4" fill="rgb(209 0 0)" opacity="0.14" />
          <circle cx="60" cy="47" r="1.1" fill="rgb(255 255 255)" opacity="0.10" />
          <circle cx="61" cy="59" r="1.1" fill="rgb(255 255 255)" opacity="0.10" />

          {/* work / clients cluster */}
          <circle cx="92" cy="36" r="2.2" fill="rgb(255 255 255)" opacity="0.14" />
          <circle cx="92" cy="64" r="2.2" fill="rgb(255 255 255)" opacity="0.14" />
          <circle cx="88" cy="50" r="1.1" fill="rgb(209 0 0)" opacity="0.12" />
        </g>

        {/* moving "leads" particles */}
        {!reduceMotion ? (
          <g opacity="0.7">
            {[
              { path: `#p1-${uid}`, delay: "0s" },
              { path: `#p2-${uid}`, delay: "0.8s" },
              { path: `#p3-${uid}`, delay: "0.3s" },
              { path: `#p4-${uid}`, delay: "1.1s" },
              { path: `#p5-${uid}`, delay: "0.6s" },
              { path: `#p6-${uid}`, delay: "1.4s" },
            ].map((p, i) => (
              <circle key={i} r="0.7" fill="rgb(209 0 0)" opacity="0.45">
                <animateMotion
                  dur={particleDur}
                  repeatCount="indefinite"
                  begin={p.delay}
                  keyTimes="0;1"
                  keySplines="0.4 0 0.2 1"
                  calcMode="spline"
                  path={undefined}
                >
                  <mpath href={p.path} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0.15;0.55;0.15"
                  dur="1.9s"
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        ) : null}

        {/* background tagline removed per design */}
      </svg>

      {/* subtle background glow drift */}
      <div className={reduceMotion ? "" : "network-drift absolute inset-0"} />

      <style jsx>{`
        :global(.network-drift) {
          background: radial-gradient(
              720px 360px at 22% 52%,
              rgba(255, 106, 26, 0.06),
              transparent 58%
            ),
            radial-gradient(
              760px 420px at 70% 42%,
              rgba(255, 255, 255, 0.05),
              transparent 62%
            ),
            radial-gradient(
              720px 460px at 86% 68%,
              rgba(255, 106, 26, 0.04),
              transparent 64%
            );
          mix-blend-mode: screen;
          animation: network-drift 12s ease-in-out infinite;
          opacity: 0.6;
        }

        @keyframes network-drift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-1.2%, 0.9%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

