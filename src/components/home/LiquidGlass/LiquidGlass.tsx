"use client";

import React, { useId, useMemo, useRef, useState, useEffect } from 'react';

// Default configuration based on the Framer component's presets
interface LiquidGlassConfig {
    scale: number;
    radius: number;
    border: number;
    lightness: number;
    displace: number;
    alpha: number;
    blur: number;
    dispersion: number;
    frost: number;
    borderColor: string;
    blend: string;
    x: string;
    y: string;
}

const DEFAULT_CONFIG: LiquidGlassConfig = {
    scale: 160,
    radius: 32,
    border: 0.05,
    lightness: 53,
    displace: 0.38,
    alpha: 0.9,
    blur: 5,
    dispersion: 50,
    frost: 0.1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    blend: "difference",
    x: "R",
    y: "B"
};

interface LiquidGlassProps {
    children?: React.ReactNode;
    className?: string;
    config?: Partial<LiquidGlassConfig>;
}

export const LiquidGlass = ({ children, className = '', config: customConfig }: LiquidGlassProps) => {
    const config = { ...DEFAULT_CONFIG, ...customConfig };

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 200 });

    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            if (width === 0 || height === 0) return;
            setDimensions({ width, height });
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    const displacementDataUri = useMemo(() => {
        const { width, height } = dimensions;
        const newwidth = width / 2;
        const newheight = height / 2;
        const border = Math.min(newwidth, newheight) * (config.border * 0.5);
        const effectiveRadius = Math.min(config.radius, width / 2, height / 2);

        const svgContent = `
      <svg viewBox="0 0 ${newwidth} ${newheight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${newwidth}" height="${newheight}" fill="black"/>
        <rect x="0" y="0" width="${newwidth}" height="${newheight}" rx="${effectiveRadius}" fill="url(#red)" />
        <rect x="0" y="0" width="${newwidth}" height="${newheight}" rx="${effectiveRadius}" fill="url(#blue)" style="mix-blend-mode: ${config.blend}" />
        <rect x="${border}" y="${border}" width="${newwidth - border * 2}" height="${newheight - border * 2}" rx="${effectiveRadius}" fill="hsl(0 0% ${config.lightness}% / ${config.alpha})" style="filter:blur(${config.blur}px)" />
      </svg>
    `;
        const encoded = encodeURIComponent(svgContent);
        return `data:image/svg+xml,${encoded}`;
    }, [dimensions, config]);

    const uniqueFilterId = useId();
    // Replacing colons because React useId generates strings like ":r1:" which are invalid for CSS selectors
    const filterId = `liquid-glass-filter-${uniqueFilterId.replace(/:/g, '')}`;
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const glassMorphismStyle: React.CSSProperties = {
        width: "100%",
        height: "100%",
        borderRadius: config.radius,
        position: "absolute",
        zIndex: 1,
        background: `hsl(0 0% 100% / ${config.frost})`,
        backdropFilter: `url(#${filterId})`,
        WebkitBackdropFilter: `url(#${filterId})`
    };

    const gradientBorderStyle: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        borderRadius: config.radius,
        zIndex: 2,
        pointerEvents: "none",
        background: `linear-gradient(315deg, ${config.borderColor} 0%, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0) 70%, ${config.borderColor} 100%) border-box`,
        mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        border: `1px solid transparent`
    };

    return (
        <div ref={containerRef} className={className} style={{ position: "relative" }}>
            {/* The SVG Filter Definition — rendered only after mount to avoid hydration mismatch */}
            {mounted && (
            <svg
                className="filter"
                style={{ width: 0, height: 0, pointerEvents: "none", position: "absolute", inset: 0 }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id={filterId} colorInterpolationFilters="sRGB">
                        <feImage href={displacementDataUri} x="0" y="0" width="100%" height="100%" result="map" />
                        <feDisplacementMap in="SourceGraphic" in2="map" id="redchannel" scale={config.scale + config.dispersion} xChannelSelector={config.x} yChannelSelector={config.y} result="dispRed" />
                        <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
                        <feDisplacementMap in="SourceGraphic" in2="map" id="greenchannel" scale={config.scale + config.dispersion} xChannelSelector={config.x} yChannelSelector={config.y} result="dispGreen" />
                        <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
                        <feDisplacementMap in="SourceGraphic" in2="map" id="bluechannel" scale={config.scale + config.dispersion} xChannelSelector={config.x} yChannelSelector={config.y} result="dispBlue" />
                        <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
                        <feBlend in="red" in2="green" mode="screen" result="rg" />
                        <feBlend in="rg" in2="blue" mode="screen" result="output" />
                        <feGaussianBlur in="output" stdDeviation={config.displace} />
                    </filter>
                </defs>
            </svg>
            )}

            {/* The glass layer */}
            <div style={glassMorphismStyle}></div>

            {/* The gradient border */}
            <div style={gradientBorderStyle}></div>

            {/* The content, lifted above the glass */}
            <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%" }}>
                {children}
            </div>
        </div>
    );
};
