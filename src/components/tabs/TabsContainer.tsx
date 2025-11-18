import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import useDrag from "../../hooks/useDrag";
import TabsBar from "./TabsBar";
import { useTabsStore } from "../../store/useTabsStore";
import type { Tab } from "../../types/Tab.type";
import "./TabsContainer.css";

export default function TabsContainer() {
  const { tabs } = useTabsStore();
  const { handleDragEnd } = useDrag();

  return (
    <div className="tabs__container">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={tabs.map((t: Tab) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <TabsBar tabs={tabs} />
        </SortableContext>
      </DndContext>
    </div>
  );
}
