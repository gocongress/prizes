import { BreadcrumbContext, type BreadcrumbItem } from '@/contexts/breadcrumb';
import { useCallback, useContext } from 'react';

/**
 * React hook that provides breadcrumb management
 *
 * @returns Breadcrumb items and setter function
 *
 * @example
 * ```tsx
 * // In a child component, set breadcrumbs
 * const { setBreadcrumbs } = useBreadcrumb();
 *
 * useEffect(() => {
 *   setBreadcrumbs([
 *     { title: 'Home', href: '/' },
 *     { title: 'Dashboard', href: '/dashboard' },
 *     { title: 'Settings', href: '/dashboard/settings' }
 *   ]);
 * }, [setBreadcrumbs]);
 *
 * // In the layout, consume breadcrumbs
 * const { breadcrumbs } = useBreadcrumb();
 *
 * return (
 *   <Breadcrumb>
 *     <BreadcrumbList>
 *       {breadcrumbs.map((item, index) => (
 *         <React.Fragment key={item.href}>
 *           <BreadcrumbItem>
 *             {index === breadcrumbs.length - 1 ? (
 *               <BreadcrumbPage>{item.title}</BreadcrumbPage>
 *             ) : (
 *               <BreadcrumbLink href={item.href}>
 *                 {item.title}
 *               </BreadcrumbLink>
 *             )}
 *           </BreadcrumbItem>
 *           {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
 *         </React.Fragment>
 *       ))}
 *     </BreadcrumbList>
 *   </Breadcrumb>
 * );
 * ```
 */
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);

  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }

  const { breadcrumbs, setBreadcrumbs: setContextBreadcrumbs } = context;

  // Memoize the setter to prevent unnecessary re-renders
  const setBreadcrumbs = useCallback(
    (items: BreadcrumbItem[]) => {
      setContextBreadcrumbs(items);
    },
    [setContextBreadcrumbs],
  );

  // Add a single breadcrumb item to the existing list
  const addBreadcrumb = useCallback(
    (item: BreadcrumbItem) => {
      setContextBreadcrumbs([...breadcrumbs, item]);
    },
    [setContextBreadcrumbs, breadcrumbs],
  );

  return {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
  };
};
