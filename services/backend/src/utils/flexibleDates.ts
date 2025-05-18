export function parseFlexibleDateToObject(dateStr: string | undefined | null): Date | null { // Renombrar y cambiar tipo de retorno
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    return null;
  }
  const trimmedDateStr = dateStr.trim();

  // Intenta DD-MM-YYYY o DD/MM/YYYY
  let regex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  let match = trimmedDateStr.match(regex);

  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); 
    const year = parseInt(match[3], 10);

    if (day > 0 && day <= 31 && month > 0 && month <= 12) {
      const dateObj = new Date(year, month - 1, day); 
      if (dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day) {
        return dateObj;
      }
    }
  }

  // Intenta YYYY-MM-DD o YYYY/MM/DD
  regex = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
  match = trimmedDateStr.match(regex);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (day > 0 && day <= 31 && month > 0 && month <= 12) {
      const dateObj = new Date(year, month - 1, day);
      if (dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day) {
        return dateObj;
      }
    }
  }
  
  console.warn(`[parseFlexibleDateToObject] Formato de fecha no reconocido o fecha inválida: "${trimmedDateStr}"`);
  return null;
}