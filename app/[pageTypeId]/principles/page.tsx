import { notFound } from "next/navigation";

import PageScaffold from "@/components/layout/PageScaffold";
import { type BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import PrincipleListSection from "@/components/principles/PrincipleListSection";
import { getPageTypeById, pageTypes } from "@/lib/data";
import { homePath } from "@/lib/paths";

type PrincipleListPageProps = {
  params: Promise<{ pageTypeId: string }>;
};

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return pageTypes.map(({ id }) => ({ pageTypeId: id }));
}

export default async function PrincipleListPage({ params }: PrincipleListPageProps) {
  const { pageTypeId } = await params;
  const pageType = getPageTypeById(pageTypeId);
  if (!pageType) notFound();

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: homePath },
    { id: `page-type-${pageType.id}`, label: <PeopleAwareText text={pageType.title} /> },
    { id: "section-principles", label: "Principles", isCurrent: true },
  ];

  return (
    <PageScaffold breadcrumbs={breadcrumbs}>
      <PrincipleListSection pageType={pageType} />
    </PageScaffold>
  );
}
