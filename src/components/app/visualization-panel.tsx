'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ParsedFunction } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAppContext } from './app-context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert, Info } from 'lucide-react';

function isValidExpression(expr: string) {
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

    // --- Escena y cámara ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeaf6ff);
    
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // --- Controles ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;

    // --- Luces ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(8, 10, 6);
    scene.add(ambientLight, directionalLight);

    // --- Ejes y rejilla ---
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);
    const gridHelper = new THREE.GridHelper(20, 20, 0x000000, 0x000000);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    try {
      if (parsedFunc.tipo === '3D') {
        if (!isValidExpression(parsedFunc.expresionNormalizada)) {
          throw new Error('La expresión contiene código no permitido.');
        }

        const plotFunc = new Function('x', 'y', `return ${parsedFunc.expresionNormalizada}`);

        // --- Geometría grande con más detalle  ---
        const geometry = new THREE.PlaneGeometry(20, 20, 100, 100);
        geometry.rotateX(-Math.PI / 2);

        // --- Deformar superficie ---
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const z = positions.getZ(i);
          const y = plotFunc(x, z);
          positions.setY(i, isFinite(y) ? y : 0);
        }
        geometry.computeVertexNormals();

        // --- Gradiente azul cielo ---
        const colors = [];
        const colorLow = new THREE.Color(0x0077ff);
        const colorHigh = new THREE.Color(0x87cefa);
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i);
          const t = (y + 5) / 10;
          const color = new THREE.Color().lerpColors(colorLow, colorHigh, t);
          colors.push(color.r, color.g, color.b);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // --- Material liviano y transparente ---
        const surfaceMaterial = new THREE.MeshLambertMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });

        // --- Malla ---
        const mesh = new THREE.Mesh(geometry, surfaceMaterial);
        scene.add(mesh);

        // --- Cámara ---
        camera.position.set(10, 7, 10);
        controls.update();
      } else if (parsedFunc.tipo === '2D') {
        if (!isValidExpression(parsedFunc.expresionNormalizada)) {
          throw new Error('La expresión contiene código no permitido.');
        }

        const isFunctionOfY = parsedFunc.expresionOriginal.includes('y') && !parsedFunc.expresionOriginal.includes('x');
        const plotFunc = new Function('x', 'y', `return ${parsedFunc.expresionNormalizada}`);
        const points = [];
        for (let i = -10; i <= 10; i += 0.1) {
          const result = isFunctionOfY ? plotFunc(0, i) : plotFunc(i, 0);
          if (isFinite(result)) {
            if (isFunctionOfY) {
              points.push(new THREE.Vector3(result, i, 0));
            } else {
              points.push(new THREE.Vector3(i, result, 0));
            }
          }
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xbf40bf, linewidth: 2 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        camera.position.set(0, 0, 15);
        controls.update();
      }
    } catch (e: any) {
      console.error('Plotting error:', e);
      setError(`No se pudo graficar la función. Error: ${e.message}`);
    }

    // --- Animación limitada (máx ~60 FPS) ---
    let lastTime = 0;
    renderer.setAnimationLoop((time) => {
      const delta = time - lastTime;
      if (delta > 16) {
        controls.update();
        renderer.render(scene, camera);
        lastTime = time;
      }
    });

    // --- Redimensionamiento ---
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Limpieza ---
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [funcResult]);

  const parsedFunc = funcResult as ParsedFunction;

  return (
    <Card className="shadow-modern-lg border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {parsedFunc?.descripcion || 'Gráfico de la Función'}
            </CardTitle>
            <CardDescription className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary">Original:</span>
                <code className="text-sm font-mono bg-background/50 px-2 py-0.5 rounded">
                  {parsedFunc?.expresionOriginal}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-accent">Normalizada:</span>
                <code className="text-xs font-mono bg-background/50 px-2 py-0.5 rounded">
                  {parsedFunc?.expresionNormalizada}
                </code>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Error de Visualización</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div
          ref={mountRef}
          className="relative h-[65vh] w-full rounded-xl overflow-hidden border-2 border-border/50 shadow-inner bg-gradient-to-br from-background to-secondary"
        />
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3" />
            <span>Click + arrastrar para rotar</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Scroll para zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Click derecho para mover</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
