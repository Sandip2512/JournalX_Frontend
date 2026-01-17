import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/context/ThemeContext';

export default function Background3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Setup ---
        const scene = new THREE.Scene();
        // Camera setup - positioned further back to see more grid
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 40); // Further back
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        // --- The Infinite Grid ---
        // Massive grid to cover "full page"
        const gridSize = 160; // Slightly reduced
        const divisions = 40; // Reduced density for performance
        const step = gridSize / divisions;

        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.012 // Slightly more subtle
        });

        const gridGeo = new THREE.BufferGeometry();
        const gridPoints = [];

        for (let i = -divisions / 2; i <= divisions / 2; i++) {
            const x = i * step;
            gridPoints.push(x, -gridSize / 2, 0);
            gridPoints.push(x, gridSize / 2, 0);

            const y = i * step;
            gridPoints.push(-gridSize / 2, y, 0);
            gridPoints.push(gridSize / 2, y, 0);
        }

        gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
        const gridMesh = new THREE.LineSegments(gridGeo, gridMaterial);
        group.add(gridMesh);

        // --- Blinking Boxes (Clusters & Independent) ---
        const boxCount = 30; // Reduced from 40 for performance
        const boxes: THREE.Mesh[] = [];
        const boxGeo = new THREE.PlaneGeometry(step * 0.95, step * 0.95);

        // Exact TradeFXBook Colors + Boosted for visibility
        // Added Purple for better differentiation
        const palette = [
            0x3B82F6, // Blue
            0x06B6D4, // Cyan
            0x10B981, // Emerald (Greener)
            0x8B5CF6  // Purple (Distinct)
        ];

        for (let i = 0; i < boxCount; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: palette[Math.floor(Math.random() * palette.length)],
                transparent: true,
                opacity: 0,
                blending: THREE.NormalBlending, // Switch to Normal for clearer color
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(boxGeo, material);

            // Logic: Some are "Independent", some are "Followers" (Neighbors)
            (mesh as any).userData = {
                phase: 'idle',
                timer: Math.random() * 5,
                speed: 0.01 + Math.random() * 0.01,
                maxOpacity: 0.4 // Boosted from 0.12 to 0.4 for clear visibility
            };

            repositionBox(mesh);
            boxes.push(mesh);
            group.add(mesh);
        }

        // --- Neighbor Logic ---
        // When a box activates, it has a chance to trigger a neighbor
        function triggerNeighbor(xIdx: number, yIdx: number) {
            // Find a box that is idle and create a "side by side" effect
            const neighbor = boxes.find(b => {
                const d = (b as any).userData;
                const bx = b.position.x;
                const by = b.position.y;
                // Check if adjacent (within 1 step + epsilon)
                const isAdjacent = Math.abs(bx - (xIdx * step + step / 2)) < step * 1.1 &&
                    Math.abs(by - (yIdx * step + step / 2)) < step * 1.1;
                return d.phase === 'wait' && isAdjacent && Math.random() > 0.7; // 30% chance
            });

            if (neighbor) {
                // Trigger neighbor with slight delay
                (neighbor as any).userData.timer = 0.2;
            }
        }

        function repositionBox(mesh: THREE.Mesh) {
            const xIndex = Math.floor((Math.random() - 0.5) * divisions);
            const yIndex = Math.floor((Math.random() - 0.5) * divisions);

            // Store indices for neighbor logic
            (mesh as any).userData.gridPos = { x: xIndex, y: yIndex };

            mesh.position.set(xIndex * step + step / 2, yIndex * step + step / 2, -0.01);
            // Reset color
            (mesh.material as THREE.MeshBasicMaterial).color.setHex(palette[Math.floor(Math.random() * palette.length)]);
        }

        // --- Crosshairs ---
        const plusGeo = new THREE.BufferGeometry();
        const plusPoints = [];
        const plusSize = 0.25;

        for (let i = 0; i < 20; i++) { // More crosshairs
            const xIndex = Math.floor((Math.random() - 0.5) * divisions);
            const yIndex = Math.floor((Math.random() - 0.5) * divisions);
            const x = xIndex * step;
            const y = yIndex * step;

            plusPoints.push(x - plusSize, y, 0);
            plusPoints.push(x + plusSize, y, 0);
            plusPoints.push(x, y - plusSize, 0);
            plusPoints.push(x, y + plusSize, 0);
        }
        plusGeo.setAttribute('position', new THREE.Float32BufferAttribute(plusPoints, 3));
        const plusMesh = new THREE.LineSegments(plusGeo, new THREE.LineBasicMaterial({ color: 0x64748b, opacity: 0.2, transparent: true }));
        group.add(plusMesh);


        // --- Mouse Interaction ---
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // --- Animation Loop ---
        let frameId: number;

        const animate = () => {
            boxes.forEach(box => {
                const data = (box as any).userData;
                const mat = box.material as THREE.MeshBasicMaterial;

                if (data.phase === 'wait' || data.phase === 'idle') {
                    data.timer -= 0.01;
                    // Only transition from 'wait' (after reset/init)
                    if (data.timer <= 0) {
                        // Decide: reposition or stay (clusters might want to stay?)
                        // For now, random reposition to keep grid alive
                        if (Math.random() > 0.3) repositionBox(box);

                        data.phase = 'in';

                        // Try to trigger neighbor
                        triggerNeighbor(data.gridPos.x, data.gridPos.y);
                    }
                } else if (data.phase === 'in') {
                    mat.opacity += data.speed;
                    if (mat.opacity >= data.maxOpacity) {
                        data.phase = 'out';
                    }
                } else if (data.phase === 'out') {
                    mat.opacity -= data.speed;
                    if (mat.opacity <= 0) {
                        mat.opacity = 0;
                        data.phase = 'wait';
                        data.timer = 1 + Math.random() * 4; // Slow re-trigger
                    }
                }
            });

            // Very subtle movement
            group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouseY * 0.02, 0.05);
            group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, mouseX * 0.02, 0.05);

            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };

        animate();

        // --- Resize ---
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
            renderer.dispose();
            if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    // --- Theme Handler ---
    useEffect(() => {
    }, [theme]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none',
                // TradeFXBook Match: #020A14 with center glow
                background: theme === 'light'
                    ? 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)'
                    : 'radial-gradient(circle at 50% 30%, #172554 0%, #020A14 60%, #020A14 100%)',
                transition: 'background 0.5s ease'
            }}
        />
    );
}
