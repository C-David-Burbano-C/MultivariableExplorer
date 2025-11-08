import { FunctionInputForm } from './function-input-form';
import { Logo } from '../icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { SidebarContent as SidebarContentArea, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '../ui/sidebar';

export function SidebarContent() {
  return (
    <SidebarContentArea>
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

        <Card className="mt-4 bg-secondary/50">
            <CardHeader className="p-4">
                <CardTitle className="text-base">Bienvenido!</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                <p>
                Ingrese una función para comenzar. Puede usar variables como x, y, z y funciones como sin(), cos(), sqrt().
                </p>
                <p className="mt-2">
                Ejemplos: <strong>sin(x^2+y^2)</strong>, <strong>x^2-y^2</strong>, <strong>y = x^2</strong>
                </p>
            </CardContent>
        </Card>
      </SidebarGroup>
    </SidebarContentArea>
  );
}
