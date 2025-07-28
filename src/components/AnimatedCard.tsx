'use client';

import React, { useRef, useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import styles from './AnimatedCard.module.css';

interface AnimatedCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  number, 
  icon, 
  title, 
  description,
  delay = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);

  // Animação quando o componente aparece na viewport
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animar o card
          anime({
            targets: cardRef.current,
            translateY: [50, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1000,
            delay: delay
          });

          // Animar o número
          anime({
            targets: numberRef.current,
            scale: [0, 1],
            rotate: [45, 0],
            opacity: [0, 1],
            easing: 'easeOutElastic(1, .6)',
            duration: 1200,
            delay: delay + 300
          });

          // Animar o ícone
          anime({
            targets: iconRef.current,
            translateY: [20, 0],
            opacity: [0, 1],
            scale: [0.8, 1],
            easing: 'easeOutBack',
            duration: 800,
            delay: delay + 500
          });

          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  // Animação de hover
  const handleMouseEnter = () => {
    anime({
      targets: iconRef.current,
      scale: 1.2,
      rotate: '5deg',
      duration: 300,
      easing: 'easeOutQuad'
    });
    
    anime({
      targets: cardRef.current?.querySelector('h3'),
      translateY: -5,
      color: '#D4AF37',
      duration: 300,
      easing: 'easeOutQuad'
    });
  };

  const handleMouseLeave = () => {
    anime({
      targets: iconRef.current,
      scale: 1,
      rotate: '0deg',
      duration: 300,
      easing: 'easeOutQuad'
    });
    
    anime({
      targets: cardRef.current?.querySelector('h3'),
      translateY: 0,
      color: '#ffffff',
      duration: 300,
      easing: 'easeOutQuad'
    });
  };

  return (
    <div 
      className={styles.animatedCard} 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.stepNumber} ref={numberRef}>{number}</div>
      <div className={styles.stepIcon} ref={iconRef}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default AnimatedCard; 