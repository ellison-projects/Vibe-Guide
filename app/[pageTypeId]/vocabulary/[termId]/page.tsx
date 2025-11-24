import { notFound } from "next/navigation";

import PageScaffold from "@/components/layout/PageScaffold";
import { type BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import VocabularyDetailSection from "@/components/vocabulary/VocabularyDetailSection";
import {
  getPageTypeById,
  getTermInBucket,
  getTermsByBucketId,
  pageTypes,
} from "@/lib/data";
import { homePath, vocabularyListPath } from "@/lib/paths";

type VocabularyDetailPageProps = {
  params: Promise<{ pageTypeId: string; termId: string }>;
};

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return pageTypes.flatMap((pageType) =>
    getTermsByBucketId(pageType.vocabularyBucketId).map((term) => ({
      pageTypeId: pageType.id,
      termId: term.id,
    })),
  );
}

export default async function VocabularyDetailPage({ params }: VocabularyDetailPageProps) {
  const { pageTypeId, termId } = await params;
  const pageType = getPageTypeById(pageTypeId);
  if (!pageType) notFound();

  const term = getTermInBucket(pageType.vocabularyBucketId, termId);
  if (!term) notFound();

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: homePath },
    { id: `page-type-${pageType.id}`, label: <PeopleAwareText text={pageType.title} /> },
    {
      id: "section-vocab",
      label: "Vocabulary",
      href: vocabularyListPath(pageType.id),
    },
    {
      id: `term-${term.id}`,
      label: <PeopleAwareText text={term.title} />,
      isCurrent: true,
    },
  ];

  return (
    <PageScaffold breadcrumbs={breadcrumbs}>
      <VocabularyDetailSection pageTypeId={pageType.id} term={term} />
    </PageScaffold>
  );
}
