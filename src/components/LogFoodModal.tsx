"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { FoodEntry, FoodItem } from "@/lib/types";
import { computeTotalMacros } from "@/lib/storage";
import PhotoUpload from "./PhotoUpload";
import MacroEditor from "./MacroEditor";

interface LogFoodModalProps {
  onClose: () => void;
  onSave: (entry: FoodEntry) => void;
}

type Step = "upload" | "analyzing" | "review";

export default function LogFoodModal({ onClose, onSave }: LogFoodModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [photos, setPhotos] = useState<string[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const analyzePhotos = async () => {
    if (photos.length === 0) return;
    setStep("analyzing");
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: photos }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      const items: FoodItem[] = (data.foods || []).map((f: {
        name: string;
        servingSize: string;
        macros: { calories: number; protein: number; carbs: number; fat: number; fiber?: number; sugar?: number };
      }) => ({
        id: crypto.randomUUID(),
        name: f.name,
        servingSize: f.servingSize,
        macros: {
          calories: f.macros.calories,
          protein: f.macros.protein,
          carbs: f.macros.carbs,
          fat: f.macros.fat,
          fiber: f.macros.fiber || 0,
          sugar: f.macros.sugar || 0,
        },
      }));

      setFoods(items);
      if (data.notes) setNotes(data.notes);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("upload");
    }
  };

  const handleSave = () => {
    const entry: FoodEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      photos,
      foods,
      notes: notes || undefined,
      totalMacros: computeTotalMacros({ foods } as FoodEntry),
    };
    onSave(entry);
  };

  const totalCalories = foods.reduce((sum, f) => sum + f.macros.calories, 0);
  const totalProtein = foods.reduce((sum, f) => sum + f.macros.protein, 0);
  const totalCarbs = foods.reduce((sum, f) => sum + f.macros.carbs, 0);
  const totalFat = foods.reduce((sum, f) => sum + f.macros.fat, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] flex flex-col">
        {/* Handle bar (mobile) */}
        <div className="sm:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">
              {step === "upload" && "Log a meal"}
              {step === "analyzing" && "Analyzing your food..."}
              {step === "review" && "Review & adjust"}
            </h2>
            <p className="text-sm text-gray-400">
              {step === "upload" && "Upload photos of your food"}
              {step === "analyzing" && "Claude is estimating your macros"}
              {step === "review" && "Adjust the estimates below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step: Upload */}
          {(step === "upload" || step === "review") && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Photos
              </p>
              <PhotoUpload photos={photos} onChange={setPhotos} />
            </div>
          )}

          {/* Step: Analyzing */}
          {step === "analyzing" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">Identifying food items...</p>
                <p className="text-sm text-gray-400 mt-1">This usually takes 5–10 seconds</p>
              </div>
              {photos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {photos.slice(0, 3).map((photo, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={photo}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover opacity-70"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <>
              {/* Totals banner */}
              <div className="bg-orange-50 rounded-2xl p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Estimated totals
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Calories", value: Math.round(totalCalories), unit: "kcal", color: "text-orange-500" },
                    { label: "Protein", value: Math.round(totalProtein), unit: "g", color: "text-blue-500" },
                    { label: "Carbs", value: Math.round(totalCarbs), unit: "g", color: "text-yellow-500" },
                    { label: "Fat", value: Math.round(totalFat), unit: "g", color: "text-purple-500" },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} className="bg-white rounded-xl py-2 px-1">
                      <p className={`text-lg font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400">{unit}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food items editor */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Food items
                </p>
                <MacroEditor foods={foods} onChange={setFoods} />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about your meal..."
                  rows={2}
                  className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 space-y-2">
          {step === "upload" && (
            <>
              <button
                onClick={analyzePhotos}
                disabled={photos.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Analyze with AI
              </button>
              <button
                onClick={() => { setFoods([]); setStep("review"); }}
                className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip and enter manually
              </button>
            </>
          )}

          {step === "review" && (
            <div className="flex gap-2">
              <button
                onClick={() => setStep("upload")}
                className="px-4 py-3 bg-gray-100 text-gray-600 font-semibold rounded-2xl hover:bg-gray-200 transition-colors"
              >
                ← Redo
              </button>
              <button
                onClick={handleSave}
                disabled={foods.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-5 h-5" /> Log this meal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
