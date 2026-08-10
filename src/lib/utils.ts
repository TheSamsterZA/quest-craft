export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  // timeString is in HH:mm format
  return timeString || '';
}

export function getWeekdayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || '';
}

export function getWeekdayNames(weekdays: number[]): string {
  return weekdays.map(getWeekdayName).join(', ');
}

export function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

export function validatePIN(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function downloadJSON(data: string, filename: string): void {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function getProgressPercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

export const AVATAR_OPTIONS = ['🦊', '🐼', '🐻', '🐰', '🦁', '🐯', '🦊', '🐻‍❄️', '🦊', '🐻', '🐰', '🦁', '🐯'];

export const EMOJI_AVATARS = ['🌟', '🛡️', '🦊', '🐼', '🐻', '🐰', '🦁', '🐯', '🦊', '🐻‍❄️'];
