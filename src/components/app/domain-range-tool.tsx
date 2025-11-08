'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAppContext } from './app-context';
import { analyzeDomainAndRangeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Target, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';

export function DomainRangeTool() {
  const { funcResult, domainRangeResult, setDomainRangeResult } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Función para normalizar símbolos matemáticos descriptivos a Unicode
  const normalizeMathNotation = (mathNotation: string): string => {
    return mathNotation
      .replace(/"element_of"/g, '∈')
      .replace(/"R"/g, 'ℝ')
      .replace(/"N"/g, 'ℕ')
      .replace(/"Z"/g, 'ℤ')
      .replace(/"Q"/g, 'ℚ')
      .replace(/"C"/g, 'ℂ')
      .replace(/element_of/g, '∈')
      .replace(/real numbers/g, 'ℝ')
      .replace(/natural numbers/g, 'ℕ')
      .replace(/integers/g, 'ℤ')
      .replace(/rational numbers/g, 'ℚ')
      .replace(/complex numbers/g, 'ℂ');
  };

  // Función para convertir notación matemática a texto legible en español
  const formatDomainRange = (mathNotation: string, isRange: boolean = false): { readable: string; explanation: string } => {
    const type = isRange ? 'rango' : 'dominio';

    // Usar la notación normalizada para las comparaciones
    const normalized = normalizeMathNotation(mathNotation);

    // Casos comunes de dominio
    if (!isRange) {
      if (normalized.includes('ℝ') && normalized.includes('∈')) {
        if (normalized.includes('x ∈ ℝ') && normalized.includes('y ∈ ℝ')) {
          return {
            readable: 'Todos los números reales para x y y',
            explanation: 'La función puede recibir cualquier valor real tanto para x como para y'
          };
        }
        if (normalized.includes('x ∈ ℝ') && !normalized.includes('y')) {
          return {
            readable: 'Todos los números reales para x',
            explanation: 'La función puede recibir cualquier valor real para la variable x'
          };
        }
      }

      if (normalized.includes('≥ 0') || normalized.includes('> 0')) {
        const isGreaterEqual = normalized.includes('≥ 0');
        return {
          readable: `x ${isGreaterEqual ? 'mayor o igual' : 'mayor'} a 0`,
          explanation: `La función está definida para valores de x ${isGreaterEqual ? 'desde 0 en adelante' : 'mayores a 0'}, ya que evita divisiones por cero o raíces cuadradas de números negativos`
        };
      }

      if (normalized.includes('≠ 0')) {
        return {
          readable: 'x diferente de 0',
          explanation: 'La función no está definida en x = 0, generalmente debido a una división por cero'
        };
      }

      if (normalized.includes('[-1, 1]')) {
        return {
          readable: 'x entre -1 y 1 inclusive',
          explanation: 'La función está definida en el intervalo cerrado [-1, 1], común en funciones trigonométricas inversas'
        };
      }

      if (normalized.includes('(-∞, ∞)')) {
        return {
          readable: 'Todos los números reales',
          explanation: 'La función está definida para cualquier número real'
        };
      }
    } else {
      // Casos comunes de rango
      if (normalized.includes('ℝ') || normalized.includes('(-∞, ∞)')) {
        return {
          readable: 'Todos los números reales',
          explanation: 'La función puede tomar cualquier valor real como resultado'
        };
      }

      if (normalized.includes('[0, ∞)') || normalized.includes('≥ 0')) {
        return {
          readable: 'Números reales no negativos (desde 0 en adelante)',
          explanation: 'Los valores de la función nunca son negativos, comenzando desde cero'
        };
      }

      if (normalized.includes('(-1, 1)')) {
        return {
          readable: 'Valores entre -1 y 1, sin incluir los extremos',
          explanation: 'La función toma valores en el intervalo abierto (-1, 1)'
        };
      }

      if (normalized.includes('[-1, 1]')) {
        return {
          readable: 'Valores entre -1 y 1 inclusive',
          explanation: 'La función toma valores en el intervalo cerrado [-1, 1]'
        };
      }
    }

    // Si no reconoce el patrón, devuelve el normalizado con una explicación genérica
    return {
      readable: normalized,
      explanation: `Notación matemática estándar del conjunto de valores ${isRange ? 'que puede tomar' : 'permitidos para'} la función`
    };
  };

  const handleAnalysis = async () => {
    if (!funcResult || 'error' in funcResult) {
      toast({
        variant: 'destructive',
        title: 'Función no válida',
        description: 'Por favor, primero ingrese y analice una función válida.',
      });
      return;
    }

    setIsLoading(true);
    setDomainRangeResult(null);
    try {
      const result = await analyzeDomainAndRangeAction({ functionString: funcResult.expresionNormalizada });
      setDomainRangeResult(result);
      toast({
        title: '✓ Análisis completado',
        description: 'El dominio y rango se calcularon correctamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de Análisis',
        description: 'No se pudo analizar el dominio y rango.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Analiza el dominio y rango de la función ingresada. La IA determinará los valores de entrada y salida posibles.
      </p>
      <Button 
        onClick={handleAnalysis} 
        disabled={isLoading}
        className="w-full shadow-modern"
        size="lg"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Analizando...
          </>
        ) : (
          <>
            <Target className="mr-2 h-4 w-4" />
            Analizar Dominio y Rango
          </>
        )}
      </Button>

      {domainRangeResult && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-base">Dominio</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-background/50 rounded-md p-3 border">
                <p className="text-sm font-medium text-primary mb-1">En palabras:</p>
                <p className="text-sm">{formatDomainRange(domainRangeResult.domain, false).readable}</p>
              </div>
              <div className="bg-background/50 rounded-md p-3 border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Explicación:</p>
                <p className="text-sm">{formatDomainRange(domainRangeResult.domain, false).explanation}</p>
              </div>
              <div className="bg-background/50 rounded-md p-3 border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Notación matemática:</p>
                <code className="text-sm font-mono">{normalizeMathNotation(domainRangeResult.domain)}</code>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <h4 className="font-semibold text-base">Rango</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-background/50 rounded-md p-3 border">
                <p className="text-sm font-medium text-accent mb-1">En palabras:</p>
                <p className="text-sm">{formatDomainRange(domainRangeResult.range, true).readable}</p>
              </div>
              <div className="bg-background/50 rounded-md p-3 border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Explicación:</p>
                <p className="text-sm">{formatDomainRange(domainRangeResult.range, true).explanation}</p>
              </div>
              <div className="bg-background/50 rounded-md p-3 border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Notación matemática:</p>
                <code className="text-sm font-mono">{normalizeMathNotation(domainRangeResult.range)}</code>
              </div>
            </div>
          </div>

          {domainRangeResult.assumptions && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <Badge variant="secondary" className="mb-2">Asunciones</Badge>
              <p className="text-sm text-muted-foreground">{domainRangeResult.assumptions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
