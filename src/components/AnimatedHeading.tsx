'use client';

import React, { useRef, useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import styles from './AnimatedHeading.module.css';

interface AnimatedHeadingProps {
  title: string;
  subtitle?: string;
  level?: 1 | 2 | 3;
  className?: string;
}

const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({ 
  title, 
  subtitle, 
  level = 2,
  className = ''
}) => {
  const headingRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animar a linha com fade simples
    if (lineRef.current) {
      lineRef.current.style.opacity = '0';
      lineRef.current.style.transform = 'scaleX(0)';
      
      setTimeout(() => {
        anime({
          targets: lineRef.current,
          opacity: [0, 1],
          scaleX: [0, 1],
          easing: 'easeOutExpo',
          duration: 2000
        });
      }, 200);
    }

    // Animar o título como um bloco único com fade e blur
    if (titleRef.current) {
      titleRef.current.style.opacity = '0';
      titleRef.current.style.filter = 'blur(10px)';
      
      setTimeout(() => {
        anime({
          targets: titleRef.current,
          opacity: [0, 1],
          filter: ['blur(10px)', 'blur(0px)'],
          easing: 'easeOutExpo',
          duration: 2000,
          complete: () => {
            // Garantir que o título esteja 100% visível no final
            if (titleRef.current) {
              titleRef.current.style.opacity = '1';
              titleRef.current.style.filter = 'blur(0px)';
            }
          }
        });
      }, 0);
    }

    // Animar o subtítulo com fade simples
    if (subtitleRef.current) {
      subtitleRef.current.style.opacity = '0';
      subtitleRef.current.style.filter = 'blur(5px)';
      
      setTimeout(() => {
        anime({
          targets: subtitleRef.current,
          opacity: [0, 1],
          filter: ['blur(5px)', 'blur(0px)'],
          easing: 'easeOutExpo',
          duration: 2000,
          complete: () => {
            // Garantir que o subtítulo esteja 100% visível no final
            if (subtitleRef.current) {
              subtitleRef.current.style.opacity = '1';
              subtitleRef.current.style.filter = 'blur(0px)';
            }
          }
        });
      }, 400);
    }
  }, [title]);

  const HeadingTag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
  const headingClass = level === 1 ? 'heading-1' : level === 2 ? 'heading-2' : 'heading-3';

  return (
    <div className={`${styles.animatedHeading} ${className}`} ref={headingRef}>
      <HeadingTag 
        className={`${headingClass} ${styles.title}`} 
        ref={titleRef as any}
      >
        {title}
      </HeadingTag>
      
      <div className={styles.line} ref={lineRef}></div>
      
      {subtitle && (
        <p 
          className={styles.subtitle} 
          ref={subtitleRef}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default AnimatedHeading; 