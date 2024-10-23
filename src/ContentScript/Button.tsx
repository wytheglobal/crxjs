import React, { useEffect, useState, useRef } from 'react';

interface ButtonPosition {
  x: number;
  y: number;
  useRight: boolean;
}

function matchDomain(allowedDomain: string, currentDomain: string): boolean {
  if (allowedDomain.startsWith('*.')) {
    const suffix = allowedDomain.slice(2);
    return currentDomain.endsWith(suffix);
  }
  return currentDomain === allowedDomain;
}

const Button: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<ButtonPosition>({ x: 20, y: 20, useRight: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    chrome.storage.sync.get(['allowedDomains', 'buttonX', 'buttonY', 'useRight'], (result) => {
      const allowedDomains = result.allowedDomains ? result.allowedDomains.split(',') : [];
      const currentDomain = window.location.hostname;

      if (allowedDomains.some(domain => matchDomain(domain, currentDomain))) {
        setIsVisible(true);
        setPosition({
          x: result.buttonX || 20,
          y: result.buttonY || 20,
          useRight: result.useRight || false
        });
      }
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current && buttonRef.current) {
        const newX = e.clientX - startPosRef.current.x;
        const newY = e.clientY - startPosRef.current.y;
        const useRight = newX > window.innerWidth / 2;

        setPosition({
          x: useRight ? window.innerWidth - newX - buttonRef.current.offsetWidth : newX,
          y: newY,
          useRight
        });
        hasMovedRef.current = true;
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (hasMovedRef.current) {
          chrome.storage.sync.set({
            buttonX: position.x,
            buttonY: position.y,
            useRight: position.useRight
          });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    if (buttonRef.current) {
      startPosRef.current = {
        x: e.clientX - (position.useRight ? window.innerWidth - position.x - buttonRef.current.offsetWidth : position.x),
        y: e.clientY - position.y
      };
    }
    e.preventDefault();
  };

  const handleClick = () => {
    if (!hasMovedRef.current) {
      const currentUrl = encodeURIComponent(window.location.href);
      const freediumUrl = `https://freedium.cfd/${currentUrl}`;
      window.open(freediumUrl, '_blank');
    }
    hasMovedRef.current = false;
  };

  if (!isVisible) return null;

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        zIndex: 9999,
        padding: '10px',
        backgroundColor: '#1a8917',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'move',
        ...(position.useRight ? { right: `${position.x}px` } : { left: `${position.x}px` }),
        top: `${position.y}px`
      }}
    >
      Freedium
    </button>
  );
};

export default Button;
