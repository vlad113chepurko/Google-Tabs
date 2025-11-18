import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Tab } from "../../types/Tab.type";
import { components } from "../index";
import { useMenuStore } from "../../store/useMenuStore";
import "./TabsBar.css";
import "../sortable-tab/SortableTab.css";

type Props = { tabs: Tab[] };

export default function TabsBar({ tabs }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const { toggleMenu, isMenuOpen, setMenuPosition } = useMenuStore();

  const pinnedTabs = tabs.filter((t) => t.pinned);
  const normalTabs = tabs.filter((t) => !t.pinned);
  const orderedTabs = [...pinnedTabs, ...normalTabs];

  const toggleMenuAndSetPosition = useCallback(() => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const left = Math.min(Math.max(0, rect.left), window.innerWidth);
      const top = Math.min(Math.max(0, rect.bottom), window.innerHeight);
      setMenuPosition({ x: left, y: top });
    }
    toggleMenu();
  }, [setMenuPosition, toggleMenu]);

  const prevCountRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const reduceTimeoutRef = useRef<number | null>(null);
  const increaseTimeoutRef = useRef<number | null>(null);

  const widthsRef = useRef<Map<string, number>>(new Map());

  const measureWidths = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const items = Array.from(
      wrapper.querySelectorAll(".tab-item")
    ) as HTMLElement[];
    const gap = 5;
    items.forEach((item) => {
      const id = item.dataset.id;
      if (!id) return;
      const tabEl = item.querySelector(".tab") as HTMLElement | null;
      if (tabEl) {
        const w = (tabEl.offsetWidth || tabEl.clientWidth || 0) + gap;
        const prev = widthsRef.current.get(id);
        if (prev !== w) {
          widthsRef.current.set(id, w);
        }
      }
    });
  }, []);

  const updateVisible = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const style = getComputedStyle(wrapper);
    const paddingRight = parseFloat(style.paddingRight || "0");

    const tabEls = Array.from(wrapper.children).filter((child) =>
      child.classList.contains("tab-item")
    ) as HTMLElement[];

    const gap = 5;
    const available = Math.max(
      0,
      Math.floor(wrapper.clientWidth - paddingRight)
    );

    let sum = 0;
    let count = 0;
    const epsilon = 2;

    for (const el of tabEls) {
      const id = el.getAttribute("data-id") || "";
      const cached = widthsRef.current.get(id);
      const w =
        cached ??
        ((el.firstElementChild as HTMLElement)?.offsetWidth ||
          el.clientWidth ||
          0) + gap;
      if (sum + w <= available + epsilon) {
        sum += w;
        count++;
      } else {
        break;
      }
    }

    const pinnedCount = pinnedTabs.length;
    if (count < pinnedCount) count = pinnedCount;

    const prev = prevCountRef.current;

    const increaseDelay = 50;
    const reduceDelay = 120;

    if (prev === null) {
      prevCountRef.current = count;
      setVisibleCount(count);
      return;
    }

    if (count > prev) {
      if (reduceTimeoutRef.current != null) {
        window.clearTimeout(reduceTimeoutRef.current);
        reduceTimeoutRef.current = null;
      }
      if (increaseTimeoutRef.current != null) {
        window.clearTimeout(increaseTimeoutRef.current);
      }
      increaseTimeoutRef.current = window.setTimeout(() => {
        prevCountRef.current = count;
        setVisibleCount(count);
        increaseTimeoutRef.current = null;
      }, increaseDelay);
      return;
    }

    if (count < prev) {
      if (increaseTimeoutRef.current != null) {
        window.clearTimeout(increaseTimeoutRef.current);
        increaseTimeoutRef.current = null;
      }
      if (reduceTimeoutRef.current != null) {
        window.clearTimeout(reduceTimeoutRef.current);
      }
      reduceTimeoutRef.current = window.setTimeout(() => {
        prevCountRef.current = count;
        setVisibleCount(count);
        reduceTimeoutRef.current = null;
      }, reduceDelay);
      return;
    }
  }, [pinnedTabs.length]);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      measureWidths();
      updateVisible();
    });
  }, [measureWidths, updateVisible]);

  useLayoutEffect(() => {
    measureWidths();
    updateVisible();

    const ResizeObserverClass = (window as any).ResizeObserver;
    let ro: any | null = null;
    if (ResizeObserverClass && wrapperRef.current) {
      ro = new ResizeObserverClass(() => {
        scheduleUpdate();
      });
      ro.observe(wrapperRef.current);
    }

    const onResize = () => scheduleUpdate();
    window.addEventListener("resize", onResize);

    return () => {
      if (ro && typeof ro.disconnect === "function") ro.disconnect();
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (reduceTimeoutRef.current != null) {
        window.clearTimeout(reduceTimeoutRef.current);
        reduceTimeoutRef.current = null;
      }
      if (increaseTimeoutRef.current != null) {
        window.clearTimeout(increaseTimeoutRef.current);
        increaseTimeoutRef.current = null;
      }
    };
  }, [tabs, scheduleUpdate, updateVisible, measureWidths]);

  return (
    <div className="tabs__bar">
      <div ref={wrapperRef} className="tabs__scroll">
        {orderedTabs.map((tab, i) => (
          <div key={tab.id} className="tab-item" data-id={tab.id}>
            {i < visibleCount ? (
              <components.SortableTab tab={tab} />
            ) : (
              <div
                className="tab-item__placeholder"
                aria-hidden
                style={
                  widthsRef.current.has(tab.id)
                    ? { width: `${widthsRef.current.get(tab.id)}px` }
                    : undefined
                }
              />
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
          <div className="overflow__dropdown" role="menu">
            {orderedTabs.slice(visibleCount).map((tab) => (
              <div
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
        )}
      </div>
    </div>
  );
}
