"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, Edit2, Trash2, Check, X } from "lucide-react";
import { FoodEntry } from "@/lib/types";
import { computeTotalMacros } from "@/lib/storage";
import MacroEditor from "./MacroEditor";

interface FoodEntryCardProps {
  entry: FoodEntry;
  onUpdate: (entry: FoodEntry) => void;
  onDelete: (id: string) => void;
}

export default function FoodEntryCard({ entry, onUpdate, onDelete }: FoodEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState<FoodEntry>(entry);

  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSave = () => {
    const updated = { ...editedEntry, totalMacros: computeTotalMacros(editedEntry) };
    onUpdate(updated);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditedEntry(entry);
    setEditing(false);
  };

  const macros = entry.totalMacros;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail */}
        {entry.photos.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.photos[0]}
            alt="Food"
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        )}
        {entry.photos.length === 0 && (
          <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🍽️</span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
            {entry.photos.length > 1 && (
              <span className="bg-gray-100 px-1.5 py-0.5 rounded-full">
                {entry.photos.length} photos
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {entry.foods.map((f) => f.name).join(", ") || "No items"}
          </p>
          {/* Macro pills */}
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-semibold text-orange-500">
              {Math.round(macros.calories)} kcal
            </span>
            <span className="text-xs text-blue-500">P: {Math.round(macros.protein)}g</span>
            <span className="text-xs text-yellow-500">C: {Math.round(macros.carbs)}g</span>
            <span className="text-xs text-purple-500">F: {Math.round(macros.fat)}g</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => { setExpanded(!expanded); }}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { setExpanded(true); setEditing(true); }}
            className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded area */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* All photos */}
          {entry.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-1.5">
              {entry.photos.map((photo, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={photo}
                  alt={`Food ${i + 1}`}
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {/* Food items / editor */}
          {editing ? (
            <div className="space-y-3">
              <MacroEditor
                foods={editedEntry.foods}
                onChange={(foods) => setEditedEntry({ ...editedEntry, foods })}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  <Check className="w-4 h-4" /> Save changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {entry.foods.map((food) => (
                <div key={food.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-700">{food.name}</span>
                    <span className="text-gray-400 ml-2 text-xs">{food.servingSize}</span>
                  </div>
                  <span className="text-orange-500 font-semibold">{food.macros.calories} kcal</span>
                </div>
              ))}
              {entry.notes && (
                <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2 mt-2">
                  {entry.notes}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
