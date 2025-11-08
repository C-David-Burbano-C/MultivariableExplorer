'use server';

/**
 * @fileOverview Parses and normalizes a user-provided mathematical function into a JavaScript expression.
 *
 * - parseAndNormalizeFunction - A function that handles the parsing and normalization process.
 * - ParseAndNormalizeFunctionInput - The input type for the parseAndNormalizeFunction function.
 * - ParseAndNormalizeFunctionOutput - The return type for the parseAndNormalizeFunction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseAndNormalizeFunctionInputSchema = z.object({
  userInput: z.string().describe('The mathematical function entered by the user.'),
});

export type ParseAndNormalizeFunctionInput = z.infer<typeof ParseAndNormalizeFunctionInputSchema>;

const ParseAndNormalizeFunctionOutputSchema = z.object({
  tipo: z.enum(['2D', '3D']).describe('The dimension of the function (2D or 3D).'),
  expresionOriginal: z.string().describe('The original user input.'),
  expresionNormalizada: z.string().describe('The normalized JavaScript expression.'),
  funcionJS: z.string().describe('The JavaScript function representation.'),
  descripcion: z.string().describe('A brief description of the surface or curve.'),
}).or(z.object({
  error: z.string().describe('Error message if the input is invalid.'),
}));

export type ParseAndNormalizeFunctionOutput = z.infer<typeof ParseAndNormalizeFunctionOutputSchema>;

export async function parseAndNormalizeFunction(input: ParseAndNormalizeFunctionInput): Promise<ParseAndNormalizeFunctionOutput> {
  return parseAndNormalizeFunctionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseAndNormalizePrompt',
  input: {schema: ParseAndNormalizeFunctionInputSchema},
  output: {schema: ParseAndNormalizeFunctionOutputSchema},
  prompt: `Eres un asistente matemático especializado en interpretar funciones escritas por el usuario y convertirlas en código JavaScript graficable. 

Tu tarea:
1. Detecta automáticamente si la función es 2D o 3D:
   - 2D si solo contiene la variable x o f(x) o y = ...
   - 3D si contiene z o una ecuación con x, y y z.

2. Interpreta cualquier forma de entrada escrita por el usuario, por ejemplo:
   - y = x^2 + 3x + 2
   - f(x)=sin(x)
   - z = x^2 + y^2
   - x^2 + y^2 + z^2 = 9
   - sen(x)*cos(y)
   - (x^2 + y^2 - 1)^3 - x^2*y^3 = 0

3. Normaliza la función reemplazando:
   - ^ → ** 
   - sen → Math.sin
   - sin → Math.sin
   - cos → Math.cos
   - tan → Math.tan
   - sqrt → Math.sqrt
   - e → Math.E
   - pi → Math.PI
   - = → == (solo si es una ecuación)
   - Elimina espacios extra

4. Devuelve una salida en formato JSON con esta estructura:

{
  "tipo": "2D" o "3D",
  "expresionOriginal": "texto ingresado por el usuario",
  "expresionNormalizada": "versión lista para evaluar en JavaScript",
  "funcionJS": "function(x, y, z){ return ... }",
  "descripcion": "Explicación breve de qué tipo de superficie o curva es"
}

5. Si es una ecuación con “==”, genera la forma equivalente a cero, por ejemplo:
   - Entrada: \"x^2 + y^2 = 9\"
   - Salida: \"return (x**2 + y**2 - 9);\"

6. Si el usuario escribe algo inválido, responde con:
   {
     "error": "No se reconoce una función o ecuación válida."
   }

Usa solo funciones válidas del objeto Math de JavaScript.

El texto ingresado por el usuario es: {{{userInput}}}
`,
});

const parseAndNormalizeFunctionFlow = ai.defineFlow(
  {
    name: 'parseAndNormalizeFunctionFlow',
    inputSchema: ParseAndNormalizeFunctionInputSchema,
    outputSchema: ParseAndNormalizeFunctionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
