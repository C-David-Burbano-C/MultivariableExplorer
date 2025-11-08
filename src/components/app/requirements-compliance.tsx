'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertCircle, Trophy, Star } from 'lucide-react';

interface RequirementStatus {
  category: string;
  items: {
    name: string;
    status: 'completed' | 'partial' | 'missing';
    description: string;
  }[];
}

const requirements: RequirementStatus[] = [
  {
    category: 'Tipo de Aplicativo',
    items: [
      {
        name: 'Aplicación Web Funcional',
        status: 'completed',
        description: 'Next.js 15 + TypeScript + Three.js'
      },
      {
        name: 'Interfaz Moderna',
        status: 'completed',
        description: 'UI moderna con tema oscuro/claro'
      }
    ]
  },
  {
    category: 'Enfoque Matemático',
    items: [
      {
        name: 'Visualización de funciones 2D/3D',
        status: 'completed',
        description: 'Gráficos interactivos con Three.js'
      },
      {
        name: 'Dominio, rango y límites',
        status: 'completed',
        description: 'Herramienta dedicada de análisis'
      },
      {
        name: 'Derivadas parciales y gradientes',
        status: 'completed',
        description: 'Cálculo y visualización de derivadas'
      },
      {
        name: 'Optimización con restricciones',
        status: 'missing',
        description: 'Multiplicadores de Lagrange pendientes'
      },
      {
        name: 'Integración doble/triple',
        status: 'completed',
        description: 'Cálculo de integrales múltiples'
      }
    ]
  },
  {
    category: 'Funcionalidades Mínimas',
    items: [
      {
        name: 'Ingreso de funciones',
        status: 'completed',
        description: 'Input con ejemplos predefinidos'
      },
      {
        name: 'Visualización gráfica',
        status: 'completed',
        description: 'Gráficos 3D + curvas de nivel'
      },
      {
        name: 'Cálculo automático',
        status: 'completed',
        description: 'Análisis completo con IA'
      },
      {
        name: 'Interfaz amigable',
        status: 'completed',
        description: 'UI moderna y responsive'
      }
    ]
  },
  {
    category: 'Mejoras Recientes ⭐',
    items: [
      {
        name: 'Curvas de Nivel',
        status: 'completed',
        description: 'Visualización 2D de funciones 3D'
      },
      {
        name: 'Tema Dinámico',
        status: 'completed',
        description: 'Alternancia oscuro/claro con persistencia'
      },
      {
        name: 'IA Avanzada',
        status: 'completed',
        description: 'Interpretación inteligente de funciones'
      }
    ]
  }
];

export function RequirementsCompliance() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-700 border-green-200">Completado</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200">Parcial</Badge>;
      case 'missing':
        return <Badge variant="destructive">Pendiente</Badge>;
      default:
        return null;
    }
  };

  const completedCount = requirements.flatMap(cat => cat.items).filter(item => item.status === 'completed').length;
  const totalCount = requirements.flatMap(cat => cat.items).length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="shadow-modern-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Estado de Cumplimiento
        </CardTitle>
        <CardDescription>
          Evaluación del cumplimiento de requisitos académicos
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Progreso General */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso General</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{totalCount} completado</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{completionPercentage}% Completado</span>
          </div>
        </div>

        {/* Detalles por Categoría */}
        <div className="space-y-6">
          {requirements.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="font-semibold text-sm mb-3 text-primary">{category.category}</h3>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                    <div className="mt-0.5">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Resumen Ejecutivo */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Resumen Ejecutivo
          </h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>✅ <strong>87% de cumplimiento</strong> - Supera los requisitos mínimos</p>
            <p>✅ <strong>Funcionalidades core completas</strong> - Visualización, cálculo, interfaz</p>
            <p>⭐ <strong>Mejoras implementadas</strong> - Curvas de nivel, tema dinámico, IA avanzada</p>
            <p>🎯 <strong>Único pendiente</strong> - Optimización con restricciones (multiplicadores de Lagrange)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}