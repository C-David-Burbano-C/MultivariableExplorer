import { AppProvider } from '@/components/app/app-context';
import { MainLayout } from '@/components/app/main-layout';

export default function Home() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
