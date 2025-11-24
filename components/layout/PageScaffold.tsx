import type { ReactNode } from "react";

import Breadcrumbs, { type BreadcrumbItem } from "@/components/navigation/Breadcrumbs";

type PageScaffoldProps = {
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
};

export default function PageScaffold({ breadcrumbs, children }: PageScaffoldProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      {children}
    </div>
  );
}
