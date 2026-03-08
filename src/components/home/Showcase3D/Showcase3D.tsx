"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows, RoundedBox, Cylinder, Torus, Html } from '@react-three/drei';
import * as THREE from 'three';

// Ultra-Premium Smartwatch
const PremiumWatch = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Elegant slow spin
            groupRef.current.rotation.y += delta * 0.2;
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
            <group ref={groupRef} rotation={[0, -Math.PI / 4, 0]}>

                {/* Watch Body (Titanium) */}
                <RoundedBox args={[1.6, 1.9, 0.35]} radius={0.3} smoothness={8}>
                    <meshPhysicalMaterial
                        color="#ffffff"
                        metalness={0.9}
                        roughness={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                    />
                </RoundedBox>

                {/* Digital Crown */}
                <Cylinder args={[0.15, 0.15, 0.1, 32]} rotation={[0, 0, Math.PI / 2]} position={[0.85, 0.3, 0]}>
                    <meshPhysicalMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
                </Cylinder>

                {/* Side Button */}
                <RoundedBox args={[0.05, 0.4, 0.1]} radius={0.02} smoothness={4} position={[0.82, -0.3, 0]}>
                    <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
                </RoundedBox>

                {/* Watch Screen Glass */}
                <RoundedBox args={[1.5, 1.8, 0.05]} radius={0.25} smoothness={8} position={[0, 0, 0.18]}>
                    <meshPhysicalMaterial
                        color="#050505"
                        metalness={0.7}
                        roughness={0.05}
                        clearcoat={1}
                    />
                </RoundedBox>

                {/* Screen UI rendering via Html */}
                <mesh position={[0, 0, 0.21]}>
                    <planeGeometry args={[1.4, 1.7]} />
                    <meshBasicMaterial color="#000" opacity={0} transparent />
                    <Html transform distanceFactor={1.5} position={[0, 0, 0]} zIndexRange={[100, 0]} center>
                        <div style={{
                            width: '140px',
                            height: '170px',
                            background: '#000',
                            borderRadius: '25px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontFamily: 'Space Grotesk, sans-serif',
                            boxShadow: 'inset 0 0 10px rgba(16,185,129,0.3)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {/* Futuristic glowing rings */}
                            <div style={{
                                position: 'absolute', width: '90px', height: '90px',
                                border: '4px solid #10b981', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    border: '4px solid #fff', borderRadius: '50%', borderTopColor: 'transparent',
                                    transform: 'rotate(45deg)'
                                }}></div>
                            </div>
                            <span style={{ fontSize: '24px', fontWeight: 700, zIndex: 1, marginTop: '10px' }}>10:09</span>
                        </div>
                    </Html>
                </mesh>

                {/* Top Strap */}
                <group position={[0, 1.0, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 2.0, 32, 1, true, 0, Math.PI]} />
                        <meshPhysicalMaterial color="#f4f4f5" roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* Bottom Strap */}
                <group position={[0, -1.0, 0]} rotation={[0, 0, Math.PI]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 2.0, 32, 1, true, 0, Math.PI]} />
                        <meshPhysicalMaterial color="#f4f4f5" roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
                    </mesh>
                </group>

            </group>
        </Float>
    );
};

export const Showcase3D = () => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px', cursor: 'grab' }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={1} />

                <PresentationControls
                    global
                    rotation={[0.1, 0, 0]}
                    polar={[-Math.PI / 4, Math.PI / 4]}
                    azimuth={[-Math.PI, Math.PI]}
                >
                    <PremiumWatch />
                </PresentationControls>

                <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={10} blur={2.5} far={4} color="#000000" />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
