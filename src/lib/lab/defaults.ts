export const PRINTER_MODELS: { id: string; label: string; price: number; watts: number }[] = [
  { id: "a1mini", label: "Bambu A1 mini", price: 1899, watts: 80 },
  { id: "a1", label: "Bambu A1", price: 2999, watts: 95 },
  { id: "p1s", label: "Bambu P1S", price: 4999, watts: 130 },
  { id: "x1c", label: "Bambu X1C", price: 8999, watts: 150 },
  { id: "x2d", label: "Bambu X2D", price: 13999, watts: 200 },
  { id: "k1", label: "Creality K1", price: 2799, watts: 150 },
  { id: "ender3", label: "Creality Ender 3", price: 1199, watts: 120 },
  { id: "elegoo", label: "Elegoo (Neptune/Centauri)", price: 1499, watts: 120 },
  { id: "outra", label: "Outra", price: 2000, watts: 120 },
];

export const DEFAULT_WORKSHOP = { kwhPrice: 0.95, laborHourly: 20, lossPct: 5, packaging: 2, printerLifeHours: 5000, marginPct: 80 };
export const DEFAULT_FILAMENT = { type: "PLA", color: "Branco", spoolPrice: 99.9, spoolGrams: 1000 };
