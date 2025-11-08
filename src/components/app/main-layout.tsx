'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
  SidebarContent as SidebarContentArea,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/app/sidebar-content';
import { MainPanel } from '@/components/app/main-panel';
import { Logo } from '@/components/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '../ui/button';
import { PanelLeft } from 'lucide-react';

export function MainLayout() {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar className="flex flex-col">
        <SidebarHeader />
        <SidebarContentArea>
          <AppSidebarContent />
        </SidebarContentArea>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Logo className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-xl font-semibold">
              Multivariable Explorer
            </h1>
          </div>
        </header>
        <MainPanel />
      </SidebarInset>
    </SidebarProvider>
  );
}
