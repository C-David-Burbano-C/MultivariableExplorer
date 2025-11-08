'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { DomainRangeTool } from './domain-range-tool';
import { PartialDerivativeTool } from './partial-derivative-tool';
import { MultipleIntegralTool } from './multiple-integral-tool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function CalculusToolsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Herramientas de Cálculo</CardTitle>
        <CardDescription>
          Explore propiedades de su función utilizando las siguientes herramientas de análisis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="domain-range">
            <AccordionTrigger>Análisis de Dominio y Rango</AccordionTrigger>
            <AccordionContent>
              <DomainRangeTool />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="partial-derivative">
            <AccordionTrigger>Derivadas Parciales y Gradiente</AccordionTrigger>
            <AccordionContent>
              <PartialDerivativeTool />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="multiple-integral">
            <AccordionTrigger>Integrales Múltiples</AccordionTrigger>
            <AccordionContent>
              <MultipleIntegralTool />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
