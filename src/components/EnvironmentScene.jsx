import { useEffect, useRef } from "react";
import { SCENES, parts } from "../lib/scenes";

// Animated, code-drawn scene for an environment. Scene time only advances
// while audio is playing, so the scene freezes when playback pauses.
function EnvironmentScene({ sceneKey, tint, playing, intensity = 1, className }) {
  const canvasRef = useRef(null);
  const playingRef = useRef(playing);
  const sceneRef = useRef({ sceneKey, tint, intensity });
  const redrawRef = useRef(null);

  useEffect(() => {
    playingRef.current = playing;
    sceneRef.current = { sceneKey, tint, intensity };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let t = 0;
    let last = performance.now();
    let raf = 0;

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { sceneKey: key, tint: tnt, intensity: k } = sceneRef.current;
      const name = SCENES[key] ? key : "fallback";
      try {
        SCENES[name](ctx, w, h, t, parts(name), k, tnt);
      } catch {
        // a bad frame shouldn't take the page down
      }
    }

    if (reduceMotion) {
      // Reduced motion: a single still frame, redrawn only when the size changes.
      draw();
      redrawRef.current = draw;
      const ro = new ResizeObserver(draw);
      ro.observe(canvas);
      return () => {
        redrawRef.current = null;
        ro.disconnect();
      };
    }

    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playingRef.current) t += dt;
      draw();
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Redraw the still frame when the scene itself changes under reduced motion.
  useEffect(() => {
    redrawRef.current?.();
  }, [sceneKey, tint, intensity]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

export default EnvironmentScene;
