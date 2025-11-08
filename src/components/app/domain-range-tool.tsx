'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAppContext } from './app-context';
import { analyzeDomainAndRangeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, ZoomIn } from 'lucide-react';

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
    <div className="space-y-4 p-2">
      <p className="text-sm text-muted-foreground">
        Analiza el dominio y rango de la función ingresada. La IA determinará los valores de entrada y salida posibles.
      </p>
      <Button onClick={handleAnalysis} disabled={isLoading}>
        {isLoading ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <ZoomIn />
        )}
        Analizar Dominio y Rango
      </Button>

      {domainRangeResult && (
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-lg">Resultado del Análisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Dominio:</h4>
              <p className="text-sm font-mono p-2 bg-secondary rounded-md">{domainRangeResult.domain}</p>
            </div>
            <div>
              <h4 className="font-semibold">Rango:</h4>
              <p className="text-sm font-mono p-2 bg-secondary rounded-md">{domainRangeResult.range}</p>
            </div>
            {domainRangeResult.assumptions && (
              <div>
                <h4 className="font-semibold">Asunciones:</h4>
                <p className="text-sm text-muted-foreground">{domainRangeResult.assumptions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
