import { create } from 'zustand';
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

export const useSidebarStore = create<SidebarStore>((set) => ({
  // State
  isOpen: true,
  isCollapsed: false,
  activeMenu: '',

  // Actions
  toggle: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  open: () => {
    set({ isOpen: true });
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
}));

// Selectors for easier usage
export const useSidebar = () => {
  const { isOpen, isCollapsed, activeMenu } = useSidebarStore();
  return { isOpen, isCollapsed, activeMenu };
};

export const useSidebarActions = () => {
  const { toggle, open, close, setCollapsed, setActiveMenu, getMenuItems } = useSidebarStore();
  return { toggle, open, close, setCollapsed, setActiveMenu, getMenuItems };
};