import React from 'react';
import styles from './index.module.css';

export default function TerminalCard({ title, children, className = '', glowing = false }) {
  return (
    <div className={`${styles.card} ${glowing ? styles.glowing : ''} ${className}`}>
      {title && (
        <div className={styles.titleBar}>
          <div className={styles.titleInner}>
            <div className={styles.lights}>
              <span className={`${styles.light} ${styles.red}`}></span>
              <span className={`${styles.light} ${styles.yellow}`}></span>
              <span className={`${styles.light} ${styles.green}`}></span>
            </div>
            <span className={styles.title}>{title}</span>
          </div>
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}

