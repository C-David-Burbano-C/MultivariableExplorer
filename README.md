# Multivariable Explorer

Aplicativo web interactivo para el cálculo multivariable que permite visualizar y analizar funciones matemáticas en 3D con herramientas avanzadas de cálculo.

## ¿Qué hace el programa?

Multivariable Explorer es una herramienta educativa y profesional que permite:

- **Visualización 3D Interactiva**: Graficar funciones multivariable en espacios tridimensionales con curvas de nivel, campos de gradiente y mapas de calor
- **Herramientas de Cálculo**: Analizar dominio, rango, derivadas parciales, integrales múltiples y optimización de funciones
- **Análisis con IA**: Procesamiento inteligente de expresiones matemáticas con validaciones automáticas y sugerencias
- **Interfaz Moderna**: Experiencia de usuario intuitiva con controles interactivos y visualizaciones en tiempo real

## Tecnologías Utilizadas

### Framework y Lenguaje
- **Next.js 15.3.3**: Framework React para aplicaciones web con App Router
- **TypeScript**: Lenguaje de programación con tipado estático
- **React 18**: Biblioteca para interfaces de usuario

### UI y Estilos
- **Tailwind CSS**: Framework de CSS utilitario
- **shadcn/ui**: Componentes UI modernos y accesibles
- **Radix UI**: Primitivos UI sin estilos para componentes complejos
- **Lucide React**: Iconos modernos y consistentes

### Funcionalidades Avanzadas
- **Three.js**: Biblioteca para gráficos 3D en el navegador
- **Google GenAI (Genkit)**: Integración con IA para análisis matemático
- **React Hook Form**: Manejo de formularios con validación
- **Zod**: Validación de esquemas TypeScript
- **Recharts**: Gráficos y visualizaciones de datos

### Herramientas de Desarrollo
- **ESLint**: Linting y formateo de código
- **PostCSS**: Procesador CSS
- **TypeScript Compiler**: Compilación de TypeScript

## Requisitos del Sistema

### Requisitos Mínimos
- **Node.js**: Versión 18.0 o superior
- **npm**: Versión 8.0 o superior (viene incluido con Node.js)
- **Navegador Web**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Requisitos Recomendados
- **Node.js**: Versión 20.x LTS
- **RAM**: 4GB mínimo, 8GB recomendado
- **Procesador**: Multi-core moderno
- **GPU**: Soporte WebGL para visualizaciones 3D

## Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/C-David-Burbano-C/MultivariableExplorer.git
cd MultivariableExplorer
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo de ejemplo y configura las variables necesarias:
```bash
cp .env.example .env.local
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

El aplicativo estará disponible en `http://localhost:3000`

### 5. Construir para producción
```bash
npm run build
npm start
```

## Uso del Aplicativo

1. **Ingresar Función**: Escribe una función matemática multivariable en el panel lateral
2. **Visualización**: Explora la gráfica 3D interactiva con controles de zoom y rotación
3. **Herramientas de Cálculo**: Utiliza las pestañas para analizar dominio, derivadas parciales, integrales y optimización
4. **IA Asistida**: Recibe sugerencias automáticas y validaciones de expresiones matemáticas

## Creadores

- **Carlos Burbano**
- **Luciana Cuenca**

## Licencia

Este proyecto es de uso educativo y académico.

---

*Desarrollado con para la comunidad matemática*</content>
<parameter name="filePath">d:\UCC2\MultivariableExplorer\README.md