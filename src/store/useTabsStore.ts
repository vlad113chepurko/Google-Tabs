import { create } from "zustand";
import type { Tab } from "../types/Tab.type";
import { tabsData } from "../components/tabs/TabsData";

type TabsState = {
  tabs: Tab[];
  activeTabId: string | null;
  setActiveTab: (id: string) => void;
  setTabs: (tabsOrUpdater: Tab[] | ((prev: Tab[]) => Tab[])) => void;
  addTab: (tab: Tab) => void;
  togglePin: (id: string) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
};

const STORAGE_KEY = "tabs";

const loadInitialTabs = (): Tab[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return Array.isArray(tabsData) ? (tabsData as any) : [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Tab[]) : [];
  } catch {
    return Array.isArray(tabsData) ? (tabsData as any) : [];
  }
};

const saveTabs = (tabs: Tab[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {}
};

export const useTabsStore = create<TabsState>((set, get) => {
  const initialTabs = loadInitialTabs();
  const initialActive = initialTabs.length > 0 ? initialTabs[0].id : null;

  return {
    tabs: initialTabs,
    activeTabId: initialActive,

    setActiveTab: (id: string) => {
      set({ activeTabId: id });
    },

    setTabs: (tabsOrUpdater) => {
      const prev = get().tabs;
      const newTabs =
        typeof tabsOrUpdater === "function"
          ? (tabsOrUpdater as (prev: Tab[]) => Tab[])(prev)
          : (tabsOrUpdater as Tab[]);
      set({ tabs: newTabs });

      const active = get().activeTabId;
      if (active && !newTabs.find((t) => t.id === active)) {
        const newActive = newTabs.length > 0 ? newTabs[0].id : null;
        set({ activeTabId: newActive });
      }
      saveTabs(newTabs);
    },

    addTab: (tab) => {
      set((state) => {
        const tabs = [...state.tabs, tab];
        saveTabs(tabs);
        return { tabs };
      });
    },

    togglePin: (id) => {
      set((state) => {
        const tabs = state.tabs.map((t) =>
          t.id === id ? { ...t, pinned: !t.pinned } : t
        );
        saveTabs(tabs);
        return { tabs };
      });
    },

    moveTab: (fromIndex, toIndex) => {
      set((state) => {
        const tabs = [...state.tabs];
        if (fromIndex < 0 || fromIndex >= tabs.length) return state;
        if (toIndex < 0 || toIndex >= tabs.length) return state;
        const [item] = tabs.splice(fromIndex, 1);
        tabs.splice(toIndex, 0, item);
        saveTabs(tabs);
        return { tabs };
      });
    },
  };
});
