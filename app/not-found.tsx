import MissingState from "@/components/common/MissingState";
import PageScaffold from "@/components/layout/PageScaffold";
import { homePath } from "@/lib/paths";

export default function NotFound() {
  return (
    <PageScaffold>
      <MissingState
        label="Page not found"
        description="We couldn't find that section. Head back and try a different view."
        href={homePath}
      />
    </PageScaffold>
  );
}
