import { createContext, type ReactNode, useState } from 'react';

export interface BreadcrumbItem {
  title: string;
  href: string;
}

interface BreadcrumbContextValue {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined);

/**
 * Provider component for breadcrumb context
 * Wrap your app or layout with this provider to enable breadcrumb functionality
 */
export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}
