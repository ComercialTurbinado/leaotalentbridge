'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import styles from './AnimatedBackground.module.css';

const AnimatedBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Criar partículas douradas
    if (backgroundRef.current) {
      // Aumentar o número de partículas
      const particleCount = 60;
      
      // Limpar partículas existentes
      backgroundRef.current.innerHTML = '';
      
      // Criar novas partículas
      for (let i = 0; i < particleCount; i++) {
        // Determinar o tipo de partícula
        const particleTypeRandom = Math.random();
        let particleType = 'circle';
        
        if (particleTypeRandom > 0.7) {
          particleType = 'star';
        } else if (particleTypeRandom > 0.5) {
          particleType = 'diamond';
        } else if (particleTypeRandom > 0.3) {
          particleType = 'plus';
        }
        
        const particle = document.createElement('div');
        
        // Aplicar classe com base no tipo
        switch(particleType) {
          case 'star':
            particle.className = `${styles.particle} ${styles.starParticle}`;
            break;
          case 'diamond':
            particle.className = `${styles.particle} ${styles.diamondParticle}`;
            break;
          case 'plus':
            particle.className = `${styles.particle} ${styles.plusParticle}`;
            break;
          default:
            particle.className = styles.particle;
        }
        
        // Posição aleatória
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Porte aleatório com maior variação
        const size = Math.random() * 10 + 2;
        
        // Opacidade aleatória
        const opacity = Math.random() * 0.5 + 0.05;
        
        // Profundidade aleatória (z-index)
        const zIndex = Math.floor(Math.random() * 10);
        
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = opacity.toString();
        particle.style.zIndex = zIndex.toString();
        
        // Adicionar rotação para partículas especiais
        if (particleType !== 'circle') {
          particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        }
        
        backgroundRef.current.appendChild(particle);
      }
      
      // Adicionar elemento de destaque central
      const spotlight = document.createElement('div');
      spotlight.className = styles.spotlight;
      backgroundRef.current.appendChild(spotlight);
      
      // Animar partículas circulares
      anime({
        targets: `.${styles.particle}:not(.${styles.starParticle}):not(.${styles.diamondParticle}):not(.${styles.plusParticle})`,
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        translateZ: () => anime.random(0, 50),
        opacity: [
          { value: [0.05, 0.2], duration: 2000 },
          { value: 0.05, duration: 2000 }
        ],
        scale: [
          { value: [0.8, 1.5], duration: 2000 },
          { value: 0.8, duration: 2000 }
        ],
        easing: 'easeInOutQuad',
        duration: 6000,
        delay: anime.stagger(100),
        loop: true,
        direction: 'alternate'
      });
      
      // Animar partículas estrela com movimento diferente
      anime({
        targets: `.${styles.starParticle}`,
        translateX: () => anime.random(-150, 150),
        translateY: () => anime.random(-150, 150),
        translateZ: () => anime.random(0, 80),
        rotate: () => anime.random(-360, 360),
        opacity: [
          { value: [0.05, 0.4], duration: 2000 },
          { value: 0.05, duration: 2000 }
        ],
        scale: [
          { value: [0.5, 2], duration: 2000 },
          { value: 0.5, duration: 2000 }
        ],
        easing: 'easeOutElastic(1, .6)',
        duration: 8000,
        delay: anime.stagger(150),
        loop: true,
        direction: 'alternate'
      });
      
      // Animar partículas diamante
      anime({
        targets: `.${styles.diamondParticle}`,
        translateX: () => anime.random(-120, 120),
        translateY: () => anime.random(-120, 120),
        translateZ: () => anime.random(0, 60),
        rotate: () => anime.random(-45, 45),
        opacity: [
          { value: [0.05, 0.3], duration: 1500 },
          { value: 0.05, duration: 1500 }
        ],
        scale: [
          { value: [0.8, 1.8], duration: 1500 },
          { value: 0.8, duration: 1500 }
        ],
        easing: 'easeInOutSine',
        duration: 7000,
        delay: anime.stagger(120),
        loop: true,
        direction: 'alternate'
      });
      
      // Animar partículas plus
      anime({
        targets: `.${styles.plusParticle}`,
        translateX: () => anime.random(-80, 80),
        translateY: () => anime.random(-80, 80),
        translateZ: () => anime.random(0, 40),
        rotate: () => anime.random(0, 90),
        opacity: [
          { value: [0.05, 0.25], duration: 1200 },
          { value: 0.05, duration: 1200 }
        ],
        scale: [
          { value: [0.6, 1.2], duration: 1200 },
          { value: 0.6, duration: 1200 }
        ],
        easing: 'easeOutCirc',
        duration: 5000,
        delay: anime.stagger(80),
        loop: true,
        direction: 'alternate'
      });
      
      // Animar o spotlight
      anime({
        targets: `.${styles.spotlight}`,
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.2, 1],
        easing: 'easeInOutSine',
        duration: 8000,
        loop: true
      });
      
      // Adicionar efeito de pulso no fundo
      anime({
        targets: backgroundRef.current,
        background: [
          { value: 'rgba(0, 0, 0, 0.7)' },
          { value: 'rgba(0, 0, 0, 0.85)' },
          { value: 'rgba(0, 0, 0, 0.7)' }
        ],
        duration: 8000,
        easing: 'easeInOutSine',
        loop: true
      });
    }
  }, []);

  return <div className={styles.animatedBackground} ref={backgroundRef}></div>;
};

export default AnimatedBackground; 