import { format, parseISO, isValid } from 'date-fns';

export const dateFormatter = {
  // Format date to Indonesian locale
  toIndonesian: (date: string | Date, formatStr: string = 'dd MMMM yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '-';
      return format(dateObj, formatStr);
    } catch {
      return '-';
    }
  },

  // Format to date input value (YYYY-MM-DD)
  toInputValue: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return format(dateObj, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  },

  // Format to time input value (HH:mm)
  toTimeValue: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return format(dateObj, 'HH:mm');
    } catch {
      return '';
    }
  },

  // Format to datetime-local input value
  toDateTimeValue: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return format(dateObj, "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  },

  // Format for display in tables
  toTableFormat: (date: string | Date): string => {
    return dateFormatter.toIndonesian(date, 'dd/MM/yyyy HH:mm');
  },

  // Format for API (ISO string)
  toApiFormat: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return dateObj.toISOString();
    } catch {
      return '';
    }
  },

  // Check if date is today
  isToday: (date: string | Date): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const today = new Date();
      return (
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const now = new Date();
      const diffInMs = now.getTime() - dateObj.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) return 'Baru saja';
      if (diffInHours < 24) return `${diffInHours} jam lalu`;
      if (diffInDays < 7) return `${diffInDays} hari lalu`;
      return dateFormatter.toIndonesian(dateObj);
    } catch {
      return '-';
    }
  }
};

// Standalone functions for easier imports
export const formatDate = (date: string | Date, formatStr: string = 'dd MMM yyyy'): string => {
  return dateFormatter.toIndonesian(date, formatStr);
};

export const formatTime = (time: string): string => {
  try {
    if (!time) return '-';
    // If time is in HH:mm format, return as is
    if (time.match(/^\d{2}:\d{2}$/)) return time;
    // If time is in HH:mm:ss format, remove seconds
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) return time.substring(0, 5);
    // Try to parse as date and extract time
    const dateObj = parseISO(time);
    if (isValid(dateObj)) return format(dateObj, 'HH:mm');
    return time;
  } catch {
    return '-';
  }
};

export const formatDateTime = (datetime: string | Date, formatStr: string = 'dd MMM yyyy HH:mm'): string => {
  return dateFormatter.toIndonesian(datetime, formatStr);
};