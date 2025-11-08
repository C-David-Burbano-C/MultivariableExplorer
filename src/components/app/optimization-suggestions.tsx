'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TrendingUp, Zap, Target, Layers, Compass } from 'lucide-react';

interface OptimizationSuggestion {
  title: string;
  description: string;
  difficulty: 'Fácil' | 'Medio' | 'Avanzado';
  impact: 'Alto' | 'Medio' | 'Bajo';
  icon: React.ReactNode;
}

const suggestions: OptimizationSuggestion[] = [
  {
    title: 'Análisis de Puntos Críticos',
    description: 'Detectar máximos, mínimos y puntos silla usando derivadas parciales',
    difficulty: 'Medio',
    impact: 'Alto',
    icon: <Target className="h-5 w-5" />
  },
  {
    title: 'Curvas de Nivel y Contornos',
    description: 'Visualización 2D de funciones 3D con líneas de contorno',
    difficulty: 'Fácil',
    impact: 'Alto',
    icon: <Layers className="h-5 w-5" />
  },
  {
    title: 'Optimización con Restricciones',
    description: 'Método de multiplicadores de Lagrange para problemas de optimización',
    difficulty: 'Avanzado',
    impact: 'Alto',
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    title: 'Campos Vectoriales',
    description: 'Visualización de gradientes y campos vectoriales en 3D',
    difficulty: 'Medio',
    impact: 'Medio',
    icon: <Compass className="h-5 w-5" />
  },
  {
    title: 'Series de Taylor Multivariables',
    description: 'Aproximaciones polinomiales alrededor de puntos específicos',
    difficulty: 'Avanzado',
    impact: 'Medio',
    icon: <Zap className="h-5 w-5" />
  }
];

export function OptimizationSuggestions() {
  return (
    <Card className="shadow-modern-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          🚀 Sugerencias de Mejora
        </CardTitle>
        <CardDescription>
          Funcionalidades adicionales que potenciarían tu aplicativo
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-primary">
                    {suggestion.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={suggestion.difficulty === 'Fácil' ? 'default' : suggestion.difficulty === 'Medio' ? 'secondary' : 'destructive'} className="text-xs">
                    {suggestion.difficulty}
                  </Badge>
                  <Badge variant={suggestion.impact === 'Alto' ? 'default' : 'outline'} className="text-xs">
                    Impacto {suggestion.impact}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border">
          <h4 className="font-semibold text-sm mb-2">💡 Recomendación Prioritaria</h4>
          <p className="text-xs text-muted-foreground">
            Comienza con <strong>"Curvas de Nivel y Contornos"</strong> - es de alto impacto,
            dificultad baja y complementa perfectamente la visualización 3D existente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}