// ⏰ utils.js
export function getLocalISOString() {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60000;
  const localTime = new Date(now.getTime() - timezoneOffsetMs);
  return localTime.toISOString().slice(0, 19);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH');
}