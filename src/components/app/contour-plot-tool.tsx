'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAppContext } from './app-context';
import type { ParsedFunction } from '@/lib/types';
import { Layers, RotateCcw } from 'lucide-react';

function isValidExpression(expr: string) {
  const forbidden = ['window', 'document', 'alert', 'eval', 'function', '=>'];
  return !forbidden.some(term => expr.toLowerCase().includes(term));
}

export function ContourPlotTool() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { funcResult } = useAppContext();
  const [numContours, setNumContours] = useState([10]);
  const [error, setError] = useState<string | null>(null);
  const [contourInfo, setContourInfo] = useState<{min: number, max: number, levels: number[]} | null>(null);

  useEffect(() => {
    if (!mountRef.current || !funcResult || 'error' in funcResult) return;

    const parsedFunc = funcResult as ParsedFunction;
    setError(null);

    // Escena y cámara
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Controles - restringir para vista 2D
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableRotate = false; // Deshabilitar rotación para vista 2D
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI / 2; // Limitar a vista superior

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 10, 5);
    scene.add(ambientLight, directionalLight);

    // Rejilla base para plano x-y
    const gridHelper = new THREE.GridHelper(16, 16, 0x64748b, 0xe2e8f0);
    gridHelper.rotation.x = -Math.PI / 2; // Plano x-y
    scene.add(gridHelper);

    // Ejes coordenados
    const axesHelper = new THREE.AxesHelper(8);
    scene.add(axesHelper);

    try {
      if (parsedFunc.tipo === '3D' && isValidExpression(parsedFunc.expresionNormalizada)) {
        const plotFunc = new Function('x', 'y', `return ${parsedFunc.expresionNormalizada}`);

        // Calcular valores para determinar rangos de contorno
        const values: number[] = [];
        for (let x = -5; x <= 5; x += 0.5) {
          for (let y = -5; y <= 5; y += 0.5) {
            const val = plotFunc(x, y);
            if (isFinite(val)) values.push(val);
          }
        }

        if (values.length > 0) {
          const minVal = Math.min(...values);
          const maxVal = Math.max(...values);
          const range = maxVal - minVal;
          const step = range / numContours[0];

          // Calcular niveles de contorno
          const levels: number[] = [];
          for (let i = 1; i < numContours[0]; i++) {
            levels.push(minVal + step * i);
          }

          setContourInfo({ min: minVal, max: maxVal, levels });

          // Crear curvas de nivel usando marching squares simplificado
          for (const level of levels) {
            const points: THREE.Vector3[] = [];

            // Usar resolución más fina para curvas más suaves
            const resolution = 0.05;
            const range = 8; // Rango visible

            for (let x = -range; x <= range; x += resolution) {
              for (let y = -range; y <= range; y += resolution) {
                const val = plotFunc(x, y);
                if (Math.abs(val - level) < step * 0.05) { // Tolerancia más fina
                  points.push(new THREE.Vector3(x, 0, y));
                }
              }
            }

            if (points.length > 1) {
              const geometry = new THREE.BufferGeometry().setFromPoints(points);
              const material = new THREE.LineBasicMaterial({
                color: new THREE.Color().setHSL((level - minVal) / (maxVal - minVal), 0.8, 0.5),
                linewidth: 2,
                transparent: true,
                opacity: 0.8
              });
              const contourLine = new THREE.Line(geometry, material);
              scene.add(contourLine);
            }
          }
        }
      }

      camera.position.set(0, 15, 0); // Vista superior del plano x-y
      camera.lookAt(0, 0, 0);

      // Animación
      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });

    } catch (e: any) {
      console.error('Contour plot error:', e);
      setError(`Error generando curvas de nivel: ${e.message}`);
    }

    // Cleanup
    return () => {
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
  }, [funcResult, numContours]);

  const resetView = () => {
    setNumContours([10]);
  };

  const parsedFunc = funcResult as ParsedFunction;

  return (
    <Card className="shadow-modern-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Curvas de Nivel
        </CardTitle>
        <CardDescription>
          Visualización 2D de funciones f(x,y) mediante curvas de nivel en el plano x-y
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Número de curvas: {numContours[0]}
            </label>
            <Slider
              value={numContours}
              onValueChange={setNumContours}
              max={20}
              min={5}
              step={1}
              className="w-full"
            />
          </div>
          <Button onClick={resetView} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reiniciar Vista
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive mb-4 p-2 bg-destructive/10 rounded">
            {error}
          </div>
        )}

        <div
          ref={mountRef}
          className="relative h-[50vh] w-full rounded-xl overflow-hidden border-2 border-border/50 shadow-inner"
        />

        {contourInfo && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Información de Curvas de Nivel</h4>
            <div className="text-xs space-y-1">
              <p>Rango de valores: [{contourInfo.min.toFixed(2)}, {contourInfo.max.toFixed(2)}]</p>
              <p>Niveles: {contourInfo.levels.map(l => l.toFixed(2)).join(', ')}</p>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>• Vista superior del plano x-y con curvas de nivel</p>
          <p>• Cada línea representa puntos donde f(x,y) = constante</p>
          <p>• Las líneas más juntas indican gradientes más pronunciados</p>
          <p>• Útil para análisis topográfico y optimización 2D</p>
        </div>
      </CardContent>
    </Card>
  );
}