import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Tab } from "../../types/Tab.type";
import { useTabsStore } from "../../store/useTabsStore";
import "./SortableTab.css";

type Props = {
  tab: Tab;
};

export default function SortableTab({ tab }: Props) {
  const togglePin = useTabsStore((s) => s.togglePin);
  const setActiveTab = useTabsStore((s) => s.setActiveTab);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tab.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      className={`tab ${tab.pinned ? "tab--pinned" : ""}`}
      style={style}
      {...attributes}
      onClick={() => {
        console.debug("SortableTab clicked: ", tab.id, tab.url);
        setActiveTab(tab.id);
      }}
    >
      <div className="tab__content" {...listeners}>
        {tab.src && (
          <img src={tab.src} alt={tab.title} width={16} height={16} />
        )}
        <span className="tab__title">{tab.title}</span>
      </div>

      <div className="tab__actions">
        <button
          type="button"
          aria-pressed={!!tab.pinned}
          title={tab.pinned ? "Unpin" : "Pin"}
          className="tab__pin-btn"
          onClick={(e) => {
            e.stopPropagation();
            togglePin(tab.id);
          }}
        >
          <img src="/icons/pin.png" alt="pin" width={15} height={15} />
        </button>
      </div>
    </div>
  );
}
