import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [trailPoints, setTrailPoints] = useState<{x: number, y: number}[]>([]);
  const { theme } = useTheme();
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;
    
    const updatePosition = (e: MouseEvent) => {
      setTarget({ x: e.clientX, y: e.clientY });
      
      const targetElement = e.target as HTMLElement;
      const isPointerElement = 
        window.getComputedStyle(targetElement).cursor === 'pointer' ||
        targetElement.tagName === 'BUTTON' ||
        targetElement.tagName === 'A' ||
        targetElement.closest('button') !== null ||
        targetElement.closest('a') !== null;
      
      setIsPointer(isPointerElement);
      
      // Check if hovering over blog card or interactive element
      const isHoveringElement = 
        targetElement.classList.contains('blog-card') ||
        targetElement.closest('.blog-card') !== null ||
        targetElement.hasAttribute('data-tooltip') ||
        targetElement.closest('[data-tooltip]') !== null;
      
      setIsHovering(isHoveringElement);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const animate = () => {
      if (cursorRef.current && cursorDotRef.current) {
        // Add smooth following effect with spring physics
        const dx = target.x - positionRef.current.x;
        const dy = target.y - positionRef.current.y;
        
        // Apply easing for smooth movement
        const newX = positionRef.current.x + dx * 0.2;
        const newY = positionRef.current.y + dy * 0.2;
        
        // Update the ref directly instead of state for animation frame
        positionRef.current = { x: newX, y: newY };
        
        // Update the state less frequently to prevent re-renders
        setPosition({ x: newX, y: newY });
        
        // Add trail effect by keeping track of previous positions
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          setTrailPoints(prevPoints => {
            const newPoints = [...prevPoints, { x: newX, y: newY }];
            // Keep only the last 10 points for the trail
            if (newPoints.length > 8) {
              return newPoints.slice(newPoints.length - 8);
            }
            return newPoints;
          });
        }
        
        // 3D-like transform with perspective and rotation based on movement
        const rotateX = dy * 0.05;
        const rotateY = -dx * 0.05;
        const perspective = isHovering ? '800px' : '1000px';
        
        cursorRef.current.style.transform = `
          translate3d(${newX - cursorSize/2}px, ${newY - cursorSize/2}px, 0) 
          perspective(${perspective}) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg) 
          scale(${isClicking ? 0.8 : 1})
        `;
        
        cursorDotRef.current.style.transform = `translate3d(${target.x - dotSize/2}px, ${target.y - dotSize/2}px, 0) scale(${isClicking ? 1.8 : 1})`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    animate();

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, isHovering, isClicking]); // Remove position from dependencies

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null; // Don't show custom cursor on touch devices
  }

  const cursorColor = theme === 'dark' 
    ? 'rgba(229, 9, 20, 0.8)' 
    : 'rgba(229, 9, 20, 0.6)';

  const hoverColor = theme === 'dark'
    ? 'rgba(41, 121, 255, 0.8)'
    : 'rgba(41, 121, 255, 0.7)';

  const cursorSize = isPointer ? 44 : (isHovering ? 70 : 36);
  const dotSize = isPointer ? 5 : (isClicking ? 7 : 4);

  return (
    <>
      {/* Trail effect */}
      <div className="fixed pointer-events-none z-[9998] will-change-transform">
        {trailPoints.map((point, index) => (
          <div 
            key={index}
            className="absolute rounded-full"
            style={{
              width: `${dotSize * 0.7}px`,
              height: `${dotSize * 0.7}px`,
              backgroundColor: isHovering ? hoverColor : cursorColor,
              opacity: (index / trailPoints.length) * 0.3,
              transform: `translate3d(${point.x - (dotSize * 0.7)/2}px, ${point.y - (dotSize * 0.7)/2}px, 0)`,
              transition: 'opacity 0.2s ease'
            }}
          />
        ))}
      </div>
      
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] will-change-transform"
        style={{
          width: `${cursorSize}px`,
          height: `${cursorSize}px`
        }}
      >
        <div 
          className={`
            absolute rounded-full transition-all duration-300 ease-out
            border backdrop-blur-sm
            ${isPointer ? 'animate-pulse' : ''}
            ${isHovering ? 'animate-[pulse_2s_infinite]' : ''}
          `}
          style={{
            width: '100%',
            height: '100%',
            borderColor: isHovering ? hoverColor : cursorColor,
            borderWidth: isPointer ? '2px' : '1px',
            backgroundColor: isHovering 
              ? `${hoverColor.replace(')', ', 0.05)')}` 
              : `${cursorColor.replace(')', ', 0.05)')}`,
            boxShadow: isPointer 
              ? `0 0 15px ${isHovering ? hoverColor : cursorColor}, 0 0 5px ${isHovering ? hoverColor : cursorColor} inset` 
              : isHovering 
                ? `0 0 10px ${hoverColor}` 
                : 'none',
            opacity: isHovering ? 0.95 : 0.7
          }}
        />
        
        {/* Add futuristic elements */}
        {(isPointer || isHovering) && (
          <>
            <div className="absolute top-0 left-1/2 w-1 h-[3px] bg-white/60 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <div className="absolute bottom-0 left-1/2 w-1 h-[3px] bg-white/60 -translate-x-1/2 translate-y-1/2 rounded-full" />
            <div className="absolute left-0 top-1/2 w-[3px] h-1 bg-white/60 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <div className="absolute right-0 top-1/2 w-[3px] h-1 bg-white/60 translate-x-1/2 -translate-y-1/2 rounded-full" />
          </>
        )}
      </div>
      
      {/* Center dot */}
      <div
        ref={cursorDotRef}
        className="fixed pointer-events-none z-[10000] will-change-transform mix-blend-difference"
      >
        <div 
          className="rounded-full transition-all duration-200"
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            backgroundColor: 'white'
          }}
        />
      </div>
    </>
  );
}