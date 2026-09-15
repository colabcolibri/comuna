'use client';

import type { ReactNode } from 'react';
import { DefaultOpsLink, type OpsLinkComponent } from './ops-link';
import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@community/ui';

export type OpsNavItem = {
  href: string;
  label: string;
  active?: boolean;
};

export type OpsNavGroup = {
  label?: string;
  items: OpsNavItem[];
};

export function OpsShell({
  brand,
  groups,
  linkComponent: Link = DefaultOpsLink,
  signOutLabel,
  menuLabel,
  localeSlot,
  themeSlot,
  onSignOut,
  children,
}: {
  brand: string;
  groups: OpsNavGroup[];
  linkComponent?: OpsLinkComponent;
  signOutLabel: string;
  menuLabel: string;
  localeSlot?: ReactNode;
  themeSlot?: ReactNode;
  onSignOut: () => void;
  children: ReactNode;
}) {
  return (
    <SidebarProvider className="h-svh min-h-svh overflow-hidden">
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3">
          <p className="px-2 text-sm font-semibold leading-none tracking-tight">{brand}</p>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((group) => (
            <SidebarGroup key={group.label || group.items[0]?.href} className="px-2 py-3">
              {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={Boolean(item.active)}>
                        <Link href={item.href}>
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-h-0 overflow-hidden bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
          <SidebarTrigger className="size-9 md:hidden" aria-label={menuLabel} />
          <div className="ml-auto flex h-9 min-w-0 items-center gap-2">
            {localeSlot}
            {themeSlot}
            <Button type="button" onClick={onSignOut}>
              {signOutLabel}
            </Button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
