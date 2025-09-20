import { useSidebar as useSidebarStore, useSidebarActions } from '../store/sidebarStore';

export const useSidebar = () => {
  const sidebar = useSidebarStore();
  const actions = useSidebarActions();
  
  return {
    ...sidebar,
    ...actions
  };
};