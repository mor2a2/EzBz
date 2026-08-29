'use client';

import { useRef } from 'react';
import Link from 'next/link';

const DRAG_THRESHOLD = 8; // px — pointer movement beyond this between press and release means "drag", not "tap"
const WHEEL_SUPPRESS_MS = 400; // suppress a click this long after the last wheel/scroll event, anywhere in the list

let lastWheelAt = 0;

export default function StageRow({ href, className, children }) {
  const startPos = useRef(null);
  const wasDrag = useRef(false);

  function handlePointerDown(e) {
    startPos.current = { x: e.clientX, y: e.clientY };
    wasDrag.current = false;
  }

  function handlePointerMove(e) {
    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
      wasDrag.current = true;
    }
  }

  function handleWheel() {
    lastWheelAt = Date.now();
  }

  function handleClick(e) {
    const recentWheel = Date.now() - lastWheelAt < WHEEL_SUPPRESS_MS;
    if (wasDrag.current || recentWheel) {
      e.preventDefault();
    }
  }

  return (
    <Link
      href={href}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
