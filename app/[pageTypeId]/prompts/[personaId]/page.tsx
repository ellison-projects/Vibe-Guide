import { notFound } from "next/navigation";

import PageScaffold from "@/components/layout/PageScaffold";
import { type BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import PromptDetailSection from "@/components/prompts/PromptDetailSection";
import { getPageTypeById, getPersonaById, pageTypes } from "@/lib/data";
import { homePath, promptListPath } from "@/lib/paths";

type PromptDetailPageProps = {
  params: { pageTypeId: string; personaId: string };
};

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return pageTypes.flatMap((pageType) =>
    pageType.prompts.map((persona) => ({
      pageTypeId: pageType.id,
      personaId: persona.id,
    })),
  );
}

export default function PromptDetailPage({ params }: PromptDetailPageProps) {
  const pageType = getPageTypeById(params.pageTypeId);
  if (!pageType) notFound();

  const persona = getPersonaById(pageType.id, params.personaId);
  if (!persona) notFound();

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: homePath },
    { id: `page-type-${pageType.id}`, label: <PeopleAwareText text={pageType.title} /> },
    {
      id: "section-prompts",
      label: "AI Prompts",
      href: promptListPath(pageType.id),
    },
    {
      id: `persona-${persona.id}`,
      label: <PeopleAwareText text={persona.name} />,
      isCurrent: true,
    },
  ];

  return (
    <PageScaffold breadcrumbs={breadcrumbs}>
      <PromptDetailSection pageType={pageType} persona={persona} />
    </PageScaffold>
  );
}
