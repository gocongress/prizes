import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ExternalLinkProps {
  href: string;
  children?: ReactNode;
  className?: string;
  iconClassName?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
}

export function ExternalLink({
  href,
  children,
  className,
  iconClassName,
  onClick,
  ariaLabel,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex w-fit items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline',
        className,
      )}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
      <ExternalLinkIcon className={cn('w-3 h-3 flex-shrink-0', iconClassName)} />
    </a>
  );
}
