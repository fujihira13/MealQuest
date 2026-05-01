import React from "react";

interface Props {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

export const CircularProgress: React.FC<Props> = ({
  value,
  size = 80,
  strokeWidth = 8,
  color = "#4caf50",
  trackColor = "#e8eae8",
  label,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clampedValue / 100) * circumference;
  const center = size / 2;

  return (
    <div className="circular-progress-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="circular-progress-label">
        <span className="circular-progress-pct">{clampedValue}%</span>
        {label && <span className="circular-progress-sub">{label}</span>}
      </div>
    </div>
  );
};
