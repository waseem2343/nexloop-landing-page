/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, MouseEvent, ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  key?: string;
}

export default function SpotlightCard({ children, className = '', id }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <div
      ref={cardRef}
      id={id}
      className={`glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col relative overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="spotlight-glow"
        style={{
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      {children}
    </div>
  );
}
