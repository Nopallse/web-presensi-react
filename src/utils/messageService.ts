// Global notification service yang menggunakan window.globalNotification
class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  success(message: string) {
    if ((window as any).globalNotification) {
      (window as any).globalNotification.success(message);
    } else {
      console.warn('Global notification not initialized yet');
    }
  }

  error(message: string) {
    if ((window as any).globalNotification) {
      (window as any).globalNotification.error(message);
    } else {
      console.warn('Global notification not initialized yet');
    }
  }

  warning(message: string) {
    if ((window as any).globalNotification) {
      (window as any).globalNotification.warning(message);
    } else {
      console.warn('Global notification not initialized yet');
    }
  }

  info(message: string) {
    if ((window as any).globalNotification) {
      (window as any).globalNotification.info(message);
    } else {
      console.warn('Global notification not initialized yet');
    }
  }
}

// Export instance global
export const notificationService = NotificationService.getInstance();
export const globalNotification = notificationService;

// Export shorthand untuk kemudahan penggunaan
export const notify = {
  success: (message: string) => notificationService.success(message),
  error: (message: string) => notificationService.error(message),
  warning: (message: string) => notificationService.warning(message),
  info: (message: string) => notificationService.info(message),
};
