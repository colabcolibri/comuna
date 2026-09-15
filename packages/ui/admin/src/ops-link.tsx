import { forwardRef, type ComponentType, type ReactNode } from 'react';

export type OpsLinkProps = {
  href: string;
  children?: ReactNode;
  className?: string;
  'aria-label'?: string;
};

export type OpsLinkComponent = ComponentType<OpsLinkProps>;

export const DefaultOpsLink = forwardRef<HTMLAnchorElement, OpsLinkProps>(function DefaultOpsLink(
  { href, children, className, ...rest },
  ref
) {
  return (
    <a ref={ref} href={href} className={className} {...rest}>
      {children}
    </a>
  );
});
