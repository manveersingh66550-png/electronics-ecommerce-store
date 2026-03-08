"use client";

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    style?: React.CSSProperties;
}

export const AnimatedSection = ({ children, className = '', delay = 0, direction = 'up', style }: AnimatedSectionProps) => {
    let initialY = 0;
    let initialX = 0;
    if (direction === 'up') initialY = 40;
    if (direction === 'down') initialY = -40;
    if (direction === 'left') initialX = 40;
    if (direction === 'right') initialX = -40;

    return (
        <motion.div
            className={className}
            style={style}
            initial={{ opacity: 0, y: initialY, x: initialX }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
        >
            {children}
        </motion.div>
    );
};
