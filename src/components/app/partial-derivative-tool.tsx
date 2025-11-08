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
import { LoaderCircle } from 'lucide-react';
import { useAppContext } from './app-context';
import { calculatePartialDerivativeAction } from '@/app/actions';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
        // Expects format like "x=1, y=2"
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
    <div className="space-y-4 p-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="variable"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Derivar con respecto a:</FormLabel>
                    <FormControl>
                    <Input placeholder="x" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="point"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Evaluar en el punto (opcional)</FormLabel>
                    <FormControl>
                    <Input placeholder="x=1, y=2" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Formato: var1=num1, var2=num2</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Calcular Derivada Parcial
          </Button>
        </form>
      </Form>
      {partialDerivativeResult && (
        <Card className="mt-4 bg-background">
          <CardHeader>
            <CardTitle className="text-lg">Resultado de la Derivada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
                La derivada parcial con respecto a <strong>{form.getValues('variable')}</strong> es:
            </p>
            <code className="block w-full p-3 rounded-md bg-secondary font-mono text-sm">
              {partialDerivativeResult.derivative}
            </code>
            {partialDerivativeResult.evaluatedValue !== undefined && partialDerivativeResult.evaluatedValue !== null && (
                 <div>
                    <p className="text-sm mt-2">Evaluada en el punto es:</p>
                    <code className="block w-full p-3 rounded-md bg-secondary font-mono text-sm">
                      {partialDerivativeResult.evaluatedValue}
                    </code>
                 </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
