'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ParsedFunction } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAppContext } from './app-context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert } from 'lucide-react';

function isValidExpression(expr: string) {
    // Basic check for potentially unsafe patterns
    const forbidden = ['window', 'document', 'alert', 'eval', 'function', '=>'];
    return !forbidden.some(term => expr.toLowerCase().includes(term));
}

export function VisualizationPanel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { funcResult } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current || !funcResult || 'error' in funcResult) return;

    const parsedFunc = funcResult as ParsedFunction;
    setError(null);

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Helpers ---
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // --- Plotting Logic ---
    try {
        if (parsedFunc.tipo === '3D') {
            if (!isValidExpression(parsedFunc.expresionNormalizada)) {
                throw new Error("La expresión contiene código no permitido.");
            }
            const plotFunc = new Function('x', 'y', `return ${parsedFunc.expresionNormalizada}`);
            const geometry = new THREE.PlaneGeometry(10, 10, 50, 50);
            const material = new THREE.MeshStandardMaterial({ color: 0x6666ff, side: THREE.DoubleSide, wireframe: false });

            const positions = geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = plotFunc(x, y);
                if (isFinite(z)) {
                    positions.setZ(i, z);
                } else {
                    positions.setZ(i, 0); // Default for undefined points
                }
            }
            geometry.computeVertexNormals();
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            camera.position.set(6, 6, 6);
            camera.lookAt(0, 0, 0);

        } else if (parsedFunc.tipo === '2D') {
             if (!isValidExpression(parsedFunc.expresionNormalizada)) {
                throw new Error("La expresión contiene código no permitido.");
            }
            const plotFunc = new Function('x', `return ${parsedFunc.expresionNormalizada}`);
            const points = [];
            for (let i = -10; i <= 10; i += 0.1) {
                const y = plotFunc(i);
                if (isFinite(y)) {
                    points.push(new THREE.Vector3(i, y, 0));
                }
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0xbf40bf, linewidth: 2 });
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            camera.position.set(0, 0, 15);
            camera.lookAt(0, 0, 0);
        }
    } catch (e: any) {
        console.error("Plotting error:", e);
        setError(`No se pudo graficar la función. Error: ${e.message}`);
    }


    // --- Controls ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const onMouseDown = (e: MouseEvent) => { isDragging = true; previousMousePosition = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = { x: e.clientX - previousMousePosition.x, y: e.clientY - previousMousePosition.y };
      const rotationSpeed = 0.005;
      
      const pivot = new THREE.Object3D();
      pivot.add(camera);
      scene.add(pivot);

      pivot.rotation.y += deltaMove.x * rotationSpeed;
      pivot.rotation.x += deltaMove.y * rotationSpeed;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e: WheelEvent) => {
        camera.position.z += e.deltaY * 0.01;
    };
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);

    // --- Animation Loop ---
    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
      // Dispose Three.js objects
      scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              object.material.dispose();
          }
      });
      renderer.dispose();
    };
  }, [funcResult]);

  const parsedFunc = funcResult as ParsedFunction;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{parsedFunc?.descripcion || 'Gráfico de la Función'}</CardTitle>
        <CardDescription>
          Función ingresada: <strong>{parsedFunc?.expresionOriginal}</strong>
          <br/>
          Expresión normalizada: <code>{parsedFunc?.expresionNormalizada}</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Error de Visualización</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div ref={mountRef} className="h-[60vh] w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
        <p className="text-xs text-muted-foreground mt-2 text-center">Use el mouse para rotar (clic y arrastrar) y hacer zoom (rueda del mouse).</p>
      </CardContent>
    </Card>
  );
}
