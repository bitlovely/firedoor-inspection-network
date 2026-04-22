"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useMemo, useState } from "react";

type Node = { x: number; y: number; r: number; phase: number };
type Link = { a: number; b: number; opacity: number };

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

  const { nodes, links } = useMemo(() => {
    const rand = mulberry32(1337);
    // Spread activity across the entire hero.
    const n = 24;
    const nodes: Node[] = Array.from({ length: n }, () => ({
      x: 6 + rand() * 88,
      y: 10 + rand() * 80,
      r: 1.1 + rand() * 1.7,
      phase: rand(),
    }));

    const links: Link[] = [];
    for (let i = 0; i < nodes.length; i += 1) {
      // connect each node to 2-3 nearest neighbors (in normalized 0..100 space)
      const distances = nodes
        .map((p, j) => {
          const dx = p.x - nodes[i].x;
          const dy = p.y - nodes[i].y;
          return { j, d: dx * dx + dy * dy };
        })
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2 + Math.floor(rand() * 2));

      for (const { j } of distances) {
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        if (links.some((l) => l.a === a && l.b === b)) continue;
        links.push({ a, b, opacity: 0.12 + rand() * 0.18 });
      }
    }

    return { nodes, links };
  }, []);

  const dur = reduceMotion ? "0s" : "5.8s";

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
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(255 106 26)" stopOpacity="0.5" />
            <stop offset="55%" stopColor="rgb(255 255 255)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="rgb(255 106 26)" stopOpacity="0.34" />
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
          <path
            id={`curve-${uid}`}
            d="M -10 78 C 12 68, 34 70, 54 60 C 72 50, 88 44, 110 34"
          />
        </defs>

        {/* soft wash */}
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={`url(#grad-${uid})`}
          opacity="0.06"
        />

        {/* network (lines + spots drift together) */}
        <g className={reduceMotion ? "" : "network-group"}>
          <g stroke={`url(#grad-${uid})`} strokeWidth="0.35">
            {links.map((l, idx) => {
              const a = nodes[l.a];
              const b = nodes[l.b];
              return (
                <line
                  key={`${l.a}-${l.b}-${idx}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  opacity={l.opacity}
                  className={reduceMotion ? "" : "network-line"}
                  style={
                    reduceMotion
                      ? undefined
                      : ({
                          animationDelay: `${(idx % 9) * 0.22}s`,
                        } as CSSProperties)
                  }
                />
              );
            })}
          </g>

          <g filter={`url(#glow-${uid})`}>
            {nodes.map((n, idx) => (
              <circle
                key={idx}
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill="rgb(255 106 26)"
                opacity={0.14}
                className={reduceMotion ? "" : "network-node"}
                style={
                  reduceMotion
                    ? undefined
                    : ({
                        animationDelay: `${n.phase * 2.2}s`,
                      } as CSSProperties)
                }
              />
            ))}
          </g>
        </g>

        {/* message */}
        <g opacity="0.16">
          <text
            fill="white"
            fontSize="3.2"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"
            letterSpacing="0.6"
          >
            <textPath href={`#curve-${uid}`} startOffset="0%">
              This website is a network • This website is a network • This website
              is a network •
            </textPath>
            {!reduceMotion ? (
              <animate
                attributeName="opacity"
                values="0.08;0.16;0.08"
                dur={dur}
                repeatCount="indefinite"
              />
            ) : null}
          </text>
        </g>
      </svg>

      {/* subtle parallax drift so it reads as “alive” */}
      <div className={reduceMotion ? "" : "network-drift absolute inset-0"} />

      <style jsx>{`
        :global(.network-drift) {
          background: radial-gradient(
              740px 340px at 18% 26%,
              rgba(255, 106, 26, 0.08),
              transparent 55%
            ),
            radial-gradient(
              560px 280px at 78% 22%,
              rgba(255, 255, 255, 0.06),
              transparent 60%
            ),
            radial-gradient(
              820px 420px at 55% 58%,
              rgba(255, 106, 26, 0.055),
              transparent 58%
            ),
            radial-gradient(
              560px 320px at 26% 78%,
              rgba(255, 255, 255, 0.045),
              transparent 60%
            ),
            radial-gradient(
              900px 420px at 84% 78%,
              rgba(255, 106, 26, 0.045),
              transparent 62%
            );
          mix-blend-mode: screen;
          animation: network-drift 11s ease-in-out infinite;
          opacity: 0.55;
        }

        :global(.network-node) {
          transform-origin: center;
          animation: node-soft 6.2s ease-in-out infinite;
        }

        :global(.network-line) {
          animation: line-fade 6.2s ease-in-out infinite;
        }

        :global(.network-group) {
          transform-origin: center;
          animation: network-sway 10.5s ease-in-out infinite;
        }

        @keyframes node-soft {
          0% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.16;
            transform: scale(1.08);
          }
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
        }

        @keyframes line-fade {
          0% {
            opacity: 0.06;
          }
          50% {
            opacity: 0.14;
          }
          100% {
            opacity: 0.06;
          }
        }

        @keyframes network-sway {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-0.8%, 0.5%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes network-drift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-2%, 1.5%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

