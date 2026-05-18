import { MarketingHeader } from '@/components/layout/marketing-header';
import { MarketingFooter } from '@/components/layout/marketing-footer';
import { EngineeredGrid } from '@/components/marketing/engineered-grid';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <EngineeredGrid variant="lines" density="lg" fade="all" className="fixed inset-0" />
      <MarketingHeader />
      <main className="relative flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
