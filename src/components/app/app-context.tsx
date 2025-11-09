'use client';

import type {
  DomainRangeResult,
  FunctionParseResult,
  MultipleIntegralResult,
  PartialDerivativeResult,
} from '@/lib/types';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

type AppContextType = {
  funcResult: FunctionParseResult | null;
  setFuncResult: Dispatch<SetStateAction<FunctionParseResult | null>>;
  domainRangeResult: DomainRangeResult | null;
  setDomainRangeResult: Dispatch<SetStateAction<DomainRangeResult | null>>;
  partialDerivativeResult: PartialDerivativeResult | null;
  setPartialDerivativeResult: Dispatch<SetStateAction<PartialDerivativeResult | null>>;
  multipleIntegralResult: MultipleIntegralResult | null;
  setMultipleIntegralResult: Dispatch<SetStateAction<MultipleIntegralResult | null>>;
  isParsing: boolean;
  setIsParsing: Dispatch<SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  activeMainTab: string;
  setActiveMainTab: Dispatch<SetStateAction<string>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [funcResult, setFuncResult] = useState<FunctionParseResult | null>(null);
  const [domainRangeResult, setDomainRangeResult] = useState<DomainRangeResult | null>(null);
  const [partialDerivativeResult, setPartialDerivativeResult] = useState<PartialDerivativeResult | null>(null);
  const [multipleIntegralResult, setMultipleIntegralResult] = useState<MultipleIntegralResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState('3d');
  const [activeMainTab, setActiveMainTab] = useState('tools');

  const value = {
    funcResult,
    setFuncResult,
    domainRangeResult,
    setDomainRangeResult,
    partialDerivativeResult,
    setPartialDerivativeResult,
    multipleIntegralResult,
    setMultipleIntegralResult,
    isParsing,
    setIsParsing,
    activeTab,
    setActiveTab,
    activeMainTab,
    setActiveMainTab,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
