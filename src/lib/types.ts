import type {
  AnalyzeDomainAndRangeOutput,
  CalculateMultipleIntegralOutput,
  CalculatePartialDerivativeOutput,
  ParseAndNormalizeFunctionOutput,
} from '@/app/actions';

export type FunctionParseResult = ParseAndNormalizeFunctionOutput;

export type ParsedFunction = Exclude<FunctionParseResult, { error: string }>;

export type DomainRangeResult = AnalyzeDomainAndRangeOutput;
export type PartialDerivativeResult = CalculatePartialDerivativeOutput;
export type MultipleIntegralResult = CalculateMultipleIntegralOutput;
