/* ===========================
   Formatters - Date & Location
   =========================== */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format location string (city, country)
 * @param {string} city
 * @param {string} country
 * @returns {string}
 */
export function formatLocation(city, country) {
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return 'Unknown';
}

/**
 * Format date range for display (e.g., "Apr 16-19, 2026")
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {string}
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate) return '';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const startMonth = MONTHS[start.getMonth()];
  const startDay = start.getDate();
  const startYear = start.getFullYear();

  if (!end || startDate === endDate) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const endMonth = MONTHS[end.getMonth()];
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  // Same month and year
  if (start.getMonth() === end.getMonth() && startYear === endYear) {
    return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
  }
  // Same year, different months
  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }
  // Different years
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
}

/**
 * Format event date as short M/D format
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string}
 */
export function formatEventDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
