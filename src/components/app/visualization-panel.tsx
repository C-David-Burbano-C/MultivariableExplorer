'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import type { ParsedFunction } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAppContext } from './app-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TriangleAlert, Layers, Square, Target, Zap, Info, Eye, EyeOff } from 'lucide-react';

// =========================================
// FUNCION DE VALIDACION DE EXPRESIONES
// Verifica que la expresion matematica no contenga codigo peligroso
// =========================================
function isValidExpression(expr: string) {
  const forbidden = ['window', 'document', 'alert', 'eval', 'function', '=>'];
  return !forbidden.some(term => expr.toLowerCase().includes(term));
}

// =========================================
// FUNCION DE AUTO-FIT DE CAMARA
// Calcula automáticamente la distancia óptima de la cámara para que la geometría
// quepa completamente en el campo de visión, con transiciones suaves
// =========================================
function autoFitCamera(camera: THREE.PerspectiveCamera, controls: any, scene: THREE.Scene, duration: number = 1000) {
  // Calcular bounding box de todos los objetos visibles
  const box = new THREE.Box3();

  // Primero, calcular el bounding box de la geometría principal (superficie)
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.geometry) {
      // Solo considerar la malla principal (superficie), no las flechas del gradiente
      if (object.geometry.type === 'PlaneGeometry' || object.geometry.type === 'BufferGeometry') {
        object.geometry.computeBoundingBox();
        if (object.geometry.boundingBox) {
          box.expandByPoint(object.geometry.boundingBox.min);
          box.expandByPoint(object.geometry.boundingBox.max);
        }
      }
    }
  });

  // Si no hay geometría principal, usar valores por defecto
  if (box.isEmpty()) {
    box.setFromPoints([
      new THREE.Vector3(-10, -10, -10),
      new THREE.Vector3(10, 10, 10)
    ]);
  }

  // Calcular el centro del bounding box
  const center = box.getCenter(new THREE.Vector3());

  // Calcular el tamaño del bounding box
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Calcular distancia óptima de la cámara
  const fov = camera.fov * (Math.PI / 180); // Convertir a radianes
  const aspect = camera.aspect;

  // Usar la dimensión máxima para calcular la distancia
  // La fórmula considera el ángulo de visión y el aspecto
  const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

  // Añadir un margen de seguridad (20% más)
  const optimalDistance = distance * 1.2;

  // Posición objetivo de la cámara (ángulo isométrico para mejor visualización)
  const elevation = Math.PI / 6; // 30 grados arriba
  const azimuth = Math.PI / 4;   // 45 grados lateral

  const targetPosition = new THREE.Vector3(
    center.x + optimalDistance * Math.cos(azimuth) * Math.cos(elevation),
    center.y + optimalDistance * Math.sin(elevation),
    center.z + optimalDistance * Math.sin(azimuth) * Math.cos(elevation)
  );

  // Posición actual de la cámara
  const currentPosition = camera.position.clone();

  // Animar suavemente hacia la nueva posición
  const startTime = Date.now();
  const startPosition = currentPosition.clone();
  const endPosition = targetPosition.clone();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Función de easing suave (ease-out cubic)
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolar posición
    const newPosition = new THREE.Vector3().lerpVectors(startPosition, endPosition, easedProgress);
    camera.position.copy(newPosition);

    // Apuntar la cámara hacia el centro
    camera.lookAt(center);

    // Actualizar controles
    controls.target.copy(center);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// =========================================
// FUNCION PRINCIPAL DE RENDERIZADO 2D
// Crea la escena completa para visualizacion 2D con curvas de nivel, gradientes y mapa de calor
// =========================================
// =========================================
// FUNCION DE RENDERIZADO 2D PRINCIPAL
// Crea una escena Three.js ortográfica para análisis 2D de funciones multivariable
// Proyecta la función 3D f(x,y) en un plano 2D con múltiples vistas (superior, isométrica, lateral, frontal)
// Incluye curvas de nivel interactivas, mapas de calor y campos de gradiente vectorial
// Gestiona controles de cámara, iluminación y limpieza automática de recursos
// =========================================
function render2DVisualization(
  mountRef: React.RefObject<HTMLDivElement>,
  funcResult: any,
  showInteractiveContours: boolean,
  interactiveContourHeight: number[],
  showLayer: boolean,
  view2DMode: 'top' | 'iso' | 'side' | 'front',
  customRotation: { x: number, y: number, z: number },
  showGradientField2D: boolean = false,
  setError: (error: string | null) => void
) {
  if (!mountRef.current || !funcResult || 'error' in funcResult) return;

  const parsedFunc = funcResult as ParsedFunction;

  // =========================================
  // CONFIGURACION DE LA ESCENA 2D
  // Crea la escena Three.js con camara ortografica y renderer
  // =========================================
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f9fa);

  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  mountRef.current.innerHTML = '';
  mountRef.current.appendChild(renderer.domElement);

  // =========================================
  // CONFIGURACION DE ILUMINACION 2D
  // Agrega luces para que los materiales MeshLambertMaterial funcionen correctamente
  // =========================================
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 10, 5);
  scene.add(ambientLight, directionalLight);

  // =========================================
  // CONFIGURACION DE CONTROLES DE CAMARA 2D
  // Solo permite pan y zoom, sin rotacion para vista ortografica
  // =========================================
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false; // Solo pan y zoom para 2D
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // --- Configurar vista según el modo seleccionado ---
  switch (view2DMode) {
    case 'top':
      // Vista desde arriba (default)
      camera.position.set(0, 0, 20);
      camera.lookAt(0, 0, 0);
      break;
    case 'iso':
      // Vista isométrica
      camera.position.set(15, 10, 15);
      camera.lookAt(0, 0, 0);
      break;
    case 'side':
      // Vista lateral (desde el eje X)
      camera.position.set(20, 0, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'front':
      // Vista frontal (desde el eje Z)
      camera.position.set(0, 0, 20);
      camera.lookAt(0, 0, 0);
      break;
  }
  // =========================================
  // ALGORITMO MARCHING SQUARES PARA CURVAS DE NIVEL
  // Genera líneas de contorno suaves conectando puntos donde f(x,y) = nivel constante
  // Divide el plano en cuadrículas y determina segmentos de línea basados en valores de esquina
  // =========================================
  function isoContours(values: number[][], level: number) {
    const rows = values.length;
    const cols = values[0]?.length || 0;
    if (!rows || !cols) return [];

    // Interpolación lineal entre dos puntos
    const interp = (v1: number, v2: number, t1: [number, number], t2: [number, number]) => {
      const d = v2 - v1;
      const t = d === 0 ? 0.5 : (level - v1) / d;
      return [t1[0] + (t2[0] - t1[0]) * t, t1[1] + (t2[1] - t1[1]) * t] as [number, number];
    };

    const segments: Array<[[number, number], [number, number]]> = [];

    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = values[j][i];
        const b = values[j][i + 1];
        const c = values[j + 1][i + 1];
        const d = values[j + 1][i];

        const pa: [number, number] = [i, j];
        const pb: [number, number] = [i + 1, j];
        const pc: [number, number] = [i + 1, j + 1];
        const pd: [number, number] = [i, j + 1];

        let idx = 0;
        if (a >= level) idx |= 1;
        if (b >= level) idx |= 2;
        if (c >= level) idx |= 4;
        if (d >= level) idx |= 8;
        if (idx === 0 || idx === 15) continue;

        const top = interp(a, b, pa, pb);
        const right = interp(b, c, pb, pc);
        const bottom = interp(c, d, pc, pd);
        const left = interp(d, a, pd, pa);

        // Tabla de casos Marching Squares (sin tipos que rompan compilación)
        const caseSegments: any = {
          1: [[left, top]],
          2: [[top, right]],
          3: [[left, right]],
          4: [[right, bottom]],
          5: [[left, bottom], [top, right]],
          6: [[top, bottom]],
          7: [[left, bottom]],
          8: [[bottom, left]],
          9: [[top, bottom]],
          10: [[top, left], [right, bottom]],
          11: [[right, bottom]],
          12: [[left, right]],
          13: [[top, right]],
          14: [[left, top]]
        };

        const segs = caseSegments[idx];
        if (!segs) continue;

        for (const s of segs) {
          segments.push([s[0], s[1]]);
        }
      }
    }

    // Unir segmentos contiguos para formar contornos cerrados
    const EPS = 1e-6;
    const key = (p: [number, number]) => `${p[0].toFixed(6)}|${p[1].toFixed(6)}`;
    const adjacency = new Map<string, Array<[number, number]>>();

    for (const seg of segments) {
      const [a, b] = seg;
      const ka = key(a);
      const kb = key(b);
      if (!adjacency.has(ka)) adjacency.set(ka, []);
      if (!adjacency.has(kb)) adjacency.set(kb, []);
      adjacency.get(ka)!.push(b);
      adjacency.get(kb)!.push(a);
    }

    const contours: Array<Array<[number, number]>> = [];
    const visitedEdges = new Set<string>();
    const edgeKey = (p: [number, number], q: [number, number]) => `${key(p)}->${key(q)}`;

    for (const [k, neighbors] of adjacency.entries()) {
      for (const neighbor of neighbors) {
        const start = k.split('|').map(Number) as [number, number];
        const next = neighbor;
        const eKey = edgeKey(start, next);
        if (visitedEdges.has(eKey)) continue;

        const contour: Array<[number, number]> = [];
        let current = start;
        let nextP = next;
        let safety = 0;

        while (safety++ < 10000) {
          contour.push(current);
          visitedEdges.add(edgeKey(current, nextP));
          const nb = adjacency.get(key(nextP));
          if (!nb || nb.length === 0) break;
          visitedEdges.add(edgeKey(nextP, current));

          const candidate = nb.find(p => Math.abs(p[0] - current[0]) > EPS || Math.abs(p[1] - current[1]) > EPS);
          if (!candidate) break;
          current = nextP;
          nextP = candidate;
          if (Math.abs(nextP[0] - contour[0][0]) < EPS && Math.abs(nextP[1] - contour[0][1]) < EPS) {
            contour.push(current);
            break;
          }
        }

        if (contour.length >= 2) contours.push(contour);
      }
    }

    return contours;
  }

  // --- Ejes y rejilla ---
  const axesHelper = new THREE.AxesHelper(8);
  // Rotar ejes según el modo de vista
  switch (view2DMode) {
    case 'top':
      axesHelper.rotation.x = -Math.PI / 2; // Vista desde arriba
      break;
    case 'iso':
      axesHelper.rotation.x = -Math.PI / 6; // Vista isométrica
      break;
    case 'side':
    case 'front':
      axesHelper.rotation.x = 0; // Vista lateral o frontal
      break;
  }
  scene.add(axesHelper);

  const gridHelper = new THREE.GridHelper(16, 16, 0x000000, 0x000000);
  gridHelper.material.opacity = 0.1;
  gridHelper.material.transparent = true;
  // Rotar rejilla según el modo de vista
  switch (view2DMode) {
    case 'top':
      gridHelper.rotation.x = -Math.PI / 2; // Vista desde arriba
      break;
    case 'iso':
      gridHelper.rotation.x = -Math.PI / 6; // Vista isométrica
      break;
    case 'side':
    case 'front':
      gridHelper.rotation.x = 0; // Vista lateral o frontal
      break;
  }
  scene.add(gridHelper);

  try {
    if (!isValidExpression(parsedFunc.expresionNormalizada)) {
      throw new Error('La expresión contiene código no permitido.');
    }

    const plotFunc = new Function('x', 'y', `return ${parsedFunc.expresionNormalizada}`);

    // =========================================
    // CURVAS DE NIVEL INTERACTIVAS EN 2D
    // Crea líneas de contorno dinámicas que muestran donde f(x,y) tiene un valor específico
    // Permite al usuario explorar la topografía de la función cambiando el nivel de altura
    // =========================================
    if (showInteractiveContours) {
      const targetHeight = interactiveContourHeight[0]; // Nivel de altura a mostrar
      const size = 200; // Resolución de la malla
      const step = 16 / size; // Paso entre puntos
      const values: number[][] = [];

      // 1) Construir matriz de valores (rows = size+1, cols = size+1)
      for (let j = 0; j <= size; j++) {
        const row: number[] = [];
        for (let i = 0; i <= size; i++) {
          const x = -8 + i * step;
          const y = -8 + j * step;
          const val = plotFunc(x, y);
          row.push(isFinite(val) ? val : 0);
        }
        values.push(row);
      }

      // 2) Implementación local tipo "marching squares"
      const isoContours = (grid: number[][], level: number): Array<[number, number][]> => {
        const contours: Array<[number, number][]> = [];
        const rows = grid.length - 1;
        const cols = grid[0].length - 1;

        const interp = (x1: number, y1: number, x2: number, y2: number, v1: number, v2: number): [number, number] => {
          const t = (level - v1) / (v2 - v1);
          return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
        };

        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const v0 = grid[j][i];
            const v1 = grid[j][i + 1];
            const v2 = grid[j + 1][i + 1];
            const v3 = grid[j + 1][i];

            const caseIndex =
              (v0 >= level ? 1 : 0) |
              (v1 >= level ? 2 : 0) |
              (v2 >= level ? 4 : 0) |
              (v3 >= level ? 8 : 0);

            if (caseIndex === 0 || caseIndex === 15) continue;

            const x = i;
            const y = j;

            const top = interp(x, y, x + 1, y, v0, v1);
            const right = interp(x + 1, y, x + 1, y + 1, v1, v2);
            const bottom = interp(x, y + 1, x + 1, y + 1, v3, v2);
            const left = interp(x, y, x, y + 1, v0, v3);

            const caseSegments: Record<number, Array<[[number, number], [number, number]]>> = {
              1: [[left, top]],
              2: [[top, right]],
              3: [[left, right]],
              4: [[right, bottom]],
              5: [[left, bottom], [top, right]],
              6: [[top, bottom]],
              7: [[left, bottom]],
              8: [[bottom, left]],
              9: [[top, bottom]],
              10: [[top, left], [right, bottom]],
              11: [[right, bottom]],
              12: [[left, right]],
              13: [[top, right]],
              14: [[left, top]]
            };

            const segs = caseSegments[caseIndex];
            if (segs) segs.forEach(seg => contours.push(seg));
          }
        }
        return contours.map(seg => seg.map(p => p));
      };

      // 3) Obtener contornos
      const contours = isoContours(values, targetHeight);

      // 4) Dibujar cada contorno
      contours.forEach(contour => {
        const points: THREE.Vector3[] = contour.map(([i, j]) => {
          const x = -8 + i * step;
          const y = -8 + j * step;
          return new THREE.Vector3(x, y, 0.02);
        });

        if (points.length < 2) return;
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(0xff0099), // 💖 rosa neón fosforescente
          linewidth: 2,
          transparent: true,
          opacity: 0.95
        });

        const line = new THREE.LineLoop(geometry, material);
        scene.add(line);
      });

      // 5) Animación sutil de brillo
      const clock = new THREE.Clock();
      const animate = () => {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        scene.traverse(obj => {
          if (obj instanceof THREE.LineLoop && obj.material instanceof THREE.LineBasicMaterial) {
            obj.material.opacity = 0.6 + 0.3 * Math.sin(t * 2);
          }
        });
      };
      animate();
    }

    // =========================================
    // CAPA 2D - MAPA DE CALOR TOPOGRAFICO
    // Visualiza f(x,y) como una superficie coloreada usando un gradiente de colores
    // Los colores van del verde (valores bajos) al rojo (valores altos) representando la altura
    // =========================================
    if (showLayer) {
      // Crear mapa de calor 2D que muestra directamente f(x,y)
      const planeGeometry = new THREE.PlaneGeometry(16, 16, 85, 85);
      const positions = planeGeometry.attributes.position;
      const colors = [];

      // Calcular rango de valores para normalizar colores
      const values: number[] = [];
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const val = plotFunc(x, y);
        if (isFinite(val)) values.push(val);
      }

      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal || 1; // Evitar división por cero

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const val = plotFunc(x, y);

        // Normalizar el valor al rango [0, 1]
        const normalizedVal = isFinite(val) ? (val - minVal) / range : 0;

        // Colores del mapa de calor basados en el valor de f(x,y)
        const color = new THREE.Color();
        if (normalizedVal > 0.8) {
          color.setHSL(0.0, 0.9, 0.6); // Rojo para valores altos
        } else if (normalizedVal > 0.6) {
          color.setHSL(0.08, 0.9, 0.55); // Rojo-naranja
        } else if (normalizedVal > 0.4) {
          color.setHSL(0.15, 0.9, 0.5); // Naranja
        } else if (normalizedVal > 0.2) {
          color.setHSL(0.25, 0.9, 0.45); // Amarillo-naranja
        } else {
          color.setHSL(0.6, 0.9, 0.4); // Verde para valores bajos
        }

        colors.push(color.r, color.g, color.b);
      }

      planeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const planeMaterial = new THREE.MeshLambertMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });

      const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
      planeMesh.position.z = -0.01; // Poner el plano ligeramente por debajo para que no interfiera con las flechas
      scene.add(planeMesh);

      // Agregar líneas de contorno para referencia
      const wireframeGeometry = new THREE.EdgesGeometry(planeGeometry);
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.2
      });
      const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
      scene.add(wireframe);
    }

    // =========================================
    // CAMPO DE GRADIENTE 2D
    // Muestra flechas que indican la dirección y magnitud del gradiente ∇f(x,y)
    // Cada flecha representa cómo cambia la función en ese punto del plano
    // Ayuda a entender la pendiente y dirección de máximo crecimiento de la función
    // =========================================
    if (showGradientField2D) {
      const h = 0.01; // Paso pequeño para diferencias finitas

      // Crear campo vectorial en una cuadrícula más densa para 2D
      const gridSize = 8; // Menos denso que en 3D para mejor visibilidad
      const spacing = 16 / gridSize;

      for (let i = 0; i <= gridSize; i++) {
        for (let j = 0; j <= gridSize; j++) {
          const x = -8 + i * spacing;
          const y = -8 + j * spacing;

          // Calcular derivadas parciales usando diferencias finitas
          const fx = plotFunc(x, y);
          const dfdx = (plotFunc(x + h, y) - plotFunc(x - h, y)) / (2 * h);
          const dfdy = (plotFunc(x, y + h) - plotFunc(x, y - h)) / (2 * h);

          // Magnitud del gradiente
          const magnitude = Math.sqrt(dfdx * dfdx + dfdy * dfdy);

          if (magnitude > 0.01 && isFinite(magnitude)) {
            // Normalizar el vector y escalar para visualización
            const scale = 0.6;
            const nx = (dfdx / magnitude) * scale;
            const ny = (dfdy / magnitude) * scale;

            // Crear flecha completa usando ArrowHelper
            const arrowLength = Math.min(magnitude * 0.25, 1.2);
            const zPos = 0.05;
            const tipSize = 0.08;

            const arrowHelper = new THREE.ArrowHelper(
              new THREE.Vector3(nx, ny, 0), // Dirección del vector gradiente
              new THREE.Vector3(x, y, zPos), // Punto de origen
              arrowLength, // Longitud de la flecha
              new THREE.Color().setHSL(0.6, 0.9, 0.5), // Color azul brillante
              tipSize, // Longitud de la punta
              tipSize * 0.5 // Ancho de la punta
            );
            scene.add(arrowHelper);

            // Agregar una pequeña esfera en el punto de inicio
            const startSphereGeometry = new THREE.SphereGeometry(0.025, 6, 6);
            const startSphereMaterial = new THREE.MeshBasicMaterial({
              color: new THREE.Color().setHSL(0.6, 0.9, 0.5),
              transparent: true,
              opacity: 0.8
            });
            const startSphere = new THREE.Mesh(startSphereGeometry, startSphereMaterial);
            startSphere.position.set(x, y, zPos);
            scene.add(startSphere);
          }
        }
      }
    }
  } catch (e: any) {
    console.error('Plotting error:', e);
    setError(`No se pudo graficar la función. Error: ${e.message}`);
  }

  // --- Animación 2D ---
  let lastTime = 0;
  renderer.setAnimationLoop((time) => {
    const delta = time - lastTime;
    if (delta > 16) {
      controls.update();
      renderer.render(scene, camera);
      lastTime = time;
    }
  });

  // --- Redimensionamiento 2D ---
  const handleResize = () => {
    if (!mountRef.current) return;
    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    camera.left = -10 * aspect;
    camera.right = 10 * aspect;
    camera.top = 10;
    camera.bottom = -10;
    camera.updateProjectionMatrix();
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  // --- Limpieza 2D ---
  return () => {
    window.removeEventListener('resize', handleResize);
    controls.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else if (object.material) {
          object.material.dispose();
        }
      }
    });
    renderer.dispose();
  };
}

// =========================================
// COMPONENTE PRINCIPAL VISUALIZATIONPANEL
// Panel de visualización principal que coordina la renderización 2D y 3D
// Gestiona el estado de todos los controles de visualización y pestañas
// Proporciona interfaz de usuario para explorar funciones multivariable
// Integra Three.js para gráficos WebGL con controles interactivos
// =========================================
export default function VisualizationPanel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mountRef2D = useRef<HTMLDivElement>(null);
  const canvas3DRef = useRef<HTMLDivElement>(null);
  const { funcResult, activeTab, setActiveTab } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const [showContours, setShowContours] = useState(false);
  const [numContours, setNumContours] = useState([8]);
  const [showGradientField, setShowGradientField] = useState(false);
  const [gradientDensity, setGradientDensity] = useState([5]);
  const [showInteractiveContours, setShowInteractiveContours] = useState(false);
  const [interactiveContourHeight, setInteractiveContourHeight] = useState([0]);
  const [view2DMode, setView2DMode] = useState<'top' | 'iso' | 'side' | 'front'>('top');
  const [customRotation, setCustomRotation] = useState({ x: -Math.PI / 2, y: 0, z: 0 });
  const [showLayer, setShowLayer] = useState(true);
  const [showGradientField2D, setShowGradientField2D] = useState(false);
  const [surfaceOpacity, setSurfaceOpacity] = useState([0.6]);
  const [autoFitCameraEnabled, setAutoFitCameraEnabled] = useState(true);

  const parsedFunc = funcResult as ParsedFunction;

  // =========================================
  // EFECTO DE VISUALIZACION 3D PRINCIPAL
  // Configura la escena Three.js completa para funciones 3D: superficie, luces, controles
  // Maneja la deformación de geometría basada en f(x,z) y aplica materiales con colores
  // Renderiza curvas de nivel, campos de gradiente y efectos visuales en tiempo real
  // Gestiona el ciclo de vida completo: inicialización, animación y limpieza de recursos
  // =========================================
  useEffect(() => {
    if (!mountRef.current || !funcResult || 'error' in funcResult) return;

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
        const geometry = new THREE.PlaneGeometry(20, 20, 30, 30);
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

        // --- Colores de la superficie ---
        const colors = [];
        if (showLayer) {
          // Mapa de calor topográfico basado en f(x,z)
          const values: number[] = [];
          for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const val = plotFunc(x, z);
            if (isFinite(val)) values.push(val);
          }

          const minVal = Math.min(...values);
          const maxVal = Math.max(...values);
          const range = maxVal - minVal || 1; // Evitar división por cero

          for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const val = plotFunc(x, z);

            // Normalizar el valor al rango [0, 1]
            const normalizedVal = isFinite(val) ? (val - minVal) / range : 0;

            // Colores del mapa de calor basados en el valor de f(x,z)
            const color = new THREE.Color();
            if (normalizedVal > 0.8) {
              color.setHSL(0.0, 0.9, 0.6); // Rojo para valores altos
            } else if (normalizedVal > 0.6) {
              color.setHSL(0.08, 0.9, 0.55); // Rojo-naranja
            } else if (normalizedVal > 0.4) {
              color.setHSL(0.15, 0.9, 0.5); // Naranja
            } else if (normalizedVal > 0.2) {
              color.setHSL(0.25, 0.9, 0.45); // Amarillo-naranja
            } else {
              color.setHSL(0.6, 0.9, 0.4); // Verde para valores bajos
            }

            colors.push(color.r, color.g, color.b);
          }
        } else {
          // Gradiente azul cielo basado en altura
          const colorLow = new THREE.Color(0x0077ff);
          const colorHigh = new THREE.Color(0x87cefa);
          for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            const t = (y + 5) / 10;
            const color = new THREE.Color().lerpColors(colorLow, colorHigh, t);
            colors.push(color.r, color.g, color.b);
          }
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // --- Material liviano y transparente ---
        const surfaceMaterial = new THREE.MeshLambertMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: surfaceOpacity[0],
        });

        // --- Malla ---
        const mesh = new THREE.Mesh(geometry, surfaceMaterial);
        scene.add(mesh);

        // =========================================
        // CURVAS DE NIVEL SOBRE LA SUPERFICIE 3D
        // Dibuja líneas de contorno que siguen la topografía de f(x,z) en la superficie
        // Cada línea conecta puntos donde la función tiene el mismo valor de altura
        // Crea un mapa topográfico visual similar a las curvas de nivel en mapas geográficos
        // =========================================
if (showContours) {
  // Resolución reducida para rendimiento sin perder calidad visual
  const size = 80; // antes 200
  const step = 16 / size;
  const values: number[][] = [];

  // 1) Construir la matriz de valores de la superficie
  for (let j = 0; j <= size; j++) {
    const row: number[] = [];
    for (let i = 0; i <= size; i++) {
      const x = -8 + i * step;
      const z = -8 + j * step;
      const val = plotFunc(x, z);
      row.push(isFinite(val) ? val : 0);
    }
    values.push(row);
  }

  // Calcular rango de valores
  const flatVals = values.flat();
  const minVal = Math.min(...flatVals);
  const maxVal = Math.max(...flatVals);
  const range = maxVal - minVal;
  const stepVal = range / numContours[0];

  // 2) Implementación ligera del algoritmo marching squares
  const isoContours = (grid: number[][], level: number): Array<[number, number][]> => {
    const contours: Array<[number, number][]> = [];
    const rows = grid.length - 1;
    const cols = grid[0].length - 1;

    const interp = (x1: number, y1: number, x2: number, y2: number, v1: number, v2: number): [number, number] => {
      const t = (level - v1) / (v2 - v1);
      return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
    };

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const v0 = grid[j][i];
        const v1 = grid[j][i + 1];
        const v2 = grid[j + 1][i + 1];
        const v3 = grid[j + 1][i];

        const caseIndex =
          (v0 >= level ? 1 : 0) |
          (v1 >= level ? 2 : 0) |
          (v2 >= level ? 4 : 0) |
          (v3 >= level ? 8 : 0);

        if (caseIndex === 0 || caseIndex === 15) continue;

        const x = i;
        const y = j;

        const top = interp(x, y, x + 1, y, v0, v1);
        const right = interp(x + 1, y, x + 1, y + 1, v1, v2);
        const bottom = interp(x, y + 1, x + 1, y + 1, v3, v2);
        const left = interp(x, y, x, y + 1, v0, v3);

        const caseSegments: Record<number, Array<[[number, number], [number, number]]>> = {
          1: [[left, top]],
          2: [[top, right]],
          3: [[left, right]],
          4: [[right, bottom]],
          5: [[left, bottom], [top, right]],
          6: [[top, bottom]],
          7: [[left, bottom]],
          8: [[bottom, left]],
          9: [[top, bottom]],
          10: [[top, left], [right, bottom]],
          11: [[right, bottom]],
          12: [[left, right]],
          13: [[top, right]],
          14: [[left, top]]
        };

        const segs = caseSegments[caseIndex];
        if (segs) segs.forEach(seg => contours.push(seg));
      }
    }
    return contours.map(seg => seg.map(p => p));
  };

  // 3) Crear un solo material compartido para todas las líneas
  const baseMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 1,
    transparent: true,
    opacity: 0.7
  });

  // 4) Agrupar líneas para reducir draw calls
  const contourGroup = new THREE.Group();

  for (let level = minVal + stepVal; level < maxVal; level += stepVal) {
    const contours = isoContours(values, level);

    const hue = (level - minVal) / range;
    const lineMaterial = baseMaterial.clone();
    lineMaterial.color = new THREE.Color().setHSL(hue, 0.8, 0.45);

    for (const contour of contours) {
      const points: THREE.Vector3[] = contour.map(([i, j]) => {
        const x = -8 + i * step;
        const z = -8 + j * step;
        const y = plotFunc(x, z);
        return new THREE.Vector3(x, y + 0.01, z);
      });

      if (points.length < 2) continue;

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      contourGroup.add(line);
    }
  }

  // Añadir grupo al escenario
  scene.add(contourGroup);

  // 5) Animación de opacidad optimizada
  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const opacity = 0.6 + 0.3 * Math.sin(t * 1.5);

    // Un solo recorrido del grupo (no todo el escenario)
    for (const obj of contourGroup.children) {
      if (obj instanceof THREE.Line && obj.material instanceof THREE.LineBasicMaterial) {
        obj.material.opacity = opacity;
      }
    }
  };
  animate();
}

        // --- Campo de gradiente ---
        // =========================================
        // CAMPO DE GRADIENTE 3D CON EFECTO NEON
        // Visualiza el gradiente ∇f(x,z) como vectores 3D con iluminación fluorescente
        // Cada vector muestra la dirección de máximo crecimiento de la función en ese punto
        // La longitud del vector representa la magnitud del gradiente (pendiente)
        // El efecto neón pulsante hace los vectores más visibles en la escena 3D
        // =========================================
        if (showGradientField) {
          const h = 0.01; // Paso pequeño para diferencias finitas

          // Crear campo vectorial en una cuadrícula
          const gridSize = gradientDensity[0];
          const spacing = 16 / gridSize; // Espaciado entre vectores

          // === Configuración del color verde neón ===
          const neonGreen = new THREE.Color(0x39ff14);

          // === Variables para animación del brillo (efecto respirante) ===
          const clock = new THREE.Clock();
          const neonObjects: THREE.Mesh[] = [];

          for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
              const x = -8 + i * spacing;
              const z = -8 + j * spacing;

              // Calcular derivadas parciales usando diferencias finitas
              const fx = plotFunc(x, z);
              const dfdx = (plotFunc(x + h, z) - plotFunc(x - h, z)) / (2 * h);
              const dfdz = (plotFunc(x, z + h) - plotFunc(x, z - h)) / (2 * h);

              // Magnitud del gradiente
              const magnitude = Math.sqrt(dfdx * dfdx + dfdz * dfdz);

              if (magnitude > 0.01 && isFinite(magnitude)) {
                const scale = 0.8;
                const nx = (dfdx / magnitude) * scale;
                const nz = (dfdz / magnitude) * scale;
                const startY = fx + 0.15;

                // === Línea del vector ===
                const arrowLength = Math.min(magnitude * 0.4, 2.0);
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(x, startY, z),
                  new THREE.Vector3(x + nx * arrowLength, startY, z + nz * arrowLength)
                ]);
                const lineMaterial = new THREE.LineBasicMaterial({
                  color: neonGreen,
                  linewidth: 2,
                  transparent: true,
                  opacity: 0.9
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);

                // === Punta del vector (más pequeña y brillante) ===
                const tipGeometry = new THREE.ConeGeometry(0.07, 0.2, 16);
                const tipMaterial = new THREE.MeshStandardMaterial({
                  color: neonGreen,
                  emissive: neonGreen,
                  emissiveIntensity: 2,
                  metalness: 0.1,
                  roughness: 0.3
                });
                const tip = new THREE.Mesh(tipGeometry, tipMaterial);

                // Posición y orientación de la punta
                tip.position.set(x + nx * arrowLength, startY, z + nz * arrowLength);
                tip.quaternion.setFromUnitVectors(
                  new THREE.Vector3(0, 1, 0),
                  new THREE.Vector3(nx, 0, nz).normalize()
                );

                scene.add(tip);
                neonObjects.push(tip);

                // === Esfera base ===
                const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
                const sphereMaterial = new THREE.MeshStandardMaterial({
                  color: neonGreen,
                  emissive: neonGreen,
                  emissiveIntensity: 1.5
                });
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set(x, startY, z);
                scene.add(sphere);
                neonObjects.push(sphere);
              }
            }
          }

          // === Animación de respiración (efecto neón pulsante) ===
          function animateNeonGlow() {
            const time = clock.getElapsedTime();
            const pulse = 1.5 + Math.sin(time * 2) * 0.5; // oscila entre 1.0 y 2.0
            neonObjects.forEach(obj => {
              if (obj.material instanceof THREE.MeshStandardMaterial) {
                obj.material.emissiveIntensity = pulse;
              }
            });
            requestAnimationFrame(animateNeonGlow);
          }

          animateNeonGlow();
        }

        // --- Auto-fit de cámara ---
        if (autoFitCameraEnabled) {
          // Pequeño delay para asegurar que toda la geometría esté renderizada
          setTimeout(() => autoFitCamera(camera, controls, scene), 100);
        } else {
          // --- Cámara ---
          camera.position.set(10, 7, 10);
          controls.update();
        }
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
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [funcResult, showContours, numContours, showGradientField, gradientDensity, showLayer, surfaceOpacity, autoFitCameraEnabled]);

  // =========================================
  // EFECTO DE VISUALIZACION 2D
  // Coordina la renderización 2D cuando se selecciona la pestaña correspondiente
  // Llama a render2DVisualization con todos los parámetros necesarios
  // Maneja la proyección 2D de funciones 3D para análisis detallado del plano
  // =========================================
  useEffect(() => {
    if (!mountRef2D.current || !funcResult || 'error' in funcResult) return;
    if (parsedFunc?.tipo !== '3D' || activeTab !== '2d') return;

    const cleanup = render2DVisualization(
      mountRef2D,
      funcResult,
      showInteractiveContours,
      interactiveContourHeight,
      showLayer,
      view2DMode,
      customRotation,
      showGradientField2D,
      setError
    );
    return cleanup;
  }, [funcResult, showInteractiveContours, interactiveContourHeight, showLayer, view2DMode, customRotation, activeTab, showGradientField2D]);

  // =========================================
  // EFECTO DE AUTOSCROLL A LA FIGURA 3D
  // Hace scroll automático hasta el canvas 3D cuando se activa la pestaña 3D
  // Mejora la experiencia del usuario al enfocar automáticamente la visualización
  // =========================================
  useEffect(() => {
    if (activeTab === '3d' && canvas3DRef.current) {
      // Pequeño delay para asegurar que el elemento esté completamente renderizado
      setTimeout(() => {
        canvas3DRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 300);
    }
  }, [activeTab]);

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

        {/* Tabs para 3D y 2D */}
        {parsedFunc?.tipo === '3D' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 transition-all duration-300">
              <TabsTrigger 
                value="3d" 
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                <Layers className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                Vista 3D
              </TabsTrigger>
              <TabsTrigger 
                value="2d"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                <Square className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                Vista 2D
              </TabsTrigger>
            </TabsList>

            {/* Tab 3D */}
            <TabsContent 
              value="3d" 
              className="space-y-6 animate-in fade-in duration-400 data-[state=inactive]:animate-out data-[state=inactive]:fade-out data-[state=inactive]:duration-300"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Visualización 3D - Superficie y Campo Vectorial
                </h3>

                {/* Controles de curvas de nivel */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <Label htmlFor="show-contours" className="text-sm font-medium">
                        Mostrar Curvas de Nivel
                      </Label>
                    </div>
                    <Switch
                      id="show-contours"
                      checked={showContours}
                      onCheckedChange={setShowContours}
                    />
                  </div>

                  {showContours && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Número de curvas: {numContours[0]}
                      </label>
                      <Slider
                        value={numContours}
                        onValueChange={setNumContours}
                        max={15}
                        min={3}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Controles de campo de gradiente */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <Label htmlFor="show-gradient" className="text-sm font-medium">
                        Mostrar Campo de Gradiente
                      </Label>
                    </div>
                    <Switch
                      id="show-gradient"
                      checked={showGradientField}
                      onCheckedChange={setShowGradientField}
                    />
                  </div>

                  {showGradientField && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Densidad: {gradientDensity[0]}x{gradientDensity[0]}
                      </label>
                      <Slider
                        value={gradientDensity}
                        onValueChange={setGradientDensity}
                        max={12}
                        min={4}
                        step={2}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Controles de mapa de calor topográfico */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      <Label htmlFor="show-heatmap" className="text-sm font-medium">
                        Mostrar Mapa de Calor Topográfico
                      </Label>
                    </div>
                    <Switch
                      id="show-heatmap"
                      checked={showLayer}
                      onCheckedChange={setShowLayer}
                    />
                  </div>

                  {showLayer && (
                    <div className="text-xs text-muted-foreground">
                      Aplica colores del mapa de calor a la superficie 3D
                    </div>
                  )}
                </div>

                {/* Controles de opacidad de la superficie */}
                
                <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    <Label className="text-sm font-medium">Opacidad de la Superficie</Label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Transparencia: {(surfaceOpacity[0] * 100).toFixed(0)}%
                    </label>
                    <Slider
                      value={surfaceOpacity}
                      onValueChange={setSurfaceOpacity}
                      max={1}
                      min={0.1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Controla la visibilidad de la superficie 3D (0.1 = casi transparente, 1.0 = opaco)
                    </div>
                  </div>
                </div>

                {/* Controles de auto-fit de cámara */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <Label htmlFor="auto-fit-camera" className="text-sm font-medium">
                        Auto-Ajuste de Cámara
                      </Label>
                    </div>
                    <Switch
                      id="auto-fit-camera"
                      checked={autoFitCameraEnabled}
                      onCheckedChange={setAutoFitCameraEnabled}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {autoFitCameraEnabled 
                      ? "La cámara se ajusta automáticamente para mostrar la figura completa"
                      : "Posición manual de la cámara (puedes usar controles para navegar)"
                    }
                  </div>
                </div>
              </div>

              {/* Canvas 3D */}
              <div ref={canvas3DRef}>
                <h4 className="text-md font-medium mb-2">Vista 3D Interactiva</h4>
                <div
                  ref={mountRef}
                  className="relative h-[80vh] w-full rounded-xl overflow-hidden border-2 border-border/50 shadow-inner bg-gradient-to-br from-background to-secondary"
                />
                <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
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
              </div>
            </TabsContent>

            {/* Tab 2D */}
            <TabsContent 
              value="2d" 
              className="space-y-6 animate-in fade-in duration-400 data-[state=inactive]:animate-out data-[state=inactive]:fade-out data-[state=inactive]:duration-300"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Square className="h-5 w-5" />
                  Visualización 2D - Análisis Interactivo
                </h3>

                {/* Controles de curvas de nivel interactivas */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <Label htmlFor="show-interactive-contours" className="text-sm font-medium">
                        Curva de Nivel Interactiva
                      </Label>
                    </div>
                    <Switch
                      id="show-interactive-contours"
                      checked={showInteractiveContours}
                      onCheckedChange={setShowInteractiveContours}
                    />
                  </div>

                  {showInteractiveContours && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Altura de contorno: {interactiveContourHeight[0].toFixed(2)}
                      </label>
                      <Slider
                        value={interactiveContourHeight}
                        onValueChange={setInteractiveContourHeight}
                        max={5}
                        min={-5}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        Muestra puntos donde f(x,y) = {interactiveContourHeight[0].toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Controles de vista 2D */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    <Label className="text-sm font-medium">Vista de Cámara</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={view2DMode === 'top' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setView2DMode('top')}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Superior
                    </Button>
                    <Button
                      variant={view2DMode === 'iso' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setView2DMode('iso')}
                      className="text-xs"
                    >
                      <EyeOff className="h-3 w-3 mr-1" />
                      Isométrica
                    </Button>
                    <Button
                      variant={view2DMode === 'side' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setView2DMode('side')}
                      className="text-xs"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Lateral
                    </Button>
                    <Button
                      variant={view2DMode === 'front' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setView2DMode('front')}
                      className="text-xs"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Frontal
                    </Button>
                  </div>
                </div>

                {/* Controles de campo de gradiente 2D */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <Label htmlFor="show-gradient-2d" className="text-sm font-medium">
                        Mostrar Campo de Gradiente 2D
                      </Label>
                    </div>
                    <Switch
                      id="show-gradient-2d"
                      checked={showGradientField2D}
                      onCheckedChange={setShowGradientField2D}
                    />
                  </div>

                  {showGradientField2D && (
                    <div className="text-xs text-muted-foreground">
                      Muestra flechas del gradiente en el plano 2D
                    </div>
                  )}
                </div>

              </div>

              {/* Canvas 2D */}
              <div>
                <h4 className="text-md font-medium mb-2">Vista 2D de Análisis</h4>
                <div
                  ref={mountRef2D}
                  className="relative h-[80vh] w-full rounded-xl overflow-hidden border-2 border-border/50 shadow-inner bg-gradient-to-br from-background to-secondary"
                />
                <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    <span>Click + arrastrar para mover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Scroll para zoom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Vista ortográfica 2D</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Canvas único para funciones 2D */}
        {parsedFunc?.tipo === '2D' && (
          <div
            ref={mountRef}
            className="relative h-[65vh] w-full rounded-xl overflow-hidden border-2 border-border/50 shadow-inner bg-gradient-to-br from-background to-secondary"
          />
        )}

        {/* Instrucciones para funciones 2D */}
        {parsedFunc?.tipo === '2D' && (
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span>Click + arrastrar para mover</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Scroll para zoom</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
