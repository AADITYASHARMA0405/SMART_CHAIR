import { useEffect, useRef } from 'react';
import { initThreeScene } from '../../js/three-scene.js';

const Scene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set real pixel dimensions so Three.js doesn't see 0x0
    canvas.width = canvas.parentElement.offsetWidth || window.innerWidth * 0.55;
    canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;

    const cleanup = initThreeScene();

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '55%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <canvas
        id="hero-canvas"
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};

export default Scene;