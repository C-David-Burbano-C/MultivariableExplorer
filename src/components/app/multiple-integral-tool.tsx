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
import { calculateMultipleIntegralAction } from '@/app/actions';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

const FormSchema = z.object({
  integrationRegion: z.string().min(1, 'Se requiere una región.'),
  variableOrder: z.string().min(1, 'Se requiere un orden de variables.'),
});

export function MultipleIntegralTool() {
  const { funcResult, multipleIntegralResult, setMultipleIntegralResult } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { integrationRegion: '0 < x < 1, 0 < y < 1', variableOrder: 'x, y' },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!funcResult || 'error' in funcResult) {
      toast({
        variant: 'destructive',
        title: 'Función no válida',
        description: 'Por favor, primero ingrese y analice una función válida.',
      });
      return;
    }

    setIsLoading(true);
    setMultipleIntegralResult(null);

    try {
      const result = await calculateMultipleIntegralAction({
        functionString: funcResult.expresionNormalizada,
        integrationRegion: data.integrationRegion,
        variableOrder: data.variableOrder,
      });

      if (isNaN(result.result)) {
        toast({ variant: 'destructive', title: 'Error de Cálculo', description: "No se pudo computar la integral." });
      }
      setMultipleIntegralResult(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de Cálculo',
        description: 'No se pudo calcular la integral múltiple.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="integrationRegion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Región de Integración</FormLabel>
                <FormControl>
                  <Textarea placeholder="0 < x < 1, 0 < y < 1-x" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Defina los límites para cada variable.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="variableOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden de Integración</FormLabel>
                <FormControl>
                  <Input placeholder="dy, dx" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Variables separadas por comas, ej: dy, dx.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Calcular Integral
          </Button>
        </form>
      </Form>
      {multipleIntegralResult && (
        <Card className="mt-4 bg-background">
          <CardHeader>
            <CardTitle className="text-lg">Resultado de la Integral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <h4 className="font-semibold">Resultado:</h4>
                <code className="block w-full p-3 rounded-md bg-secondary font-mono text-3xl">
                  {isNaN(multipleIntegralResult.result) ? 'No computable' : multipleIntegralResult.result.toFixed(4)}
                </code>
             </div>
             <div>
                <h4 className="font-semibold">Pasos:</h4>
                <div className="text-sm p-3 bg-secondary rounded-md whitespace-pre-wrap">
                    {multipleIntegralResult.steps}
                </div>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
