'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FunctionSquare, LoaderCircle } from 'lucide-react';
import { useAppContext } from './app-context';
import { parseFunctionAction } from '@/app/actions';

const FormSchema = z.object({
  userInput: z.string().min(1, 'Por favor, ingrese una función.'),
});

export function FunctionInputForm() {
  const { setFuncResult, setIsParsing, isParsing } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userInput: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsParsing(true);
    setFuncResult(null); // Clear previous results
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Función f(x, y, z)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: sin(x) * cos(y)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isParsing}>
          {isParsing ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <FunctionSquare />
          )}
          Analizar y Graficar
        </Button>
      </form>
    </Form>
  );
}
