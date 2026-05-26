"use client";

import { Macros } from "@/lib/types";

interface MacroRingProps {
  macros: Macros;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

function Ring({
  value,
  max,
  color,
  size,
  label,
  unit,
}: {
  value: number;
  max: number;
  color: string;
  size: number;
  label: string;
  unit: string;
}) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = circumference * pct;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="6"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>
            {Math.round(value)}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

export default function MacroRing({ macros, size = "md", showLabels = true }: MacroRingProps) {
  const ringSize = size === "sm" ? 52 : size === "lg" ? 80 : 64;

  return (
    <div className="flex items-center justify-around gap-2">
      <Ring
        value={macros.calories}
        max={GOALS.calories}
        color="#f97316"
        size={ringSize}
        label="kcal"
        unit="kcal"
      />
      <Ring
        value={macros.protein}
        max={GOALS.protein}
        color="#3b82f6"
        size={ringSize}
        label="protein"
        unit="g"
      />
      <Ring
        value={macros.carbs}
        max={GOALS.carbs}
        color="#eab308"
        size={ringSize}
        label="carbs"
        unit="g"
      />
      <Ring
        value={macros.fat}
        max={GOALS.fat}
        color="#a855f7"
        size={ringSize}
        label="fat"
        unit="g"
      />
    </div>
  );
}
