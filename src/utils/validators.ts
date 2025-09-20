// Validation utilities
export const validators = {
  // Email validation
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone number validation (Indonesian format)
  phone: (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    return phoneRegex.test(phone);
  },

  // NIP validation (Indonesian civil servant ID)
  nip: (nip: string): boolean => {
    // NIP format: 18 digits (YYYYMMDDYYYYMMDDXX)
    const nipRegex = /^\d{18}$/;
    return nipRegex.test(nip);
  },

  // Required field validation
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },

  // Minimum length validation
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  // Maximum length validation
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  // Password strength validation
  password: (password: string): { isValid: boolean; messages: string[] } => {
    const messages: string[] = [];
    let isValid = true;

    if (password.length < 8) {
      messages.push('Password minimal 8 karakter');
      isValid = false;
    }

    if (!/[a-z]/.test(password)) {
      messages.push('Password harus mengandung huruf kecil');
      isValid = false;
    }

    if (!/[A-Z]/.test(password)) {
      messages.push('Password harus mengandung huruf besar');
      isValid = false;
    }

    if (!/\d/.test(password)) {
      messages.push('Password harus mengandung angka');
      isValid = false;
    }

    return { isValid, messages };
  },

  // Coordinate validation
  coordinate: (coord: number, type: 'latitude' | 'longitude'): boolean => {
    if (type === 'latitude') {
      return coord >= -90 && coord <= 90;
    }
    return coord >= -180 && coord <= 180;
  },

  // URL validation
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Indonesian postal code validation
  postalCode: (code: string): boolean => {
    const postalRegex = /^\d{5}$/;
    return postalRegex.test(code);
  },

  // Time format validation (HH:mm)
  time: (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  // Date format validation (YYYY-MM-DD)
  date: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }
};

// Form validation helper
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, Array<{ rule: string; params?: any; message: string }>>
): { isValid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    const fieldErrors: string[] = [];

    fieldRules.forEach(({ rule, params, message }) => {
      let ruleValid = true;

      switch (rule) {
        case 'required':
          ruleValid = validators.required(value);
          break;
        case 'email':
          ruleValid = !value || validators.email(value);
          break;
        case 'phone':
          ruleValid = !value || validators.phone(value);
          break;
        case 'nip':
          ruleValid = !value || validators.nip(value);
          break;
        case 'minLength':
          ruleValid = !value || validators.minLength(value, params);
          break;
        case 'maxLength':
          ruleValid = !value || validators.maxLength(value, params);
          break;
        case 'date':
          ruleValid = !value || validators.date(value);
          break;
        case 'time':
          ruleValid = !value || validators.time(value);
          break;
        case 'url':
          ruleValid = !value || validators.url(value);
          break;
        default:
          break;
      }

      if (!ruleValid) {
        fieldErrors.push(message);
        isValid = false;
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return { isValid, errors };
};