import { FoodEntry, DailyLog, Macros } from "./types";

const STORAGE_KEY = "diary-of-a-hungry-kid";

export function getAllEntries(): FoodEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: FoodEntry): void {
  const entries = getAllEntries();
  const existing = entries.findIndex((e) => e.id === entry.id);
  if (existing >= 0) {
    entries[existing] = entry;
  } else {
    entries.unshift(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function deleteEntry(id: string): void {
  const entries = getAllEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getEntriesByDate(date: string): FoodEntry[] {
  return getAllEntries().filter((e) => e.timestamp.startsWith(date));
}

export function getDailyLog(date: string): DailyLog {
  const entries = getEntriesByDate(date);
  const totalMacros = sumMacros(entries.map((e) => e.totalMacros));
  return { date, entries, totalMacros };
}

export function sumMacros(macrosList: Macros[]): Macros {
  return macrosList.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
      fiber: (acc.fiber || 0) + (m.fiber || 0),
      sugar: (acc.sugar || 0) + (m.sugar || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );
}

export function computeTotalMacros(entry: FoodEntry): Macros {
  return sumMacros(entry.foods.map((f) => f.macros));
}
