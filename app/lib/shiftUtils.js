export const shiftSchema = [
  "Day Shift", "Day Shift", "Day Shift", 
  "Night Shift", "Night Shift", "Night Shift", 
  "Day Off", "Day Off", "Day Off", 
  "Day Off", "Day Off", "Day Off"
];

export const shiftIndex = {
  I: 0,
  J: 9,
  K: 6,
  L: 3
};

export const startingDate = "2026-04-07";

export const getShiftForDate = (date, selectedShift) => {
  if (!selectedShift) return null;

  const [sYear, sMonth, sDay] = startingDate.split("-").map(Number);
  const start = new Date(sYear, sMonth - 1, sDay);
  
  // Use UTC to avoid daylight savings issues for shift calculation
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utc2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  
  const delta = Math.round((utc2 - utc1) / msPerDay);
  const initialIndex = shiftIndex[selectedShift.toUpperCase()];
  const length = shiftSchema.length;

  const currentIndex = ((initialIndex + delta) % length + length) % length;
  return shiftSchema[currentIndex];
};

export const getShiftIcon = (type) => {
  switch (type) {
    case "Day Shift": return "☀️";
    case "Night Shift": return "🌙";
    case "Day Off": return "🏖️";
    default: return "❓";
  }
};
