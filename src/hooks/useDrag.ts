import { arrayMove } from "@dnd-kit/sortable";
import { useTabsStore } from "../store/useTabsStore";
import type { Tab } from "../types/Tab.type";

export default function useDrag() {
  const { setTabs } = useTabsStore();

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setTabs((prev: Tab[]) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return { handleDragEnd };
}
