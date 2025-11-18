import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { components } from "../index";
import type { Tab } from "../../types/Tab.type";
import { useMenuStore } from "../../store/useMenuStore";
import "./TabsContainer.css";
import OverflowMenu from "./OverflowMenu";

type Props = {
  tabs: Tab[];
};

export default function TabsBar({ tabs }: Props) {
  const wrapperScrollRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const { toggleMenu, isMenuOpen, setMenuPosition } = useMenuStore();

  const toggleMenuAndSetPosition = useCallback(() => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const left = Math.min(Math.max(0, rect.left), window.innerWidth);
      const top = Math.min(Math.max(0, rect.bottom), window.innerHeight);
      setMenuPosition({ x: left, y: top });
    }
    toggleMenu();
  }, [setMenuPosition, toggleMenu]);

  const updateVisible = useCallback(() => {
    const wrapper = wrapperScrollRef.current;
    if (!wrapper) return;

    const tabEls = Array.from(wrapper.children).filter((child) =>
      child.classList.contains("tab-item")
    ) as HTMLElement[];

    const available = Math.max(0, wrapper.clientWidth - 8);

    let sum = 0;
    let count = 0;
    for (const el of tabEls) {
      const w = el.offsetWidth || el.getBoundingClientRect().width || 0;
      if (sum + w <= available) {
        sum += w;
        count++;
      } else {
        break;
      }
    }
    setVisibleCount(count);
  }, []);

  useLayoutEffect(() => {
    updateVisible();
    const ResizeObserverClass = (window as any).ResizeObserver;
    let ro: any | null = null;
    if (ResizeObserverClass && wrapperScrollRef.current) {
      ro = new ResizeObserverClass(() => updateVisible());
      ro.observe(wrapperScrollRef.current);
    }
    const onResize = () => updateVisible();
    window.addEventListener("resize", onResize);
    return () => {
      if (ro && typeof ro.disconnect === "function") ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [tabs, updateVisible]);

  return (
    <div className="tabs__bar">
      <div ref={wrapperScrollRef} className="tabs__scroll">
        {tabs.map((tab: Tab, i: number) => (
          <div key={tab.id} data-id={tab.id} className="tab-item">
            {i < visibleCount ? (
              <components.SortableTab tab={tab} />
            ) : (
              <div className="tab-item__placeholder" aria-hidden />
            )}
          </div>
        ))}
      </div>

      <div className="tabs__overflow-area">
        <button
          ref={menuButtonRef}
          onClick={toggleMenuAndSetPosition}
          className={`menu__button ${
            tabs.length > visibleCount ? "" : "menu__button--hidden"
          }`}
          type="button"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <img width={20} height={20} src="/icons/arrow.svg" alt="arrow" />
        </button>

        {isMenuOpen && tabs.length > visibleCount && (
          <OverflowMenu items={tabs.slice(visibleCount)} />
        )}
      </div>
    </div>
  );
}
