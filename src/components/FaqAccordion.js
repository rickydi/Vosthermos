"use client";

import { useState, useRef, useEffect, useCallback } from "react";

function FaqItem({ question, answer, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight);
    } else {
      setMaxHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="border-b border-[var(--color-border)]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="faq-question font-semibold text-[15px] leading-snug group-hover:text-[var(--color-red)] transition-colors">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-[var(--color-red)] text-white rotate-45"
              : "bg-[var(--color-border)] text-[var(--color-muted)] rotate-0"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: `${maxHeight}px` }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div className="faq-answer pb-5 text-sm text-[var(--color-muted)] leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FaqAccordion({ items = [], className = "" }) {
  const [openIndex, setOpenIndex] = useState(-1);

  const handleToggle = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }, []);

  if (!items.length) return null;

  return (
    <div className={className}>
      {items.map((item, index) => (
        <FaqItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
