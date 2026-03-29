"use client";

import { useState, useRef, useEffect } from "react";

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <AccordionItem key={i} item={item} isOpen={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? null : i)} />
      ))}
    </div>
  );
}

function AccordionItem({ item, isOpen, onClick }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <button
        onClick={onClick}
        className="flex items-center justify-between gap-4 w-full px-6 py-5 font-semibold text-left hover:bg-gray-50 transition-colors"
      >
        <span>{item.q}</span>
        <i className={`fas fa-chevron-down text-xs text-[var(--color-muted)] flex-shrink-0 transition-transform duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "rotate-180" : ""}`}></i>
      </button>
      <div
        style={{ height: `${height}px`, transition: "height 1500ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        className="overflow-hidden"
      >
        <div ref={contentRef} className="px-6 pb-5 text-sm text-[var(--color-muted)] leading-relaxed">
          {item.a}
        </div>
      </div>
    </div>
  );
}
