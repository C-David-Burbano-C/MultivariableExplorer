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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FunctionSquare, LoaderCircle, Sparkles, Lightbulb } from 'lucide-react';
import { useAppContext } from './app-context';
import { parseFunctionAction } from '@/app/actions';
import { useState } from 'react';

const FormSchema = z.object({
  userInput: z.string().min(1, 'Por favor, ingrese una función.'),
});

const EXAMPLE_FUNCTIONS = [
  { label: 'Paraboloide', value: 'z = x^2 + y^2', type: '3D' },
  { label: 'Seno & Coseno', value: 'z = sin(x) * cos(y)', type: '3D' },
  { label: 'Onda', value: 'z = sin(sqrt(x^2 + y^2))', type: '3D' },
  { label: 'Hiperbólica', value: 'z = x*y', type: '3D' },
  { label: 'Parábola', value: 'y = x^2', type: '2D' },
  { label: 'Trigonométrica', value: 'y = sin(x)', type: '2D' },
];

export function FunctionInputForm() {
  const { setFuncResult, setIsParsing, isParsing } = useAppContext();
  const { toast } = useToast();
  const [showExamples, setShowExamples] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userInput: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsParsing(true);
    setFuncResult(null);
    try {
      const result = await parseFunctionAction(data);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error de Interpretación',
          description: result.error,
        });
        setFuncResult(result);
      } else {
        setFuncResult(result);
        toast({
          title: '¡Función analizada!',
          description: `Tipo: ${result.tipo} - ${result.descripcion}`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Inesperado',
        description:
          'Ocurrió un error al procesar la función. Por favor, intente de nuevo.',
      });
    } finally {
      setIsParsing(false);
    }
  }

  const loadExample = (example: string) => {
    form.setValue('userInput', example);
    setShowExamples(false);
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="userInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Función Matemática
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: z = sin(x) * cos(y)"
                    className="resize-none font-mono text-sm min-h-[80px] focus:ring-2 focus:ring-primary/20 transition-all"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Escriba funciones 2D (y=...) o 3D (z=...)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full shadow-modern hover:shadow-modern-lg transition-all" 
            disabled={isParsing}
            size="lg"
          >
            {isParsing ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <FunctionSquare className="mr-2 h-4 w-4" />
                Analizar y Graficar
              </>
            )}
          </Button>
        </form>
      </Form>
      
      {/* Quick Examples Section */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="font-medium">Ejemplos rápidos</span>
          <span className="ml-auto text-xs">{showExamples ? '▲' : '▼'}</span>
        </button>
        
        {showExamples && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {EXAMPLE_FUNCTIONS.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example.value)}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary hover:shadow-modern"
                disabled={isParsing}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {example.label}
                    </span>
                    <span className="text-[10px] rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                      {example.type}
                    </span>
                  </div>
                  <code className="text-[10px] text-muted-foreground font-mono truncate">
                    {example.value}
                  </code>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
