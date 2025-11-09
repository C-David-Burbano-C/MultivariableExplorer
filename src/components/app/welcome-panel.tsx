'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Logo } from '../icons';
import { Calculator, FunctionSquare, Sparkles, Zap } from 'lucide-react';

interface WelcomePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomePanel({ open, onOpenChange }: WelcomePanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Logo width={64} height={64} />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Multivariable Explorer
              </DialogTitle>
              <DialogDescription className="text-lg mt-2">
                Aplicativo interactivo para cálculo multivariable
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card/50">
            <FunctionSquare className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Visualización 3D</h3>
            <p className="text-sm text-muted-foreground">
              Grafica funciones multivariable en 3D con curvas de nivel, campos de gradiente y mapas de calor interactivos
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card/50">
            <Calculator className="h-8 w-8 text-accent mb-3" />
            <h3 className="font-semibold text-lg mb-2">Herramientas de Cálculo</h3>
            <p className="text-sm text-muted-foreground">
              Analiza dominio, derivadas parciales, integrales múltiples y optimización de funciones
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card/50">
            <Zap className="h-8 w-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">IA Potenciada</h3>
            <p className="text-sm text-muted-foreground">
              Análisis inteligente de expresiones matemáticas con sugerencias y validaciones automáticas
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card/50">
            <Sparkles className="h-8 w-8 text-purple-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Interfaz Moderna</h3>
            <p className="text-sm text-muted-foreground">
              Experiencia de usuario intuitiva con controles interactivos y visualizaciones en tiempo real
            </p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Comienza ingresando una función matemática en el panel lateral para explorar sus propiedades
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Creado por</p>
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <span className="text-primary">Carlos Burbano</span>
              <span className="text-muted-foreground">y</span>
              <span className="text-accent">Luciana Cuenca</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}