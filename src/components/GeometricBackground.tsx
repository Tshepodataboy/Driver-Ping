import React, { useEffect, useRef } from 'react';

type ShapeType =
  | 'cube'
  | 'triangle'
  | 'rhombus'
  | 'hexagon'
  | 'pingRing'
  | 'stopSign'
  | 'speedLimitSign'
  | 'yieldSign'
  | 'routeSign'
  | 'trafficLight'
  | 'roadCone'
  | 'carSilhouette';

interface Shape {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  type: ShapeType;
  color: string;
  alpha: number;
  pulseSpeed?: number;
  pulsePhase?: number;
  extraVal?: string;
}

export function GeometricBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color Palette: Driver Ping Crimson, Gold, Deep Purple & Neon Coral
    const palette = [
      'rgba(255, 59, 92, ',   // Neon Crimson/Red
      'rgba(255, 215, 0, ',   // Gold
      'rgba(184, 29, 57, ',   // Driver Ping Crimson
      'rgba(147, 51, 234, ',  // Purple
      'rgba(255, 255, 255, ', // Pure White
    ];

    // Array of Shape Types combining Abstract Geometry and Road Components
    const shapeTypes: ShapeType[] = [
      'stopSign',
      'speedLimitSign',
      'yieldSign',
      'routeSign',
      'trafficLight',
      'roadCone',
      'carSilhouette',
      'cube',
      'triangle',
      'rhombus',
      'hexagon',
      'pingRing',
    ];

    const speedOptions = ['120', '100', '80', '60'];
    const routeOptions = ['N1', 'M4', 'R101', 'N2', 'N3'];

    const shapes: Shape[] = Array.from({ length: 34 }, (_, idx) => {
      const colorBase = palette[Math.floor(Math.random() * palette.length)];
      const type = shapeTypes[idx % shapeTypes.length];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 26 + 16,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.012,
        type,
        color: colorBase,
        alpha: Math.random() * 0.35 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
        extraVal:
          type === 'speedLimitSign'
            ? speedOptions[Math.floor(Math.random() * speedOptions.length)]
            : type === 'routeSign'
            ? routeOptions[Math.floor(Math.random() * routeOptions.length)]
            : undefined,
      };
    });

    let time = 0;

    // Drawing Helpers
    const drawRegularPolygon = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      sides: number,
      angle: number
    ) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = angle + (i * 2 * Math.PI) / sides;
        const px = x + radius * Math.cos(a);
        const py = y + radius * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const drawWireframe3DCube = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      angle: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const hs = size / 2;
      const off = size * 0.35;

      ctx.beginPath();
      ctx.rect(-hs, -hs, size, size);
      ctx.rect(-hs + off, -hs - off, size, size);

      ctx.moveTo(-hs, -hs);
      ctx.lineTo(-hs + off, -hs - off);

      ctx.moveTo(hs, -hs);
      ctx.lineTo(hs + off, -hs - off);

      ctx.moveTo(hs, hs);
      ctx.lineTo(hs + off, hs - off);

      ctx.moveTo(-hs, hs);
      ctx.lineTo(-hs + off, hs - off);

      ctx.stroke();
      ctx.restore();
    };

    // 1. STOP SIGN
    const drawStopSign = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      angle: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * 0.1); // subtle rotation for stability

      // Pole
      ctx.strokeStyle = `rgba(156, 163, 175, ${alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.8);
      ctx.lineTo(0, size * 1.8);
      ctx.stroke();

      // Octagon Body
      ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.85})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.lineWidth = Math.max(1.5, size * 0.08);

      drawRegularPolygon(ctx, 0, 0, size, 8, Math.PI / 8);
      ctx.fill();
      ctx.stroke();

      // Inner border
      ctx.lineWidth = 1;
      drawRegularPolygon(ctx, 0, 0, size * 0.84, 8, Math.PI / 8);
      ctx.stroke();

      // Text
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.font = `900 ${Math.round(size * 0.48)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('STOP', 0, 1);

      ctx.restore();
    };

    // 2. SPEED LIMIT SIGN
    const drawSpeedLimitSign = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      speedText: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);

      // White Circle Fill
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();

      // Red Ring
      ctx.strokeStyle = `rgba(220, 38, 38, ${alpha * 0.95})`;
      ctx.lineWidth = size * 0.22;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.88, 0, Math.PI * 2);
      ctx.stroke();

      // Speed Number
      ctx.fillStyle = `rgba(17, 24, 39, ${alpha * 0.95})`;
      ctx.font = `900 ${Math.round(size * 0.62)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(speedText, 0, 1);

      ctx.restore();
    };

    // 3. YIELD / CAUTION SIGN
    const drawYieldSign = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      angle: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * 0.15);

      // Inverted Triangle
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.strokeStyle = `rgba(220, 38, 38, ${alpha * 0.95})`;
      ctx.lineWidth = size * 0.2;

      const h = size * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.lineTo(-size, -h * 0.5);
      ctx.lineTo(size, -h * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Exclamation
      ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.9})`;
      ctx.font = `900 ${Math.round(size * 0.55)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, -h * 0.05);

      ctx.restore();
    };

    // 4. ROUTE DIRECTION SIGN (e.g., N1)
    const drawRouteSign = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      routeName: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);

      const w = size * 1.9;
      const h = size * 1.25;

      ctx.fillStyle = `rgba(16, 122, 87, ${alpha * 0.85})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // Inner white line
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, 4);
      ctx.stroke();

      // Route text
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.font = `bold ${Math.round(size * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`↑ ${routeName}`, 0, 0);

      ctx.restore();
    };

    // 5. TRAFFIC LIGHT
    const drawTrafficLight = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      timeVal: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);

      const w = size * 0.85;
      const h = size * 2.3;

      ctx.fillStyle = `rgba(17, 24, 39, ${alpha * 0.9})`;
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.5})`;
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      const lightR = size * 0.22;
      const cycle = Math.sin(timeVal * 1.5 + x * 0.01);
      const redActive = cycle > 0.2;
      const amberActive = cycle > -0.3 && cycle <= 0.2;
      const greenActive = cycle <= -0.3;

      // Red
      ctx.fillStyle = redActive ? `rgba(239, 68, 68, ${alpha * 0.95})` : `rgba(127, 29, 29, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, -h * 0.3, lightR, 0, Math.PI * 2);
      ctx.fill();

      // Amber
      ctx.fillStyle = amberActive ? `rgba(245, 158, 11, ${alpha * 0.95})` : `rgba(120, 53, 15, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, 0, lightR, 0, Math.PI * 2);
      ctx.fill();

      // Green
      ctx.fillStyle = greenActive ? `rgba(16, 185, 129, ${alpha * 0.95})` : `rgba(6, 78, 59, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, h * 0.3, lightR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 6. ROAD CONE
    const drawRoadCone = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);

      const h = size * 1.6;
      const baseW = size * 1.2;

      // Cone Base
      ctx.fillStyle = `rgba(234, 88, 12, ${alpha * 0.9})`;
      ctx.fillRect(-baseW / 2, h / 2 - 4, baseW, 4);

      // Body
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(-baseW * 0.4, h / 2 - 4);
      ctx.lineTo(baseW * 0.4, h / 2 - 4);
      ctx.closePath();
      ctx.fill();

      // Reflective stripe
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.moveTo(-baseW * 0.18, -h * 0.05);
      ctx.lineTo(baseW * 0.18, -h * 0.05);
      ctx.lineTo(baseW * 0.28, h * 0.2);
      ctx.lineTo(-baseW * 0.28, h * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    // 7. CAR SILHOUETTE
    const drawCarSilhouette = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      angle: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * 0.2);

      const w = size * 2.2;
      const h = size * 0.9;

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.fillStyle = `rgba(184, 29, 57, ${alpha * 0.25})`;
      ctx.lineWidth = 1.4;

      ctx.beginPath();
      ctx.moveTo(-w * 0.45, h * 0.3);
      ctx.lineTo(-w * 0.45, -h * 0.05);
      ctx.lineTo(-w * 0.25, -h * 0.15);
      ctx.lineTo(-w * 0.1, -h * 0.45);
      ctx.lineTo(w * 0.15, -h * 0.45);
      ctx.lineTo(w * 0.32, -h * 0.1);
      ctx.lineTo(w * 0.45, -h * 0.05);
      ctx.lineTo(w * 0.45, h * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wheels
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(-w * 0.25, h * 0.3, size * 0.22, 0, Math.PI * 2);
      ctx.arc(w * 0.25, h * 0.3, size * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Headlight
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(-w * 0.44, -h * 0.02, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Taillight
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(w * 0.44, -h * 0.02, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Perspective Road Grid
      const horizonY = height * 0.25;
      const centerX = width * 0.5;

      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';

      // Radiating Road Lane Lines
      const lineCount = 18;
      for (let i = -lineCount / 2; i <= lineCount / 2; i++) {
        const targetX = centerX + i * (width / 8);
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.lineTo(targetX, height);
        ctx.stroke();
      }

      // Horizontal Isometric Grid Lines
      const numHoriz = 12;
      for (let i = 1; i <= numHoriz; i++) {
        const progress = Math.pow(i / numHoriz, 2.2);
        const gy = horizonY + progress * (height - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Animated Dash Markers down the Center Road Lane
      const dashOffset = (time * 120) % 80;
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)'; // Gold highway dashes
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 10; i++) {
        const p1 = Math.pow((i * 40 + dashOffset) / 400, 2);
        const p2 = Math.pow((i * 40 + dashOffset + 20) / 400, 2);
        if (p1 >= 0 && p2 <= 1) {
          const y1 = horizonY + p1 * (height - horizonY);
          const y2 = horizonY + p2 * (height - horizonY);
          ctx.beginPath();
          ctx.moveTo(centerX, y1);
          ctx.lineTo(centerX, y2);
          ctx.stroke();
        }
      }

      ctx.restore();

      // 2. Intersecting Constellation Lines
      ctx.save();
      ctx.lineWidth = 0.6;
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const dx = shapes[i].x - shapes[j].x;
          const dy = shapes[i].y - shapes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(shapes[i].x, shapes[i].y);
            ctx.lineTo(shapes[j].x, shapes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 3. Render Floating Shapes & Road Components
      shapes.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.vRot;
        if (s.pulsePhase !== undefined && s.pulseSpeed !== undefined) {
          s.pulsePhase += s.pulseSpeed;
        }

        if (s.x < -60) s.x = width + 60;
        if (s.x > width + 60) s.x = -60;
        if (s.y < -60) s.y = height + 60;
        if (s.y > height + 60) s.y = -60;

        const currentAlpha =
          s.alpha + (s.pulsePhase ? Math.sin(s.pulsePhase) * 0.1 : 0);
        const clampedAlpha = Math.max(0.08, Math.min(0.65, currentAlpha));

        if (s.type === 'stopSign') {
          drawStopSign(ctx, s.x, s.y, s.size, s.rotation, clampedAlpha);
        } else if (s.type === 'speedLimitSign') {
          drawSpeedLimitSign(
            ctx,
            s.x,
            s.y,
            s.size,
            s.extraVal || '120',
            clampedAlpha
          );
        } else if (s.type === 'yieldSign') {
          drawYieldSign(ctx, s.x, s.y, s.size, s.rotation, clampedAlpha);
        } else if (s.type === 'routeSign') {
          drawRouteSign(
            ctx,
            s.x,
            s.y,
            s.size,
            s.extraVal || 'N1',
            clampedAlpha
          );
        } else if (s.type === 'trafficLight') {
          drawTrafficLight(ctx, s.x, s.y, s.size, time, clampedAlpha);
        } else if (s.type === 'roadCone') {
          drawRoadCone(ctx, s.x, s.y, s.size, clampedAlpha);
        } else if (s.type === 'carSilhouette') {
          drawCarSilhouette(ctx, s.x, s.y, s.size, s.rotation, clampedAlpha);
        } else {
          // Abstract Geometric Primitives
          ctx.save();
          ctx.strokeStyle = `${s.color}${clampedAlpha})`;
          ctx.fillStyle = `${s.color}${clampedAlpha * 0.18})`;
          ctx.lineWidth = 1.4;

          if (s.type === 'cube') {
            drawWireframe3DCube(ctx, s.x, s.y, s.size, s.rotation);
          } else if (s.type === 'triangle') {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            drawRegularPolygon(ctx, 0, 0, s.size, 3, 0);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          } else if (s.type === 'hexagon') {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            drawRegularPolygon(ctx, 0, 0, s.size, 6, 0);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          } else if (s.type === 'rhombus') {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.beginPath();
            ctx.moveTo(0, -s.size);
            ctx.lineTo(s.size * 0.6, 0);
            ctx.lineTo(0, s.size);
            ctx.lineTo(-s.size * 0.6, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          } else if (s.type === 'pingRing') {
            ctx.save();
            const ringRadius = s.size + Math.sin(time * 2 + s.x) * 8;
            ctx.beginPath();
            ctx.arc(s.x, s.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.arc(s.x, s.y, ringRadius * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          ctx.fillStyle = `${s.color}${clampedAlpha * 1.5})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* HTML5 Animated Canvas Geometry Art with Road Components */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Ambient Crimson & Gold Radial Glow Spotlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* SVG Geometric Mosaic Pattern Overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="geo-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(30)"
          >
            <path
              d="M30 0 L60 15 L60 45 L30 60 L0 45 L0 15 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
            <path
              d="M30 0 L30 60 M0 15 L60 45 M60 15 L0 45"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo-pattern)" />
      </svg>
    </div>
  );
}

