"use client";

import { Macros } from "@/lib/types";

interface DailySummaryProps {
  macros: Macros;
  entryCount: number;
}

const GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

function Bar({
  value,
  max,
  color,
  label,
  unit,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  unit: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const over = value > max;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm">
          <span className={`font-bold ${over ? "text-red-500" : color}`}>{Math.round(value)}</span>
          <span className="text-gray-400 text-xs"> / {max} {unit}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-400" : ""}`}
          style={{
            width: `${pct}%`,
            backgroundColor: over ? undefined : color,
          }}
        />
      </div>
    </div>
  );
}

export default function DailySummary({ macros, entryCount }: DailySummaryProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Today&apos;s summary</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {entryCount} meal{entryCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Calorie hero */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 text-center">
        <p className="text-5xl font-black text-orange-500">{Math.round(macros.calories)}</p>
        <p className="text-sm text-gray-500 mt-1">
          of {GOALS.calories} kcal goal
          {macros.calories > GOALS.calories && (
            <span className="text-red-500 font-semibold"> · {Math.round(macros.calories - GOALS.calories)} over</span>
          )}
          {macros.calories <= GOALS.calories && (
            <span className="text-green-500 font-semibold"> · {Math.round(GOALS.calories - macros.calories)} remaining</span>
          )}
        </p>
      </div>

      {/* Macro bars */}
      <div className="space-y-3">
        <Bar value={macros.protein} max={GOALS.protein} color="#3b82f6" label="Protein" unit="g" />
        <Bar value={macros.carbs} max={GOALS.carbs} color="#eab308" label="Carbs" unit="g" />
        <Bar value={macros.fat} max={GOALS.fat} color="#a855f7" label="Fat" unit="g" />
      </div>

      {/* Secondary */}
      {(macros.fiber || 0) > 0 || (macros.sugar || 0) > 0 ? (
        <div className="flex gap-4 pt-1 border-t border-gray-100 text-sm">
          <div>
            <span className="text-gray-400">Fiber </span>
            <span className="font-semibold text-green-500">{Math.round(macros.fiber || 0)}g</span>
          </div>
          <div>
            <span className="text-gray-400">Sugar </span>
            <span className="font-semibold text-pink-500">{Math.round(macros.sugar || 0)}g</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
