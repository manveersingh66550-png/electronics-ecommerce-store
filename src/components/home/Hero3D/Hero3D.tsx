"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, useScroll, RoundedBox, Cylinder, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import styles from '@/app/page.module.css';
import Link from 'next/link';

// The Phone Model that reacts to scroll
const ScrollReactingPhone = () => {
    const groupRef = useRef<THREE.Group>(null);
    const scroll = useScroll(); // Returns scroll data from 0 to 1

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // scroll.offset goes from 0 to 1 across the ScrollControls pages
        const r1 = scroll.range(0, 1 / 3);   // First section: rotating in
        const r2 = scroll.range(1 / 3, 1 / 3); // Second section: zooming and tilting
        const r3 = scroll.range(2 / 3, 1 / 3); // Third section: spinning to top down

        // Base idle animation (subtle floating)
        const idleY = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

        // Smoothly interpolate transforms based on scroll progress
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            -Math.PI / 4, // Initial
            Math.PI * 2 + Math.PI / 6, // Final (spins around)
            scroll.offset
        );

        groupRef.current.rotation.x = THREE.MathUtils.lerp(
            0,
            Math.PI / 4, // Tilts back
            r2
        );

        groupRef.current.position.z = THREE.MathUtils.lerp(
            0,
            4, // Zooms in
            r2
        );

        groupRef.current.position.x = THREE.MathUtils.lerp(
            2, // Starts right
            -1.5, // Moves left
            r1
        ) + THREE.MathUtils.lerp(0, 3, r3); // Moves back right

        groupRef.current.position.y = idleY + THREE.MathUtils.lerp(0, -1, r2);
    });

    return (
        <group ref={groupRef}>
            {/* Main Body (Titanium) */}
            <RoundedBox args={[2.3, 4.8, 0.15]} radius={0.25} smoothness={8}>
                <meshPhysicalMaterial
                    color="#f8fafc"
                    metalness={1.0}
                    roughness={0.15}
                    clearcoat={1}
                    clearcoatRoughness={0.05}
                />
            </RoundedBox>

            {/* Back Glass (Holographic tone) */}
            <RoundedBox args={[2.25, 4.75, 0.05]} radius={0.2} smoothness={8} position={[0, 0, -0.06]}>
                <meshPhysicalMaterial
                    color="#ffffff"
                    metalness={0.2}
                    roughness={0.1}
                    transmission={0.9} // Glass
                    ior={1.5}
                    thickness={0.5}
                    iridescence={1} // Holographic sheen
                    iridescenceIOR={1.3}
                />
            </RoundedBox>

            {/* Camera Island */}
            <RoundedBox args={[0.9, 1.0, 0.05]} radius={0.15} smoothness={4} position={[-0.55, 1.7, -0.09]}>
                <meshPhysicalMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
            </RoundedBox>

            {/* Lenses */}
            <Cylinder args={[0.18, 0.18, 0.08, 32]} rotation={[Math.PI / 2, 0, 0]} position={[-0.75, 1.9, -0.1]}>
                <meshPhysicalMaterial color="#020617" metalness={1} roughness={0.1} />
            </Cylinder>
            <Cylinder args={[0.18, 0.18, 0.08, 32]} rotation={[Math.PI / 2, 0, 0]} position={[-0.35, 1.9, -0.1]}>
                <meshPhysicalMaterial color="#020617" metalness={1} roughness={0.1} />
            </Cylinder>
            <Cylinder args={[0.18, 0.18, 0.08, 32]} rotation={[Math.PI / 2, 0, 0]} position={[-0.55, 1.55, -0.1]}>
                <meshPhysicalMaterial color="#020617" metalness={1} roughness={0.1} />
            </Cylinder>

            {/* Front Screen Glass */}
            <RoundedBox args={[2.2, 4.7, 0.02]} radius={0.2} smoothness={8} position={[0, 0, 0.08]}>
                <meshPhysicalMaterial
                    color="#020617"
                    metalness={0.8}
                    roughness={0.05}
                    clearcoat={1}
                />
            </RoundedBox>

            {/* Glowing Screen Edges */}
            <mesh position={[0, 0, 0.09]}>
                <planeGeometry args={[2.1, 4.6]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* Screen Content via HTML */}
            <mesh position={[0, 0, 0.095]}>
                <planeGeometry args={[2.0, 4.5]} />
                <meshBasicMaterial color="#000" transparent opacity={0} />
                <Html transform distanceFactor={1.5} position={[0, 0, 0]} zIndexRange={[100, 0]} center>
                    <div style={{
                        width: '200px', height: '450px', background: '#020617', borderRadius: '18px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: 'white', overflow: 'hidden', position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute', top: '10%', right: '-20%',
                            width: '150px', height: '150px', background: '#10b981', filter: 'blur(40px)', opacity: 0.6, borderRadius: '50%'
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '10%', left: '-20%',
                            width: '150px', height: '150px', background: '#38bdf8', filter: 'blur(40px)', opacity: 0.4, borderRadius: '50%'
                        }} />
                        <h2 style={{ fontSize: '24px', fontWeight: 800, zIndex: 10 }}>NexOS 18</h2>
                        <p style={{ fontSize: '12px', color: '#94a3b8', zIndex: 10, marginTop: '8px' }}>Intelligence built in.</p>
                    </div>
                </Html>
            </mesh>
        </group>
    );
};

export const Hero3D = () => {
    return (
        <div style={{ width: '100%', height: '300vh', position: 'relative' }}>
            <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh' }}>
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                    <directionalLight position={[-10, -10, -10]} intensity={1} color="#38bdf8" />
                    <spotLight position={[0, 10, 0]} intensity={2} color="#10b981" />
                    <Environment preset="city" />

                    {/* ScrollControls creates a scroll container outside the canvas and maps scroll offset */}
                    <ScrollControls pages={3} damping={0.25}>
                        <ScrollReactingPhone />

                        {/* HTML overlay mapped to the scroll pages */}
                        <Scroll html style={{ width: '100vw', height: '300vh' }}>
                            {/* PAGE 1: Intro */}
                            <div className={styles.scrollPage} style={{ top: '0vh' }}>
                                <div className={styles.heroTextContent}>
                                    <span className={styles.heroBadge}>Titanium Edition</span>
                                    <h1 className={styles.heroTitle}>Pro.<br />Beyond.</h1>
                                    <p className={styles.heroDesc}>Forged from aerospace‑grade titanium. The lightest, strongest Pro model ever designed. With game-changing A18 Pro chip performance.</p>
                                </div>
                            </div>

                            {/* PAGE 2: Camera detail */}
                            <div className={styles.scrollPage} style={{ top: '100vh', alignItems: 'flex-end', paddingRight: '10vw' }}>
                                <div className={`${styles.heroTextContent} ${styles.richGlassPanel}`}>
                                    <h2 className={styles.scrollSubTitle}>Capture <span style={{ color: '#10b981' }}>Mastery.</span></h2>
                                    <p className={styles.heroDesc} style={{ color: '#cbd5e1' }}>The most advanced 48MP camera system. Computational photography pushed beyond the limits of reality.</p>
                                </div>
                            </div>

                            {/* PAGE 3: Final Call to Action */}
                            <div className={styles.scrollPage} style={{ top: '200vh', alignItems: 'flex-start', paddingLeft: '10vw' }}>
                                <div className={`${styles.heroTextContent} ${styles.richGlassPanel}`}>
                                    <h2 className={styles.scrollSubTitle}>Intelligent <br />by design.</h2>
                                    <Link href="/shop" style={{ pointerEvents: 'auto' }}>
                                        <button className={styles.holoBtn}>Pre-order Now</button>
                                    </Link>
                                    <p className={styles.heroDesc} style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                                        Starting at ₹999. Delivering next Friday.
                                    </p>
                                </div>
                            </div>
                        </Scroll>
                    </ScrollControls>
                </Canvas>
            </div>
        </div>
    );
};
