import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'dashboard';
  count?: number;
  height?: string;
  className?: string;
}

export default function SkeletonLoader({ 
  type = 'card', 
  count = 3, 
  height = '120px',
  className = '' 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`${styles.skeletonCard} ${className}`} style={{ height }}>
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonAvatar}></div>
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: '70%' }}></div>
                <div className={styles.skeletonLine} style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
              <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`${styles.skeletonTable} ${className}`}>
            <div className={styles.skeletonTableHeader}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonLine} style={{ width: '100%' }}></div>
              ))}
            </div>
            <div className={styles.skeletonTableBody}>
              {[...Array(5)].map((_, rowIndex) => (
                <div key={rowIndex} className={styles.skeletonTableRow}>
                  {[...Array(4)].map((_, colIndex) => (
                    <div key={colIndex} className={styles.skeletonLine}></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`${styles.skeletonList} ${className}`}>
            <div className={styles.skeletonListItem}>
              <div className={styles.skeletonAvatar}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
                <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className={`${styles.skeletonDashboard} ${className}`}>
            {/* Stats GrApps */}
            <div className={styles.skeletonStatsGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonStatCard}>
                  <div className={styles.skeletonAvatar} style={{ borderRadius: '8px' }}></div>
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
                    <div className={styles.skeletonLine} style={{ width: '50%' }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Content GrApps */}
            <div className={styles.skeletonContentGrid}>
              <div className={styles.skeletonSection}>
                <div className={styles.skeletonLine} style={{ width: '30%', marginBottom: '20px' }}></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={styles.skeletonListItem}>
                    <div className={styles.skeletonAvatar}></div>
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonLine} style={{ width: '70%' }}></div>
                      <div className={styles.skeletonLine} style={{ width: '50%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.skeletonSection}>
                <div className={styles.skeletonLine} style={{ width: '40%', marginBottom: '20px' }}></div>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className={styles.skeletonCard} style={{ height: '100px' }}>
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonLine}></div>
                      <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${styles.skeletonDefault} ${className}`} style={{ height }}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
            <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
          </div>
        );
    }
  };

  return (
    <div className={styles.skeletonContainer}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={styles.skeletonItem}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
} 