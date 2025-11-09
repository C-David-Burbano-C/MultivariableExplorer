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
  const { funcResult, isParsing, activeMainTab, setActiveMainTab } = useAppContext();
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
    <main className="flex flex-1 flex-col p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto transition-all duration-300">
          <TabsTrigger 
            value="tools" 
            className="flex-col sm:flex-row gap-1 sm:gap-2 py-3 sm:py-2 transition-all duration-200 hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
          >
            <PilcrowSquare className="h-4 w-4 sm:mr-2 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xs sm:text-sm transition-colors duration-200">Herramientas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="visualization" 
            disabled={!funcResult || 'error' in funcResult}
            className="flex-col sm:flex-row gap-1 sm:gap-2 py-3 sm:py-2 transition-all duration-200 hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FunctionSquare className="h-4 w-4 sm:mr-2 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xs sm:text-sm transition-colors duration-200">Visualización</span>
          </TabsTrigger>
          <TabsTrigger 
            value="calculator"
            className="flex-col sm:flex-row gap-1 sm:gap-2 py-3 sm:py-2 transition-all duration-200 hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
          >
            <Calculator className="h-4 w-4 sm:mr-2 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xs sm:text-sm transition-colors duration-200">Calculadora</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent 
          value="tools" 
          className="animate-in fade-in duration-300 data-[state=inactive]:animate-out data-[state=inactive]:fade-out data-[state=inactive]:duration-200"
        >
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
        <TabsContent 
          value="visualization"
          className="animate-in fade-in duration-300 data-[state=inactive]:animate-out data-[state=inactive]:fade-out data-[state=inactive]:duration-200"
        >
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
        <TabsContent 
          value="calculator"
          className="animate-in fade-in duration-300 data-[state=inactive]:animate-out data-[state=inactive]:fade-out data-[state=inactive]:duration-200"
        >
          <CalculatorPanel />
        </TabsContent>
      </Tabs>

      <WelcomePanel open={showWelcome} onOpenChange={setShowWelcome} />
    </main>
  );
}
