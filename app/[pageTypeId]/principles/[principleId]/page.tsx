import { notFound } from "next/navigation";

import PageScaffold from "@/components/layout/PageScaffold";
import { type BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import PrincipleDetailSection from "@/components/principles/PrincipleDetailSection";
import { getPageTypeById, getPrincipleById, pageTypes } from "@/lib/data";
import { homePath, principleListPath } from "@/lib/paths";

type PrincipleDetailPageProps = {
  params: { pageTypeId: string; principleId: string };
};

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return pageTypes.flatMap((pageType) =>
    (pageType.principles ?? []).map((principle) => ({
      pageTypeId: pageType.id,
      principleId: principle.id,
    })),
  );
}

export default function PrincipleDetailPage({ params }: PrincipleDetailPageProps) {
  const pageType = getPageTypeById(params.pageTypeId);
  if (!pageType) notFound();

  const principle = getPrincipleById(pageType.id, params.principleId);
  if (!principle) notFound();

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: homePath },
    { id: `page-type-${pageType.id}`, label: <PeopleAwareText text={pageType.title} /> },
    {
      id: "section-principles",
      label: "Principles",
      href: principleListPath(pageType.id),
    },
    {
      id: `principle-${principle.id}`,
      label: <PeopleAwareText text={principle.title} />,
      isCurrent: true,
    },
  ];

  return (
    <PageScaffold breadcrumbs={breadcrumbs}>
      <PrincipleDetailSection pageType={pageType} principle={principle} />
    </PageScaffold>
  );
}
