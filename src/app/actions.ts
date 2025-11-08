'use server';

import {
  analyzeDomainAndRange,
  AnalyzeDomainAndRangeInput,
  AnalyzeDomainAndRangeOutput,
} from '@/ai/flows/analyze-domain-and-range';
import {
  calculateMultipleIntegral,
  CalculateMultipleIntegralInput,
  CalculateMultipleIntegralOutput,
} from '@/ai/flows/calculate-multiple-integral';
import {
  calculatePartialDerivative,
  CalculatePartialDerivativeInput,
  CalculatePartialDerivativeOutput,
} from '@/ai/flows/calculate-partial-derivative';
import {
  parseAndNormalizeFunction,
  ParseAndNormalizeFunctionInput,
  ParseAndNormalizeFunctionOutput,
} from '@/ai/flows/parse-and-normalize-function';

export type {
  AnalyzeDomainAndRangeOutput,
  CalculateMultipleIntegralOutput,
  CalculatePartialDerivativeOutput,
  ParseAndNormalizeFunctionOutput,
};

export async function parseFunctionAction(
  input: ParseAndNormalizeFunctionInput
): Promise<ParseAndNormalizeFunctionOutput> {
  return await parseAndNormalizeFunction(input);
}

export async function analyzeDomainAndRangeAction(
  input: AnalyzeDomainAndRangeInput
): Promise<AnalyzeDomainAndRangeOutput> {
  return await analyzeDomainAndRange(input);
}

export async function calculatePartialDerivativeAction(
  input: CalculatePartialDerivativeInput
): Promise<CalculatePartialDerivativeOutput> {
  return await calculatePartialDerivative(input);
}

export async function calculateMultipleIntegralAction(
  input: CalculateMultipleIntegralInput
): Promise<CalculateMultipleIntegralOutput> {
  return await calculateMultipleIntegral(input);
}
