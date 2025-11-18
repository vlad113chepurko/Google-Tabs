import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import SortableTab from "../drags/SortableTab";
import { tabsData } from "./TabsData";
import "./TabsContainer.css";

export default function TabsContainer() {
  const [tabs, setTabs] = useState(tabsData);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setTabs((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="tabs__container">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={tabs.map((t: any) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="tabs__wrapper">
            {tabs.map((tab: any) => (
              <SortableTab key={tab.id} tab={tab} />
            ))}
            <button className="menu__button" type="button">
              <img 
              width={20}
              height={20}
              src="/icons/arrow.svg" alt="arrow" />
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
