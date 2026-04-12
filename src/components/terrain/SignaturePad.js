"use client";

import { useRef, useEffect, useState } from "react";

export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  }

  function endDraw(e) {
    e.preventDefault();
    setIsDrawing(false);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  function save() {
    if (!hasSignature) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
  }

  return (
    <div>
      <div className="border-2 border-dashed border-white/20 rounded-xl overflow-hidden mb-3 bg-white/5">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: "200px" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <p className="text-white/30 text-xs text-center mb-3">Signez avec votre doigt ci-dessus</p>
      <div className="flex gap-3">
        <button
          onClick={clear}
          className="flex-1 py-3 rounded-xl bg-white/10 text-white/60 font-medium text-sm active:bg-white/20 transition-colors"
        >
          Effacer
        </button>
        <button
          onClick={save}
          disabled={!hasSignature}
          className="flex-1 py-3 rounded-xl bg-[var(--color-red)] text-white font-bold text-sm disabled:opacity-30 active:bg-[var(--color-red-dark)] transition-colors"
        >
          Confirmer la signature
        </button>
      </div>
    </div>
  );
}
