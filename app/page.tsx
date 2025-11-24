import HomeScreen from "@/components/home/HomeScreen";
import PageScaffold from "@/components/layout/PageScaffold";
import { pageTypes } from "@/lib/data";

export const dynamic = "force-static";
export const revalidate = false;

export default function HomePage() {
  return (
    <PageScaffold>
      <HomeScreen pageTypes={pageTypes} />
    </PageScaffold>
  );
}
