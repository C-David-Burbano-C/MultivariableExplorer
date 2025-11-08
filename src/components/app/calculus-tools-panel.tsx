'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DomainRangeTool } from './domain-range-tool';
import { PartialDerivativeTool } from './partial-derivative-tool';
import { MultipleIntegralTool } from './multiple-integral-tool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Activity, Sigma, Target } from 'lucide-react';

export function CalculusToolsPanel() {
  return (
    <Card className="shadow-modern-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <CardTitle className="text-xl font-bold">Herramientas de Cálculo</CardTitle>
        <CardDescription>
          Explore propiedades matemáticas avanzadas de su función
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="domain" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="domain" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Dominio</span>
            </TabsTrigger>
            <TabsTrigger value="derivative" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Derivadas</span>
            </TabsTrigger>
            <TabsTrigger value="integral" className="gap-2">
              <Sigma className="h-4 w-4" />
              <span className="hidden sm:inline">Integrales</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="domain" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Análisis de Dominio y Rango
              </h3>
              <DomainRangeTool />
            </div>
          </TabsContent>
          
          <TabsContent value="derivative" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Derivadas Parciales
              </h3>
              <PartialDerivativeTool />
            </div>
          </TabsContent>
          
          <TabsContent value="integral" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sigma className="h-4 w-4 text-primary" />
                Integrales Múltiples
              </h3>
              <MultipleIntegralTool />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
