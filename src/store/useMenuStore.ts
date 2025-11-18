import { create } from "zustand";
interface MenuState {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  menuPosition: { x: number; y: number };
  setMenuPosition: (position: { x: number; y: number }) => void;
}

export const useMenuStore = create<MenuState>()((set) => ({
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  menuPosition: { x: 0, y: 0 },
  setMenuPosition: (position) => set(() => ({ menuPosition: position })),
}));
