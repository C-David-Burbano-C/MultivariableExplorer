'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisualizationPanel } from './visualization-panel';
import { CalculusToolsPanel } from './calculus-tools-panel';
import { useAppContext } from './app-context';
import { AlertCircle, FunctionSquare, PilcrowSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function MainPanel() {
  const { funcResult, isParsing } = useAppContext();

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

  if (!funcResult) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center p-8">
        <Alert className="max-w-lg text-center">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-headline">Listo para explorar</AlertTitle>
            <AlertDescription>
                Ingrese una función en el panel lateral para comenzar a visualizar y analizar conceptos de cálculo multivariable.
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  if ('error' in funcResult) {
     return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-lg text-center">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-headline">Error en la Función</AlertTitle>
            <AlertDescription>
                {funcResult.error}
                <br />
                Por favor, revise la función ingresada e intente nuevamente.
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6">
      <Tabs defaultValue="visualization">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visualization">
            <FunctionSquare className="mr-2 h-4 w-4" />
            Visualización
          </TabsTrigger>
          <TabsTrigger value="tools">
            <PilcrowSquare className="mr-2 h-4 w-4" />
            Herramientas de Cálculo
          </TabsTrigger>
        </TabsList>
        <TabsContent value="visualization">
          <VisualizationPanel />
        </TabsContent>
        <TabsContent value="tools">
          <CalculusToolsPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
}
