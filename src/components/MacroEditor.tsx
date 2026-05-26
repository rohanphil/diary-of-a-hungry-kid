"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { FoodItem, Macros } from "@/lib/types";

interface MacroEditorProps {
  foods: FoodItem[];
  onChange: (foods: FoodItem[]) => void;
}

function MacroInput({
  label,
  value,
  unit,
  onChange,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`text-xs font-semibold ${color}`}>{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  );
}

function FoodItemEditor({
  item,
  onUpdate,
  onDelete,
}: {
  item: FoodItem;
  onUpdate: (item: FoodItem) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateMacro = (key: keyof Macros, value: number) => {
    onUpdate({ ...item, macros: { ...item.macros, [key]: value } });
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-gray-50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          <span className="font-semibold text-gray-800 text-sm flex-1">{item.name}</span>
          <span className="text-xs text-gray-400">{item.servingSize}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Macro quick summary */}
      {!expanded && (
        <div className="flex gap-3 px-3 py-2 text-xs text-gray-500">
          <span className="font-semibold text-orange-500">{item.macros.calories} kcal</span>
          <span>P: {item.macros.protein}g</span>
          <span>C: {item.macros.carbs}g</span>
          <span>F: {item.macros.fat}g</span>
        </div>
      )}

      {/* Expanded editor */}
      {expanded && (
        <div className="p-3 space-y-3">
          {/* Name + serving */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Food Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdate({ ...item, name: e.target.value })}
                className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Serving Size</label>
              <input
                type="text"
                value={item.servingSize}
                onChange={(e) => onUpdate({ ...item, servingSize: e.target.value })}
                className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          {/* Main macros */}
          <div className="grid grid-cols-2 gap-2">
            <MacroInput
              label="Calories"
              value={item.macros.calories}
              unit="kcal"
              onChange={(v) => updateMacro("calories", v)}
              color="text-orange-500"
            />
            <MacroInput
              label="Protein"
              value={item.macros.protein}
              unit="g"
              onChange={(v) => updateMacro("protein", v)}
              color="text-blue-500"
            />
            <MacroInput
              label="Carbs"
              value={item.macros.carbs}
              unit="g"
              onChange={(v) => updateMacro("carbs", v)}
              color="text-yellow-500"
            />
            <MacroInput
              label="Fat"
              value={item.macros.fat}
              unit="g"
              onChange={(v) => updateMacro("fat", v)}
              color="text-purple-500"
            />
          </div>

          {/* Secondary macros */}
          <div className="grid grid-cols-2 gap-2">
            <MacroInput
              label="Fiber"
              value={item.macros.fiber || 0}
              unit="g"
              onChange={(v) => updateMacro("fiber", v)}
              color="text-green-500"
            />
            <MacroInput
              label="Sugar"
              value={item.macros.sugar || 0}
              unit="g"
              onChange={(v) => updateMacro("sugar", v)}
              color="text-pink-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MacroEditor({ foods, onChange }: MacroEditorProps) {
  const addFood = () => {
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: "New food item",
      servingSize: "1 serving",
      macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
    };
    onChange([...foods, newItem]);
  };

  return (
    <div className="space-y-2">
      {foods.map((item, index) => (
        <FoodItemEditor
          key={item.id}
          item={item}
          onUpdate={(updated) => {
            const next = [...foods];
            next[index] = updated;
            onChange(next);
          }}
          onDelete={() => onChange(foods.filter((_, i) => i !== index))}
        />
      ))}

      <button
        onClick={addFood}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add food item manually
      </button>
    </div>
  );
}
