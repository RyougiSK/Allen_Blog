"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
}

export function Sparkline({
  data,
  width = 200,
  height = 40,
  color = "var(--color-accent-warm)",
  fillColor = "var(--color-accent-warm)",
}: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const padding = 2;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const fillPath = `${linePath} L ${padding + effectiveWidth},${padding + effectiveHeight} L ${padding},${padding + effectiveHeight} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sparkFill)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
