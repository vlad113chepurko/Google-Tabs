import "./TabsContainer.css";
import { tabs } from "./TabsData";

export default function TabsContainer() {
  return (
    <div className="tabs__container">
      <div className="tabs__wrapper">
        {tabs.map((tab) => (
          <>
            <div className="tab" key={tab.id}>
              <img src={tab.src} alt={tab.title} />
              <span>{tab.title}</span>
              <div className="sepparator"></div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
