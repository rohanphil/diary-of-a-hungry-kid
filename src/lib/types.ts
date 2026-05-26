export interface Macros {
  calories: number;
  protein: number;   // grams
  carbs: number;     // grams
  fat: number;       // grams
  fiber?: number;    // grams
  sugar?: number;    // grams
}

export interface FoodItem {
  id: string;
  name: string;
  servingSize: string;
  macros: Macros;
}

export interface FoodEntry {
  id: string;
  timestamp: string;        // ISO string
  photos: string[];         // base64 data URLs
  foods: FoodItem[];
  notes?: string;
  totalMacros: Macros;
}

export interface DailyLog {
  date: string;             // YYYY-MM-DD
  entries: FoodEntry[];
  totalMacros: Macros;
}
