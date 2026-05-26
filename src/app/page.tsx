"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import { FoodEntry } from "@/lib/types";
import {
  getDailyLog,
  saveEntry,
  deleteEntry,
  computeTotalMacros,
} from "@/lib/storage";
import LogFoodModal from "@/components/LogFoodModal";
import FoodEntryCard from "@/components/FoodEntryCard";
import DailySummary from "@/components/DailySummary";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";

  return new Date(dateStr + "T12:00:00").toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showModal, setShowModal] = useState(false);

  const loadEntries = useCallback(() => {
    const log = getDailyLog(selectedDate);
    setEntries(log.entries);
  }, [selectedDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = (entry: FoodEntry) => {
    saveEntry(entry);
    loadEntries();
    setShowModal(false);
  };

  const handleUpdate = (entry: FoodEntry) => {
    const updated = { ...entry, totalMacros: computeTotalMacros(entry) };
    saveEntry(updated);
    loadEntries();
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    loadEntries();
  };

  const goToPrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDate(d));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    const next = formatDate(d);
    if (next <= formatDate(new Date())) {
      setSelectedDate(next);
    }
  };

  const isToday = selectedDate === formatDate(new Date());

  const totalMacros = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.totalMacros.calories,
      protein: acc.protein + e.totalMacros.protein,
      carbs: acc.carbs + e.totalMacros.carbs,
      fat: acc.fat + e.totalMacros.fat,
      fiber: (acc.fiber || 0) + (e.totalMacros.fiber || 0),
      sugar: (acc.sugar || 0) + (e.totalMacros.sugar || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥑</span>
            <div>
              <h1 className="font-black text-gray-900 leading-none">Hungry Kid</h1>
              <p className="text-xs text-gray-400">food diary</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
          >
            <Plus className="w-4 h-4" />
            Log meal
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Date navigator */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevDay}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-900">{formatDisplayDate(selectedDate)}</p>
            <p className="text-xs text-gray-400">{selectedDate}</p>
          </div>
          <button
            onClick={goToNextDay}
            disabled={isToday}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Daily summary */}
        <DailySummary macros={totalMacros} entryCount={entries.length} />

        {/* Meals list */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Meals</h3>

          {entries.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <UtensilsCrossed className="w-10 h-10 text-gray-200" />
              </div>
              <p className="font-semibold text-gray-400">Nothing logged yet</p>
              <p className="text-sm text-gray-300 mt-1">Tap &quot;Log meal&quot; to get started</p>
            </div>
          ) : (
            entries.map((entry) => (
              <FoodEntryCard
                key={entry.id}
                entry={entry}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>

      {/* Log food modal */}
      {showModal && (
        <LogFoodModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
