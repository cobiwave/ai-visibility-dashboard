'use client';

import type { ComponentProps } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/lib/cn';

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  /** `prefix` keeps "Prompts" active on /prompts/[id] too. */
  match?: 'exact' | 'prefix';
}

/** A client leaf only because the active state needs the current path. */
export function NavLink({ href, match = 'exact', className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = match === 'exact' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'block rounded-md px-3 py-2 text-sm font-medium',
        isActive ? 'bg-surface-3 text-text-primary' : 'text-text-muted hover:text-text-primary',
        className,
      )}
      href={href}
      {...props}
    />
  );
}
