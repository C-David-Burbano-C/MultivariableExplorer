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
            <div className="bg-background/50 rounded-md p-3 border">
              <code className="text-sm font-mono">{domainRangeResult.domain}</code>
            </div>
          </div>

          <div className="rounded-lg border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <h4 className="font-semibold text-base">Rango</h4>
            </div>
            <div className="bg-background/50 rounded-md p-3 border">
              <code className="text-sm font-mono">{domainRangeResult.range}</code>
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
