export const homePath = "/";

export const promptListPath = (pageTypeId: string) => `/${pageTypeId}/prompts`;
export const promptDetailPath = (pageTypeId: string, personaId: string) =>
  `${promptListPath(pageTypeId)}/${personaId}`;

export const vocabularyListPath = (pageTypeId: string) => `/${pageTypeId}/vocabulary`;
export const vocabDetailPath = (pageTypeId: string, termId: string) =>
  `${vocabularyListPath(pageTypeId)}/${termId}`;

export const principleListPath = (pageTypeId: string) => `/${pageTypeId}/principles`;
export const principleDetailPath = (pageTypeId: string, principleId: string) =>
  `${principleListPath(pageTypeId)}/${principleId}`;
