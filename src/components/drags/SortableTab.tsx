import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableTab({ tab }: { tab: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="tab"
    >
      <img src={tab.src} alt={tab.title} />
      <span>{tab.title}</span>
      <div className="sepparator"></div>
    </div>
  );
}
