'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VisualizationPanel from './visualization-panel';
import { CalculusToolsPanel } from './calculus-tools-panel';
import { CalculatorPanel } from './calculator-panel';
import { WelcomePanel } from './welcome-panel';
import { useAppContext } from './app-context';
import { AlertCircle, Calculator, FunctionSquare, PilcrowSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function MainPanel() {
  const { funcResult, isParsing } = useAppContext();
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome dialog when no function is loaded
  useEffect(() => {
    if (!funcResult || 'error' in funcResult) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [funcResult]);

  if (isParsing) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 border-8 border-dashed rounded-full animate-spin border-primary"></div>
            <p className="text-lg text-muted-foreground font-headline">Analizando función...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6">
      <Tabs defaultValue="tools">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">
            <PilcrowSquare className="mr-2 h-4 w-4" />
            Herramientas de Cálculo
          </TabsTrigger>
          <TabsTrigger value="visualization" disabled={!funcResult || 'error' in funcResult}>
            <FunctionSquare className="mr-2 h-4 w-4" />
            Visualización
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Calculator className="mr-2 h-4 w-4" />
            Calculadora
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tools">
          {funcResult && !('error' in funcResult) ? (
            <CalculusToolsPanel />
          ) : (
            <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center p-8">
              <Alert className="max-w-lg text-center">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-headline">Herramientas no disponibles</AlertTitle>
                  <AlertDescription>
                      Ingrese una función en el panel lateral para acceder a las herramientas de cálculo.
                  </AlertDescription>
              </Alert>
            </div>
          )}
        </TabsContent>
        <TabsContent value="visualization">
          {funcResult && !('error' in funcResult) ? (
            <VisualizationPanel />
          ) : (
            <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center p-8">
              <Alert className="max-w-lg text-center">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-headline">Visualización no disponible</AlertTitle>
                  <AlertDescription>
                      Ingrese una función en el panel lateral para visualizarla gráficamente.
                  </AlertDescription>
              </Alert>
            </div>
          )}
        </TabsContent>
        <TabsContent value="calculator">
          <CalculatorPanel />
        </TabsContent>
      </Tabs>

      <WelcomePanel open={showWelcome} onOpenChange={setShowWelcome} />
    </main>
  );
}
