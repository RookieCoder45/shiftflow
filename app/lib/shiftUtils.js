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

export const canCoverShift = (myShiftLetter, targetShiftLetter, targetDateStr, targetShiftType) => {
  if (!myShiftLetter || !targetShiftLetter || !targetDateStr || !targetShiftType) return false;

  if (myShiftLetter.toUpperCase() === targetShiftLetter.toUpperCase()) {
    return false;
  }

  // Parse YYYY-MM-DD
  const parts = targetDateStr.split("-");
  if (parts.length !== 3) return false;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const targetDate = new Date(year, month - 1, day);
  const prevDate = new Date(year, month - 1, day - 1);
  const nextDate = new Date(year, month - 1, day + 1);

  const myShiftOnTargetDate = getShiftForDate(targetDate, myShiftLetter);
  const myShiftOnPrevDate = getShiftForDate(prevDate, myShiftLetter);
  const myShiftOnNextDate = getShiftForDate(nextDate, myShiftLetter);

  if (myShiftOnTargetDate !== "Day Off") {
    return false;
  }

  const isDayShiftTarget = targetShiftType.toLowerCase().includes("day");
  const isNightShiftTarget = targetShiftType.toLowerCase().includes("night");

  if (isDayShiftTarget && myShiftOnPrevDate === "Night Shift") {
    return false;
  }

  if (isNightShiftTarget && myShiftOnNextDate === "Day Shift") {
    return false;
  }

  return true;
};

export const parsePostContent = (title, content) => {
  let dates = [];
  let shiftType = "";
  let targetShiftLetter = "";

  if (title === "Coverage Request") {
    let match = content.match(/Need coverage on (.*?) from (.*?) shift\. Payment/i);
    if (match) {
      dates = match[1].split(",").map(d => d.trim());
      targetShiftLetter = match[2].trim();
    } else {
      match = content.match(/Need coverage on (.*?) for (.*?). Payment/i);
      if (match) {
        dates = match[1].split(",").map(d => d.trim());
        shiftType = match[2].trim();
      }
    }
  } else if (title === "Offer Coverage") {
    const match = content.match(/Available to work on (.*?) for (.*?). Payment/i);
    if (match) {
      dates = match[1].split(",").map(d => d.trim());
      shiftType = match[2].trim();
    }
  }

  return { dates, shiftType, targetShiftLetter };
};
