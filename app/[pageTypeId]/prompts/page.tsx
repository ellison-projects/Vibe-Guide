import { notFound } from "next/navigation";

import PageScaffold from "@/components/layout/PageScaffold";
import { type BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import PromptListSection from "@/components/prompts/PromptListSection";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import { getPageTypeById, pageTypes } from "@/lib/data";
import { homePath } from "@/lib/paths";

type PromptListPageProps = {
  params: Promise<{ pageTypeId: string }>;
};

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return pageTypes.map(({ id }) => ({ pageTypeId: id }));
}

export default async function PromptListPage({ params }: PromptListPageProps) {
  const { pageTypeId } = await params;
  const pageType = getPageTypeById(pageTypeId);
  if (!pageType) notFound();

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: homePath },
    { id: `page-type-${pageType.id}`, label: <PeopleAwareText text={pageType.title} /> },
    { id: "section-prompts", label: "AI Prompts", isCurrent: true },
  ];

  return (
    <PageScaffold breadcrumbs={breadcrumbs}>
      <PromptListSection pageType={pageType} />
    </PageScaffold>
  );
}
