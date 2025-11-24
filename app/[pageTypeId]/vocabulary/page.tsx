import { notFound } from "next/navigation";

import PageScaffold from "@/components/layout/PageScaffold";
import { type BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import VocabularyListSection from "@/components/vocabulary/VocabularyListSection";
import { getPageTypeById, getTermsByBucketId, pageTypes } from "@/lib/data";
import { homePath } from "@/lib/paths";

type VocabularyListPageProps = {
  params: Promise<{ pageTypeId: string }>;
};

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return pageTypes.map(({ id }) => ({ pageTypeId: id }));
}

export default async function VocabularyListPage({ params }: VocabularyListPageProps) {
  const { pageTypeId } = await params;
  const pageType = getPageTypeById(pageTypeId);
  if (!pageType) notFound();

  const terms = getTermsByBucketId(pageType.vocabularyBucketId);

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: homePath },
    { id: `page-type-${pageType.id}`, label: <PeopleAwareText text={pageType.title} /> },
    { id: "section-vocab", label: "Vocabulary", isCurrent: true },
  ];

  return (
    <PageScaffold breadcrumbs={breadcrumbs}>
      <VocabularyListSection pageType={pageType} terms={terms} />
    </PageScaffold>
  );
}
