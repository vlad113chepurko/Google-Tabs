import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tabsData } from "../components/tabs/TabsData";
import type { Tab } from "../types/Tab.type";

interface TabsState {
  tabs: Tab[];
  setTabs: (tabs: Tab[] | ((prev: Tab[]) => Tab[])) => void;
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set) => ({
      tabs: (() => {
        const saved = localStorage.getItem("tabs");
        if (saved) {
          const parsed = JSON.parse(saved) as Tab[];
          if (parsed.length) return parsed;
        }
        return tabsData;
      })(),

      setTabs: (tabs) =>
        set((state) => ({
          tabs: typeof tabs === "function" ? tabs(state.tabs) : tabs,
        })),
    }),
    {
      name: "tabs-storage",
    }
  )
);
