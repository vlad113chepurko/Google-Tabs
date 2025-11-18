import type { Tab } from "../../types/Tab.type";
import { useTabsStore } from "../../store/useTabsStore";
import "./TabsContainer.css";

type Props = {
  items: Tab[];
};

export default function OverflowMenu({ items }: Props) {
  const { setActiveTab } = useTabsStore();

  return (
    <div className="overflow__dropdown" role="menu">
      {items.map((tab) => (
        <div
          onClick={() => {
            console.log("SortableTab clicked: ", tab.id, tab.url);
            setActiveTab(tab.id);
          }}
          key={tab.id}
          className="overflow__item"
          role="menuitem"
          tabIndex={0}
        >
          <img width={16} height={16} src={tab.src} alt={tab.title} />
          <span>{tab.title}</span>
        </div>
      ))}
    </div>
  );
}
