import React, { HTMLAttributes } from 'react';
import styles from './GlassPanel.module.css';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const GlassPanel = ({ children, className = '', as: Component = 'div', ...props }: GlassPanelProps) => {
  return (
    <Component className={`${styles.panel} ${className}`} {...props}>
      {children}
    </Component>
  );
};
