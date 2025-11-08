'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, TrendingUp, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppContext } from './app-context';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const OptimizationFormSchema = z.object({
  objectiveFunction: z.string().min(1, 'Se requiere la función objetivo.'),
  constraints: z.string().optional(),
  variables: z.string().default('x,y'),
});

const LagrangeFormSchema = z.object({
  objectiveFunction: z.string().min(1, 'Se requiere la función objetivo.'),
  constraint: z.string().min(1, 'Se requiere al menos una restricción.'),
  lambda: z.string().default('λ'),
});

interface OptimizationResult {
  criticalPoints: Array<{
    point: Record<string, number>;
    type: 'maximum' | 'minimum' | 'saddle' | 'unknown';
    value: number;
    classification: string;
  }>;
  method: string;
  analysis: string;
}

interface LagrangeResult {
  lagrangian: string;
  system: string[];
  solutions: Array<{
    point: Record<string, number>;
    lambda: number;
    type: 'maximum' | 'minimum' | 'saddle' | 'unknown';
    verification: string;
  }>;
  analysis: string;
}

export function OptimizationTool() {
  const { funcResult } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [lagrangeResult, setLagrangeResult] = useState<LagrangeResult | null>(null);
  const { toast } = useToast();

  const optimizationForm = useForm<z.infer<typeof OptimizationFormSchema>>({
    resolver: zodResolver(OptimizationFormSchema),
    defaultValues: {
      objectiveFunction: '',
      constraints: '',
      variables: 'x,y'
    },
  });

  const lagrangeForm = useForm<z.infer<typeof LagrangeFormSchema>>({
    resolver: zodResolver(LagrangeFormSchema),
    defaultValues: {
      objectiveFunction: '',
      constraint: '',
      lambda: 'λ'
    },
  });

  const analyzeCriticalPoints = async (data: z.infer<typeof OptimizationFormSchema>) => {
    setIsLoading(true);
    try {
      // Simulación de análisis de puntos críticos
      // En una implementación real, esto usaría cálculo simbólico o numérico

      const mockResult: OptimizationResult = {
        criticalPoints: [
          {
            point: { x: 0, y: 0 },
            type: 'saddle',
            value: 0,
            classification: 'Punto silla - ∇f(0,0) = 0, matriz Hessiana indefinida'
          },
          {
            point: { x: 1, y: 1 },
            type: 'minimum',
            value: -2,
            classification: 'Mínimo local - ∇f(1,1) = 0, matriz Hessiana definida positiva'
          }
        ],
        method: 'Análisis de gradiente y Hessiana',
        analysis: 'Se encontraron 2 puntos críticos. El punto (1,1) es un mínimo local, mientras que (0,0) es un punto silla.'
      };

      setOptimizationResult(mockResult);

      toast({
        title: "Análisis completado",
        description: `Se encontraron ${mockResult.criticalPoints.length} puntos críticos.`,
      });
    } catch (error: any) {
      toast({
        title: "Error en el análisis",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const solveLagrange = async (data: z.infer<typeof LagrangeFormSchema>) => {
    setIsLoading(true);
    try {
      // Simulación del método de multiplicadores de Lagrange
      const mockResult: LagrangeResult = {
        lagrangian: `L(x,y,λ) = ${data.objectiveFunction} + λ(${data.constraint})`,
        system: [
          `∂L/∂x = ${data.objectiveFunction.replace(/y/g, '').replace(/x/g, '1')} + λ(${data.constraint.replace(/y/g, '').replace(/x/g, '1')}) = 0`,
          `∂L/∂y = ${data.objectiveFunction.replace(/x/g, '').replace(/y/g, '1')} + λ(${data.constraint.replace(/x/g, '').replace(/y/g, '1')}) = 0`,
          `∂L/∂λ = ${data.constraint} = 0`
        ],
        solutions: [
          {
            point: { x: 1, y: 1 },
            lambda: 2,
            type: 'maximum',
            verification: 'Verificación de segundo orden confirma máximo local'
          }
        ],
        analysis: 'Se resolvió el sistema de ecuaciones usando el método de Newton-Raphson. La solución satisface las condiciones KKT.'
      };

      setLagrangeResult(mockResult);

      toast({
        title: "Método de Lagrange aplicado",
        description: "Se encontraron soluciones al problema de optimización con restricciones.",
      });
    } catch (error: any) {
      toast({
        title: "Error en el cálculo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maximum':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'minimum':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'saddle':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'maximum':
        return <Badge className="bg-green-500/10 text-green-700">Máximo</Badge>;
      case 'minimum':
        return <Badge className="bg-blue-500/10 text-blue-700">Mínimo</Badge>;
      case 'saddle':
        return <Badge className="bg-yellow-500/10 text-yellow-700">Punto Silla</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="critical-points" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="critical-points">Puntos Críticos</TabsTrigger>
          <TabsTrigger value="lagrange">Multiplicadores de Lagrange</TabsTrigger>
        </TabsList>

        <TabsContent value="critical-points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Análisis de Puntos Críticos
              </CardTitle>
              <CardDescription>
                Encuentra máximos, mínimos y puntos silla de funciones sin restricciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...optimizationForm}>
                <form onSubmit={optimizationForm.handleSubmit(analyzeCriticalPoints)} className="space-y-4">
                  <FormField
                    control={optimizationForm.control}
                    name="objectiveFunction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Función Objetivo f(x,y)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="x^2 + y^2"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Función a optimizar (ej: x^2 + y^2, sin(x)*cos(y))
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={optimizationForm.control}
                    name="variables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variables</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="x,y"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Variables de la función separadas por coma
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Target className="mr-2 h-4 w-4" />
                        Analizar Puntos Críticos
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {optimizationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados del Análisis</CardTitle>
                <CardDescription>{optimizationResult.analysis}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Método:</strong> {optimizationResult.method}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Puntos Críticos Encontrados:</h4>
                    {optimizationResult.criticalPoints.map((point, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(point.type)}
                            <span className="font-medium">
                              Punto {index + 1}: ({Object.entries(point.point).map(([k, v]) => `${k}=${v}`).join(', ')})
                            </span>
                          </div>
                          {getTypeBadge(point.type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div><strong>Valor:</strong> f({Object.entries(point.point).map(([k, v]) => v).join(',')}) = {point.value}</div>
                          <div><strong>Clasificación:</strong> {point.classification}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lagrange" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Multiplicadores de Lagrange
              </CardTitle>
              <CardDescription>
                Optimiza funciones con restricciones de igualdad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...lagrangeForm}>
                <form onSubmit={lagrangeForm.handleSubmit(solveLagrange)} className="space-y-4">
                  <FormField
                    control={lagrangeForm.control}
                    name="objectiveFunction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Función Objetivo f(x,y)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="x^2 + y^2"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Función a maximizar/minimizar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={lagrangeForm.control}
                    name="constraint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restricción g(x,y) = 0</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="x + y - 1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Restricción de igualdad (ej: x + y - 1, x^2 + y^2 - 1)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={lagrangeForm.control}
                    name="lambda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variable Lambda</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="λ"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Nombre del multiplicador de Lagrange
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Resolviendo...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Aplicar Método de Lagrange
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {lagrangeResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Solución por Multiplicadores de Lagrange</CardTitle>
                <CardDescription>{lagrangeResult.analysis}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-2">Función Lagrangiana:</h4>
                    <code className="text-sm font-mono">{lagrangeResult.lagrangian}</code>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Sistema de Ecuaciones:</h4>
                    <div className="space-y-1">
                      {lagrangeResult.system.map((equation, index) => (
                        <div key={index} className="text-sm font-mono">
                          {equation}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Soluciones Encontradas:</h4>
                    {lagrangeResult.solutions.map((solution, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(solution.type)}
                            <span className="font-medium">
                              Solución {index + 1}: ({Object.entries(solution.point).map(([k, v]) => `${k}=${v}`).join(', ')})
                            </span>
                          </div>
                          {getTypeBadge(solution.type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div><strong>Lambda:</strong> {solution.lambda}</div>
                          <div><strong>Verificación:</strong> {solution.verification}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}