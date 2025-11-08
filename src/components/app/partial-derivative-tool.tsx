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
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAppContext } from './app-context';
import { calculatePartialDerivativeAction } from '@/app/actions';
import { useState } from 'react';
import { Badge } from '../ui/badge';

const FormSchema = z.object({
  variable: z.string().min(1, 'Se requiere una variable.'),
  point: z.string().optional(),
});

export function PartialDerivativeTool() {
  const { funcResult, partialDerivativeResult, setPartialDerivativeResult } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { variable: 'x', point: '' },
  });

  const parsePoint = (pointStr: string | undefined) => {
    if (!pointStr) return undefined;
    try {
        const pointObj: Record<string, number> = {};
        pointStr.split(',').forEach(part => {
            const [key, value] = part.split('=').map(s => s.trim());
            if (key && value && !isNaN(Number(value))) {
                pointObj[key] = Number(value);
            }
        });
        return Object.keys(pointObj).length > 0 ? pointObj : undefined;
    } catch {
        return undefined;
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!funcResult || 'error' in funcResult) {
      toast({
        variant: 'destructive',
        title: 'Función no válida',
        description: 'Por favor, primero ingrese y analice una función válida.',
      });
      return;
    }

    const point = parsePoint(data.point);
    if (data.point && !point) {
        form.setError('point', { type: 'manual', message: 'Formato de punto inválido. Use: x=1, y=2' });
        return;
    }

    setIsLoading(true);
    setPartialDerivativeResult(null);

    try {
      const result = await calculatePartialDerivativeAction({
        functionString: funcResult.expresionNormalizada,
        variable: data.variable,
        point: point,
      });

      if (result.error) {
        toast({ variant: 'destructive', title: 'Error de Cálculo', description: result.error });
      } else {
        console.log('Partial derivative result:', result); // Debug
        toast({
          title: '✓ Derivada calculada',
          description: `∂f/∂${data.variable} se calculó correctamente.`,
        });
      }
      setPartialDerivativeResult(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de Cálculo',
        description: 'No se pudo calcular la derivada parcial.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="variable"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium">Variable de derivación</FormLabel>
                    <FormControl>
                    <Input 
                      placeholder="x, y, o z" 
                      className="font-mono" 
                      {...field} 
                    />
                    </FormControl>
                    <FormDescription className="text-xs">∂f/∂variable</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="point"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium">Punto de evaluación</FormLabel>
                    <FormControl>
                    <Input 
                      placeholder="x=1, y=2" 
                      className="font-mono text-sm"
                      {...field} 
                    />
                    </FormControl>
                    <FormDescription className="text-xs">Opcional: x=num, y=num</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full shadow-modern"
            size="lg"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Calcular Derivada Parcial
              </>
            )}
          </Button>
        </form>
      </Form>
      
      {partialDerivativeResult && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-base">Derivada Parcial</h4>
              <Badge variant="secondary" className="ml-auto">
                ∂f/∂{form.getValues('variable')}
              </Badge>
            </div>
            <div className="bg-background/50 rounded-md p-4 border">
              <code className="text-base font-mono block">
                {partialDerivativeResult.derivative}
              </code>
            </div>
          </div>

          {partialDerivativeResult.evaluatedValue !== undefined && partialDerivativeResult.evaluatedValue !== null && (
            <div className="rounded-lg border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="h-5 w-5 text-accent" />
                <h4 className="font-semibold text-base">Valor en el Punto</h4>
              </div>
              <div className="bg-background/50 rounded-md p-4 border">
                <code className="text-2xl font-mono font-bold text-accent block text-center">
                  {partialDerivativeResult.evaluatedValue}
                </code>
              </div>
            </div>
          )}

          {partialDerivativeResult.steps && partialDerivativeResult.steps.trim() && (
            <div className="rounded-lg border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold text-base">Pasos del Cálculo</h4>
              </div>
              <div className="bg-background/50 rounded-md p-4 border">
                <div className="text-sm space-y-2">
                  {partialDerivativeResult.steps.split('\n').filter(step => step.trim()).map((step, index) => (
                    <div key={index} className={`mb-2 ${step.startsWith('Paso') || step.startsWith('Función') ? 'font-semibold text-blue-600' : ''}`}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
