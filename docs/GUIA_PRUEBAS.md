# Guía de Pruebas - MultivariableExplorer

##  Inicio Rápido

### 1. Reiniciar el Servidor de Desarrollo

```powershell
# Detener el servidor actual (Ctrl+C en la terminal)
# Luego ejecutar:
npm run dev
```

**Nota:** Es necesario reiniciar para que la API key en `.env.local` sea reconocida.

---

## Checklist de Pruebas Visuales

### Diseño Moderno (Vercel/DeepSeek)

- [ ] **Header con glassmorphism**
  - Fondo translúcido con blur
  - Icono con Sparkles animado
  - Indicador "AI Powered" con pulso verde

- [ ] **Paleta de colores**
  - Azul vibrante para elementos principales
  - Púrpura para acentos
  - Gradientes sutiles en cards
  - Modo oscuro con fondo azul profundo

- [ ] **Animaciones fluidas**
  - Transiciones suaves en hover
  - Fade-in en resultados
  - Pulso en iconos animados

---

##  Pruebas Funcionales

### A. Panel de Entrada de Funciones

#### 1. Ejemplos Rápidos
```
Pasos:
1. Click en "Ejemplos rápidos" (botón con icono Lightbulb)
2. Verificar que se despliegan 6 ejemplos en grid 2x3
3. Click en "Paraboloide" (z = x^2 + y^2)
4. Verificar que se carga en el textarea
5. Click en "Analizar y Graficar"
```

**Resultado esperado:**
- Toast con mensaje "¡Función analizada!"
- Visualización 3D con gradiente azul-púrpura
- Header muestra "Superficie cuadrática..." o similar

#### 2. Función 2D Manual
```
Entrada: y = sin(x)
```

**Resultado esperado:**
- Gráfico 2D con línea púrpura
- Tipo: "2D" en la descripción
- Expresión normalizada: "Math.sin(x)"

#### 3. Función 3D Manual
```
Entrada: z = sin(x) * cos(y)
```

**Resultado esperado:**
- Superficie 3D ondulada
- Colores degradados (azul → índigo → púrpura)
- Auto-rotación suave
- Grid y ejes visibles

---

### B. Visualización 3D Mejorada

#### 1. Controles de Cámara
```
Acciones:
- Click + arrastrar → Rotar
- Scroll → Zoom in/out
- Click derecho + arrastrar → Pan
```

**Resultado esperado:**
- Rotación suave con damping
- Zoom limitado entre 5-50 unidades
- Auto-rotación continúa después de soltar

#### 2. Calidad Visual
```
Verificar:
- Fondo con gradiente azul oscuro → azul → púrpura
- Superficie con al menos 3 tonos interpolados
- Ejes X, Y, Z visibles
- Grid translúcida en el suelo
- Sin artefactos o glitches
```

---

### C. Herramientas de Cálculo

#### 1. Dominio y Rango

**Función de prueba:** `z = sqrt(x^2 + y^2)`

```
Pasos:
1. Parsear la función
2. Ir a tab "Herramientas de Cálculo"
3. Click en tab "Dominio"
4. Click en "Analizar Dominio y Rango"
```

**Resultado esperado:**
- Toast "✓ Análisis completado"
- Card con borde azul para Dominio
- Card con borde púrpura para Rango
- Resultado: Dominio = ℝ², Rango = [0, ∞)
- Animación fade-in al aparecer

#### 2. Derivadas Parciales

**Función de prueba:** `z = x^2 + y^2`

```
Pasos:
1. Parsear la función
2. Ir a tab "Derivadas"
3. Ingresar variable: x
4. Ingresar punto: x=2, y=3
5. Click "Calcular Derivada Parcial"
```

**Resultado esperado:**
- Toast "✓ Derivada calculada"
- Badge con "∂f/∂x"
- Derivada: "2*x"
- Valor evaluado: **4** (en grande)
- Gradientes diferenciados (azul y púrpura)

**Pruebas adicionales:**
```
Variable: y, Punto: x=2, y=3
Resultado: Derivada = "2*y", Valor = 6
```

#### 3. Integrales Múltiples

**Función de prueba:** `x*y`

```
Pasos:
1. Parsear la función anterior
2. Ir a tab "Integrales"
3. Región: 0 < x < 1, 0 < y < 1
4. Variables: x, y
5. Click "Calcular Integral"
```

**Resultado esperado:**
- Resultado: 0.25
- Pasos de cálculo visibles
- Sin errores

---

## 🐛 Casos Edge (Validación)

### 1. Entrada Inválida
```
Input: "asdfghjkl"
```
**Esperado:** Error con mensaje claro

### 2. Función con División por Cero
```
Input: z = 1/x
```
**Esperado:** Visualización con NaN manejado (no crash)

### 3. Sintaxis Incorrecta
```
Input: "y = x^ (sin incompleto)"
```
**Esperado:** Error de parsing, no crash

### 4. Función Muy Compleja
```
Input: z = sin(x)*cos(y)*tan(x+y)*sqrt(x^2+y^2)
```
**Esperado:** Puede tardar más, pero debe funcionar

---

##  Validación de Cálculos

### Tests Matemáticos Básicos

#### Derivadas Parciales
| Función | Variable | Resultado Esperado |
|---------|----------|-------------------|
| x^2 + y^2 | x | 2*x |
| x^2 + y^2 | y | 2*y |
| x*y | x | y |
| sin(x)*cos(y) | x | cos(x)*cos(y) |

#### Evaluación en Puntos
| Función | Variable | Punto | Valor Esperado |
|---------|----------|-------|----------------|
| x^2 + y^2 | x | x=2, y=3 | 4 |
| x^2 + y^2 | y | x=2, y=3 | 6 |

#### Dominio y Rango
| Función | Dominio Esperado | Rango Esperado |
|---------|-----------------|----------------|
| x^2 | ℝ | [0, ∞) |
| sqrt(x) | [0, ∞) | [0, ∞) |
| sin(x) | ℝ | [-1, 1] |

---

##  Validación Visual

### Paleta de Colores (Modo Claro)
```
Primary (Azul):    #2563eb  ← Botones principales
Accent (Púrpura):  #7c3aed  ← Elementos destacados
Background:        #ffffff  ← Fondo
Foreground:        #171717  ← Texto
```

### Paleta de Colores (Modo Oscuro)
```
Primary (Azul):    #3b82f6  ← Botones principales
Accent (Púrpura):  #a855f7  ← Elementos destacados
Background:        #1a202c  ← Fondo
Foreground:        #fafafa  ← Texto
```

---

##  Performance

### Métricas Esperadas
- **Carga inicial:** <2 segundos
- **Parsing de función:** <3 segundos
- **Renderizado 3D:** 60 FPS
- **Cálculo derivada:** <2 segundos
- **Análisis dominio:** <3 segundos

### Optimizaciones Implementadas
- Pixel ratio limitado a 2x
- Animación limitada a ~60 FPS
- Geometría optimizada (120x120)
- Disposición de recursos Three.js

---

##  Troubleshooting

### Problema: API Key no reconocida
```powershell
# Solución:
1. Verificar archivo .env.local existe
2. Reiniciar servidor (Ctrl+C y npm run dev)
3. Limpiar cache: rm -rf .next
```

### Problema: Visualización no aparece
```
Posibles causas:
- WebGL no soportado (verificar navegador)
- Error en función (revisar consola)
- Three.js no cargó (refrescar página)
```

### Problema: Cálculos toman mucho tiempo
```
Causas probables:
- Función muy compleja
- API rate limiting
- Conexión lenta

Solución: Esperar o simplificar función
```

---

##  Compatibilidad

### Navegadores Probados
- Chrome 90+ (recomendado)
- Edge 90+
- Firefox 88+
- Safari 14+
-  IE11 (no soportado)

### Dispositivos
- Desktop (óptimo)
- Tablet (funcional)
-  Mobile (limitado - pantalla pequeña)

---

## Checklist Final

### Antes de Considerar Completo
- [ ] Todas las funciones de ejemplo funcionan
- [ ] Derivadas parciales calculan correctamente
- [ ] Integrales dan resultados correctos
- [ ] Dominio y rango son precisos
- [ ] Visualización 3D es fluida
- [ ] Modo oscuro funciona
- [ ] No hay errores en consola
- [ ] API key configurada
- [ ] Todos los toasts aparecen
- [ ] Animaciones son suaves

---

##  Reporte de Problemas

Si encuentras algún problema, documenta:

1. **Función ingresada:** (ej: z = x^2 + y^2)
2. **Acción realizada:** (ej: Calcular derivada)
3. **Resultado esperado:** (ej: 2*x)
4. **Resultado obtenido:** (ej: Error o resultado incorrecto)
5. **Console errors:** (F12 → Console)
6. **Navegador y versión:** (ej: Chrome 120)

---

**Estado de Tests:**  Pendiente de ejecución  
**Documentación:** Completa  
**Código:** Sin errores de compilación  
**API:** Configurada
