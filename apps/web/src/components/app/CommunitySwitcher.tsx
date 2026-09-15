'use client';

import Link from 'next/link';
import { ChevronsUpDown, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledBySlug, useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { uiCatalog } from '@/lang/catalog';
import { nextJobPath } from '@/lib/people/community-path';
import type { MyCommunity } from '@community/memberships';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  communities: 'chrome.communities',
  more: 'chrome.more_communities',
  member: 'chrome.role_member',
  coordinator: 'chrome.role_coordinator',
});

function CommunityGlyph({ name, compact }: { name: string; compact?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground ${
        compact ? 'size-6 text-[10px]' : 'aspect-square size-8 text-sm'
      } font-semibold leading-none`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function roleLabel(seat: MyCommunity, copy: { member: string; coordinator: string }) {
  return seat.network_role === 'coordinator' ? copy.coordinator : copy.member;
}

export function CommunitySwitcher({
  seats,
  pathname,
  slug,
}: {
  seats: MyCommunity[];
  pathname: string;
  slug: string | null;
}) {
  const copy = pickContent(CONTENT, useLocale());
  const { isMobile } = useSidebar();
  const enabled = useEnabledModules();
  const enabledBySlug = useEnabledBySlug();
  const shown = seats.find((seat) => seat.slug === slug) ?? seats[0];

  if (!shown) {
    return null;
  }

  const trigger = (
    <>
      <CommunityGlyph name={shown.name} />
      <span className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-medium">{shown.name}</span>
        <span className="truncate text-xs text-muted-foreground">{roleLabel(shown, copy)}</span>
      </span>
    </>
  );

  if (seats.length === 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" tooltip={shown.name} className="pointer-events-none">
            {trigger}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={shown.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {trigger}
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel>{copy.communities}</DropdownMenuLabel>
            {seats.map((seat) => {
              const active = seat.slug === slug;
              const href = nextJobPath(
                pathname,
                seat.slug,
                enabledBySlug[seat.slug] ?? enabled,
                seat.network_role === 'coordinator'
              );
              return (
                <DropdownMenuItem key={seat.id} asChild className="gap-2 p-2">
                  <Link href={href} aria-current={active ? 'page' : undefined}>
                    <CommunityGlyph name={seat.name} compact />
                    <span className="min-w-0 flex-1 truncate">{seat.name}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link href="/">
                <span className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </span>
                <span className="font-medium text-muted-foreground">{copy.more}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
