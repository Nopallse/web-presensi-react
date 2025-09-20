import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  loading: boolean;
  notifications: Notification[];
  modals: Record<string, boolean>;
  toasts: Toast[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UIActions {
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Modals
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  closeAllModals: () => void;
  
  // Toasts
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

type UIStore = UIState & UIActions;

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const useUIStore = create<UIStore>((set, get) => ({
  // State
  theme: 'light',
  loading: false,
  notifications: [],
  modals: {},
  toasts: [],

  // Actions
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    localStorage.setItem('theme', theme);
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  // Notifications
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },

  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notif => ({ ...notif, read: true }))
    }));
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(notif => notif.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Modals
  openModal: (modalId: string) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: true }
    }));
  },

  closeModal: (modalId: string) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: false }
    }));
  },

  toggleModal: (modalId: string) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: !state.modals[modalId] }
    }));
  },

  closeAllModals: () => {
    set((state) => ({
      modals: Object.keys(state.modals).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {}
      )
    }));
  },

  // Toasts
  showToast: (toast) => {
    const newToast: Toast = {
      ...toast,
      id: generateId()
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto-remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      get().removeToast(newToast.id);
    }, duration);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  }
}));

// Selectors for easier usage
export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useUIStore();
  return { theme, setTheme, toggleTheme };
};

export const useLoading = () => {
  const { loading, setLoading } = useUIStore();
  return { loading, setLoading };
};

export const useNotifications = () => {
  const { 
    notifications, 
    addNotification, 
    markNotificationRead, 
    markAllNotificationsRead, 
    removeNotification, 
    clearNotifications 
  } = useUIStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return { 
    notifications, 
    unreadCount,
    addNotification, 
    markNotificationRead, 
    markAllNotificationsRead, 
    removeNotification, 
    clearNotifications 
  };
};

export const useModals = () => {
  const { modals, openModal, closeModal, toggleModal, closeAllModals } = useUIStore();
  return { modals, openModal, closeModal, toggleModal, closeAllModals };
};

export const useToasts = () => {
  const { toasts, showToast, removeToast, clearToasts } = useUIStore();
  return { toasts, showToast, removeToast, clearToasts };
};