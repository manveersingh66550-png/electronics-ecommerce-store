import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', icon, ...props }, ref) => {
        return (
            <div className={`${styles.inputWrapper} ${className}`}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <input
                    ref={ref}
                    className={`${styles.input} ${icon ? styles.withIcon : ''}`}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';
