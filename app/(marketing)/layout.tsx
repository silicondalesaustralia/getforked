import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteSearchBar } from "@/components/layout/site-search-bar";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <SiteHeader />
      <SiteSearchBar />
      <main className="public-content flex-1 pb-10">{children}</main>
      <SiteFooter />
    </>
  );
}
