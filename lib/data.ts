import vocabData from "@/data/vocab.json";
import pageTypesData from "@/data/page-types.json";

export type VocabularyTerm = {
  id: string;
  title: string;
  shortDescription: string;
  definition: string;
  whenToUse: string;
  aiPhrases: string[];
  examples?: string[];
};

export type VocabularyBucket = {
  id: string;
  title: string;
  description: string;
  terms: VocabularyTerm[];
};

type VocabularyData = {
  buckets: VocabularyBucket[];
};

const data = vocabData as VocabularyData;

export const buckets = data.buckets;

export type TermWithBucket = VocabularyTerm & {
  bucketId: string;
  bucketTitle: string;
};

export const allTerms: TermWithBucket[] = buckets.flatMap((bucket) =>
  bucket.terms.map((term) => ({
    ...term,
    bucketId: bucket.id,
    bucketTitle: bucket.title,
  })),
);

export type PersonaStyle = {
  id: string;
  name: string;
  shortDescription: string;
  prompt: string;
};

export type Principle = {
  id: string;
  title: string;
  definition: string;
  whyItMatters: string;
  example: string;
};

export type PageType = {
  id: string;
  title: string;
  description: string;
  prompts: PersonaStyle[];
  principles: Principle[];
  vocabularyBucketId: string;
};

type PageTypesData = {
  pageTypes: PageType[];
};

const pageTypeData = pageTypesData as PageTypesData;

export const pageTypes = pageTypeData.pageTypes;

const pageTypeMap = new Map(pageTypes.map((pageType) => [pageType.id, pageType]));

export function getPageTypeById(pageTypeId: string | null | undefined) {
  if (!pageTypeId) return undefined;
  return pageTypeMap.get(pageTypeId);
}

export function getPersonaById(
  pageTypeId: string | null | undefined,
  personaId: string | null | undefined,
) {
  if (!pageTypeId || !personaId) return undefined;
  const pageType = getPageTypeById(pageTypeId);
  return pageType?.prompts.find((prompt) => prompt.id === personaId);
}

export function getPrincipleById(
  pageTypeId: string | null | undefined,
  principleId: string | null | undefined,
) {
  if (!pageTypeId || !principleId) return undefined;
  const pageType = getPageTypeById(pageTypeId);
  return pageType?.principles.find((principle) => principle.id === principleId);
}

export function getTermsByBucketId(bucketId: string | null | undefined): TermWithBucket[] {
  if (!bucketId) return [];
  return allTerms.filter((term) => term.bucketId === bucketId);
}

export function getTermInBucket(
  bucketId: string | null | undefined,
  termId: string | null | undefined,
): TermWithBucket | undefined {
  if (!bucketId || !termId) return undefined;
  return getTermsByBucketId(bucketId).find((term) => term.id === termId);
}
