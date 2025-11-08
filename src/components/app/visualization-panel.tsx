'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ParsedFunction } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAppContext } from './app-context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert } from 'lucide-react';

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
          opacity: 0.8,
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{parsedFunc?.descripcion || 'Gráfico de la Función'}</CardTitle>
        <CardDescription>
          Función ingresada: <strong>{parsedFunc?.expresionOriginal}</strong>
          <br />
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
        <div
          ref={mountRef}
          className="h-[60vh] w-full rounded-lg bg-slate-200 dark:bg-slate-800"
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Usa el mouse para rotar, mover y hacer zoom.
        </p>
      </CardContent>
    </Card>
  );
}
