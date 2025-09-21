import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { roleGuard } from '../utils/roleGuard';
import type { MenuItem, Role } from '../types/global';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  activeMenu: string;
}

interface SidebarActions {
  toggle: () => void;
  open: () => void;
  close: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setActiveMenu: (menu: string) => void;
  getMenuItems: (userRole: Role) => MenuItem[];
}

type SidebarStore = SidebarState & SidebarActions;

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      // State
      isOpen: true,
      isCollapsed: false,
      activeMenu: '',

      // Actions
      toggle: () => {
        set((state) => ({ isCollapsed: !state.isCollapsed }));
      },

      open: () => {
        set({ isOpen: true, isCollapsed: false });
      },

      close: () => {
        set({ isOpen: false });
      },

      setCollapsed: (isCollapsed: boolean) => {
        set({ isCollapsed });
      },

      setActiveMenu: (activeMenu: string) => {
        set({ activeMenu });
      },

      getMenuItems: (userRole: Role) => {
        return roleGuard.getMenuForRole(userRole);
      }
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
      })
    }
  )
);

// Selectors for easier usage
export const useSidebar = () => {
  const { isOpen, isCollapsed, activeMenu } = useSidebarStore();
  return { isOpen, isCollapsed, activeMenu };
};

export const useSidebarActions = () => {
  const { toggle, open, close, setCollapsed, setActiveMenu, getMenuItems } = useSidebarStore();
  return { toggle, open, close, setCollapsed, setActiveMenu, getMenuItems };
};