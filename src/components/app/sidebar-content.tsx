import { FunctionInputForm } from './function-input-form';
import { RequirementsCompliance } from './requirements-compliance';
import { Logo } from '../icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { SidebarGroup, SidebarGroupContent } from '../ui/sidebar';

export function AppSidebarContent() {
  return (
    <SidebarGroup>
        <div className="flex items-center gap-3 p-2">
           <Logo className="h-8 w-8 text-primary" />
           <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold">Multivariable Explorer</h2>
              <p className="text-sm text-muted-foreground">Calculus Playground</p>
           </div>
        </div>

      <SidebarGroupContent className="p-2">
         <FunctionInputForm />
      </SidebarGroupContent>

      <div className="mt-4">
        <RequirementsCompliance />
      </div>
    </SidebarGroup>
  );
}
