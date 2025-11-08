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
import { Sparkles } from 'lucide-react';

export function MainLayout() {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar className="flex flex-col border-r">
        <SidebarHeader />
        <SidebarContentArea>
          <AppSidebarContent />
        </SidebarContentArea>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b glass px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden -ml-2" />
            <div className="flex items-center gap-2">
              <div className="relative">
                <Logo className="h-7 w-7 text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse" />
              </div>
              <h1 className="font-semibold text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Multivariable Explorer
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>AI Powered</span>
            </div>
          </div>
        </header>
        <MainPanel />
      </SidebarInset>
    </SidebarProvider>
  );
}
