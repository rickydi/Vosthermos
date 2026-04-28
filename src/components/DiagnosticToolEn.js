"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const questions = [
  {
    id: "fog",
    question: "Do you see fog between the glass panes?",
    icon: "fas fa-cloud",
    options: [
      { label: "Yes, permanent fog", score: 3 },
      { label: "Yes, sometimes", score: 2 },
      { label: "No", score: 0 },
    ],
  },
  {
    id: "age",
    question: "How old are your windows?",
    icon: "fas fa-calendar",
    options: [
      { label: "Less than 10 years", score: 0 },
      { label: "10-20 years", score: 2 },
      { label: "20-30 years", score: 3 },
      { label: "Over 30 years", score: 4 },
    ],
  },
  {
    id: "draft",
    question: "Do you feel cold drafts near the window?",
    icon: "fas fa-wind",
    options: [
      { label: "Yes, very cold", score: 3 },
      { label: "A little", score: 1 },
      { label: "No", score: 0 },
    ],
  },
  {
    id: "deposits",
    question: "Do you see white deposits or stains between the panes?",
    icon: "fas fa-smog",
    options: [
      { label: "Yes", score: 3 },
      { label: "No", score: 0 },
    ],
  },
  {
    id: "mechanical",
    question: "Is the window hard to open or close?",
    icon: "fas fa-lock",
    options: [
      { label: "Yes, very hard", score: 2 },
      { label: "A little stiff", score: 1 },
      { label: "No, works well", score: 0 },
    ],
  },
  {
    id: "quantity",
    question: "How many windows have these problems?",
    icon: "fas fa-th-large",
    options: [
      { label: "1-2 windows", score: 0, info: "1-2" },
      { label: "3-5 windows", score: 0, info: "3-5" },
      { label: "6-10 windows", score: 0, info: "6-10" },
      { label: "More than 10", score: 0, info: "10+" },
    ],
  },
];

const priceRanges = {
  "1-2": "$150 - $450 per unit",
  "3-5": "$450 - $1,800 with volume discount",
  "6-10": "$900 - $3,200 with volume discount",
  "10+": "On estimate - contact us",
};

const energySavings = {
  "1-2": "5% - 10%",
  "3-5": "10% - 20%",
  "6-10": "20% - 35%",
  "10+": "30% - 50%",
};

function getResult(totalScore) {
  if (totalScore <= 3) {
    return {
      title: "Your windows look healthy",
      color: "bg-green-500",
      colorLight: "bg-green-50",
      colorText: "text-green-700",
      colorBorder: "border-green-200",
      icon: "fas fa-check-circle",
      message:
        "No major failure was detected. Preventive maintenance can help extend the life of your sealed glass units.",
      cta: "maintenance",
    };
  }
  if (totalScore <= 7) {
    return {
      title: "Wear signs detected",
      color: "bg-orange-500",
      colorLight: "bg-orange-50",
      colorText: "text-orange-700",
      colorBorder: "border-orange-200",
      icon: "fas fa-exclamation-triangle",
      message:
        "A few warning signs are present. An inspection can confirm whether repair, weatherstripping or sealed unit replacement is needed.",
      cta: "inspection",
    };
  }
  if (totalScore <= 12) {
    return {
      title: "Replacement recommended",
      color: "bg-red-500",
      colorLight: "bg-red-50",
      colorText: "text-red-700",
      colorBorder: "border-red-200",
      icon: "fas fa-tools",
      message:
        "Your sealed glass units show clear signs of failure. Replacement can improve comfort and reduce heating costs.",
      cta: "quote",
    };
  }
  return {
    title: "Urgent replacement",
    color: "bg-red-800",
    colorLight: "bg-red-100",
    colorText: "text-red-900",
    colorBorder: "border-red-300",
    icon: "fas fa-exclamation-circle",
    message:
      "Your windows are near end of life. Fast action helps prevent water infiltration and major energy losses.",
    cta: "call",
  };
}

export default function DiagnosticToolEn() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [animating, setAnimating] = useState(false);

  const totalSteps = questions.length;
  const showResult = currentStep >= totalSteps;
  const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
  const windowCount = answers[5]?.info || "1-2";
  const result = showResult ? getResult(totalScore) : null;

  const selectOption = useCallback(
    (option) => {
      if (animating) return;
      setAnimating(true);
      const nextAnswers = [...answers, option];
      setAnswers(nextAnswers);
      setTimeout(() => {
        setCurrentStep(currentStep < totalSteps - 1 ? currentStep + 1 : totalSteps);
        setAnimating(false);
      }, 250);
    },
    [answers, animating, currentStep, totalSteps]
  );

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setAnswers((prev) => prev.slice(0, -1));
      setCurrentStep((step) => step - 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setAnswers([]);
    setAnimating(false);
  }, []);

  return (
    <div className="max-w-[800px] mx-auto">
      {!showResult && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-[var(--color-muted)] mb-3">
            <span className="font-semibold">
              Question {currentStep + 1} of {totalSteps}
            </span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-teal)] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!showResult && (
        <div className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center shrink-0">
                <i className={`${questions[currentStep].icon} text-2xl text-[var(--color-teal)]`}></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {questions[currentStep].question}
              </h2>
            </div>

            <div className="grid gap-3">
              {questions[currentStep].options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => selectOption(option)}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--color-border)] hover:border-[var(--color-teal)] hover:bg-[var(--color-teal)]/5 transition-all text-left group"
                >
                  <span className="font-medium text-gray-700 group-hover:text-[var(--color-teal)]">
                    {option.label}
                  </span>
                  <i className="fas fa-arrow-right text-gray-300 group-hover:text-[var(--color-teal)] group-hover:translate-x-1 transition-all"></i>
                </button>
              ))}
            </div>

            {currentStep > 0 && (
              <button
                onClick={goBack}
                className="mt-6 text-sm text-[var(--color-muted)] hover:text-[var(--color-teal)] transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </button>
            )}
          </div>
        </div>
      )}

      {showResult && result && (
        <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] overflow-hidden">
          <div className={`${result.color} p-8 text-white text-center`}>
            <i className={`${result.icon} text-5xl mb-4`}></i>
            <h2 className="text-3xl font-extrabold mb-2">{result.title}</h2>
            <p className="text-white/85 max-w-2xl mx-auto">{result.message}</p>
          </div>

          <div className="p-8 md:p-10">
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className={`${result.colorLight} ${result.colorBorder} border rounded-xl p-5 text-center`}>
                <div className={`text-2xl font-extrabold ${result.colorText}`}>{totalScore}/18</div>
                <div className="text-sm text-gray-500 mt-1">Risk score</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
                <div className="text-2xl font-extrabold text-gray-900">{priceRanges[windowCount]}</div>
                <div className="text-sm text-gray-500 mt-1">Estimated price</div>
              </div>
              <div className="bg-[var(--color-teal)]/10 border border-[var(--color-teal)]/20 rounded-xl p-5 text-center">
                <div className="text-2xl font-extrabold text-[var(--color-teal)]">{energySavings[windowCount]}</div>
                <div className="text-sm text-gray-500 mt-1">Potential savings</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-3">
                <i className="fas fa-lightbulb text-[var(--color-red)] mr-2"></i>
                Vosthermos recommendation
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                This online diagnostic is a first indication. For a precise quote, send a few
                photos or book a free evaluation. We will confirm whether repair, sealed glass
                replacement or the OPTI-FENETRE program is the best option.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/en/contact"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-6 py-3 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-colors"
              >
                <i className="fas fa-file-alt"></i>
                Get a free quote
              </Link>
              <a
                href={`tel:${COMPANY_INFO.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                <i className="fas fa-phone"></i>
                {COMPANY_INFO.phone}
              </a>
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 border border-[var(--color-border)] text-gray-600 px-6 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-redo"></i>
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
