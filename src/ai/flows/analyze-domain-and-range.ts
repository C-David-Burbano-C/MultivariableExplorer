// src/ai/flows/analyze-domain-and-range.ts
'use server';
/**
 * @fileOverview Analyzes the domain and range of a mathematical function.
 *
 * - analyzeDomainAndRange - A function that analyzes the domain and range of a given mathematical function.
 * - AnalyzeDomainAndRangeInput - The input type for the analyzeDomainAndRange function.
 * - AnalyzeDomainAndRangeOutput - The return type for the analyzeDomainAndRange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDomainAndRangeInputSchema = z.object({
  functionString: z
    .string()
    .describe('The mathematical function to analyze, as a string.'),
});
export type AnalyzeDomainAndRangeInput = z.infer<typeof AnalyzeDomainAndRangeInputSchema>;

const AnalyzeDomainAndRangeOutputSchema = z.object({
  domain: z
    .string()
    .describe('The domain of the function, described in mathematical notation.'),
  range: z
    .string()
    .describe('The range of the function, described in mathematical notation.'),
  assumptions: z
    .string()
    .optional()
    .describe(
      'Any assumptions made during the domain and range analysis, such as the function being real-valued.'
    ),
});
export type AnalyzeDomainAndRangeOutput = z.infer<typeof AnalyzeDomainAndRangeOutputSchema>;

export async function analyzeDomainAndRange(
  input: AnalyzeDomainAndRangeInput
): Promise<AnalyzeDomainAndRangeOutput> {
  return analyzeDomainAndRangeFlow(input);
}

const analyzeDomainAndRangePrompt = ai.definePrompt({
  name: 'analyzeDomainAndRangePrompt',
  input: {schema: AnalyzeDomainAndRangeInputSchema},
  output: {schema: AnalyzeDomainAndRangeOutputSchema},
  prompt: `You are a mathematical expert. Given the function, determine its domain and range.

Function: {{{functionString}}}

Output the domain, range, and any assumptions made. Be as accurate as possible, and describe the domain and range using proper mathematical notation with Unicode symbols.

Use these Unicode mathematical symbols:
- ∈ for "element of" (not "element_of")
- ℝ for "real numbers" (not "R")
- ℕ for "natural numbers"
- ℤ for "integers"  
- ℚ for "rational numbers"
- ℂ for "complex numbers"
- ∞ for "infinity"
- ≤ for "less than or equal"
- ≥ for "greater than or equal"
- ≠ for "not equal"
- ⊂ for "subset"
- ⊆ for "subset or equal"
- ∪ for "union"
- ∩ for "intersection"

Examples of correct notation:
- Domain: { (x, y) | x ∈ ℝ, y ∈ ℝ }
- Range: [0, ∞)
- Domain: x ∈ ℝ, x ≠ 0

If you are unable to determine the domain and range, explain why.
`,
});

const analyzeDomainAndRangeFlow = ai.defineFlow(
  {
    name: 'analyzeDomainAndRangeFlow',
    inputSchema: AnalyzeDomainAndRangeInputSchema,
    outputSchema: AnalyzeDomainAndRangeOutputSchema,
  },
  async input => {
    const {output} = await analyzeDomainAndRangePrompt(input);
    return output!;
  }
);
