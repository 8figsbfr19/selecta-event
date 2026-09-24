"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePadLib from "signature_pad";

export default function SignaturePad({ name = "signatureDataUrl" }: { name?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      padRef.current?.clear();
    }

    resize();

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(20, 20, 25)",
      minWidth: 1,
      maxWidth: 2.5,
    });
    padRef.current = pad;

    const handleEnd = () => {
      const empty = pad.isEmpty();
      setIsEmpty(empty);
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = empty ? "" : pad.toDataURL("image/png");
      }
    };

    pad.addEventListener("endStroke", handleEnd);
    window.addEventListener("resize", resize);

    return () => {
      pad.removeEventListener("endStroke", handleEnd);
      window.removeEventListener("resize", resize);
      pad.off();
    };
  }, []);

  function handleClear() {
    padRef.current?.clear();
    setIsEmpty(true);
    if (hiddenInputRef.current) hiddenInputRef.current.value = "";
  }

  return (
    <div>
      <input ref={hiddenInputRef} type="hidden" name={name} />
      <div className="overflow-hidden rounded-xl border border-black/15 bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none sm:h-48"
          style={{ touchAction: "none" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-cream/40">
          {isEmpty ? "Draw your signature above" : "Signature captured"}
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5"
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
}
