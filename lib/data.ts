import vocabData from "@/data/vocab.json";

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

export const bucketMap = new Map(buckets.map((bucket) => [bucket.id, bucket]));

export function getBucketById(bucketId: string | null | undefined) {
  if (!bucketId) return undefined;
  return bucketMap.get(bucketId);
}

export function getTermById(termId: string | null | undefined) {
  if (!termId) return undefined;
  return allTerms.find((term) => term.id === termId);
}
