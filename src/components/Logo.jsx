// Flat Ambient mark: faded accent ring, accent orb, waveform bars in the page background color.
const BARS = [
  { x: -13, y: -3.5, h: 7, o: 0.5 },
  { x: -8.5, y: -6.5, h: 13, o: 0.7 },
  { x: -4, y: -8.5, h: 17, o: 0.85 },
  { x: 0.5, y: -10.5, h: 21, o: 1 },
  { x: 5, y: -8.5, h: 17, o: 0.85 },
  { x: 9.5, y: -6.5, h: 13, o: 0.7 },
  { x: 14, y: -3.5, h: 7, o: 0.5 },
];

function Logo({ size = 30, ringWidth = 1, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 46 46"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="23"
        cy="23"
        r="22"
        fill="none"
        strokeWidth={ringWidth}
        style={{ stroke: "var(--color-accent)", opacity: 0.45 }}
      />
      <circle cx="23" cy="23" r="16" style={{ fill: "var(--color-accent)" }} />
      <g transform="translate(21,23)" style={{ fill: "var(--color-bg)" }}>
        {BARS.map((b) => (
          <rect
            key={b.x}
            x={b.x}
            y={b.y}
            width="3"
            height={b.h}
            rx="1.5"
            opacity={b.o}
          />
        ))}
      </g>
    </svg>
  );
}

export default Logo;
