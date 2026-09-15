'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, LogIn, LogOut, SquareChevronLeft, SquareChevronRight, UserRound } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { AppAlertDialog } from '@community/ui-member';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import type { WorkspaceChrome } from '@/components/app/MemberShell';
import { uiCatalog } from '@/lang/catalog';
import { chromeIcon } from '@/modules/chrome-icons';
import { copyFrom, visibleChrome } from '@/modules/registry';
import { communityPath, nextJobPath } from '@/lib/people/community-path';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  showcase: 'chrome.showcase',
  closeMenu: 'chrome.close_menu',
  openMenu: 'chrome.open_menu',
  signin: 'chrome.signin',
  directory: 'chrome.directory',
  profile: 'chrome.profile',
  coord: 'chrome.coord',
  signout: 'chrome.signout',
  signoutTitle: 'chrome.signout_title',
  signoutBody: 'chrome.signout_body',
  cancel: 'chrome.cancel',
  community: 'chrome.community',
});

export function AppSidebar({ email, workspace }: { email: string | null; workspace: WorkspaceChrome }) {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
  const enabled = useEnabledModules();
  const pluginNav = visibleChrome(enabled, 'sidebar', Boolean(email));
  const { toggleSidebar, state, isMobile } = useSidebar();
  const collapsed = state === 'collapsed' && !isMobile;
  const [signOutOpen, setSignOutOpen] = useState(false);
  const slug = workspace?.current.slug;
  const isCoordinator = workspace?.current.network_role === 'coordinator';

  async function onSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pt-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={copy.openMenu} onClick={toggleSidebar}>
              {collapsed ? <SquareChevronRight /> : <SquareChevronLeft />}
              <span>{copy.closeMenu}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {workspace ? (
            workspace.seats.length > 1 ? (
              workspace.seats.map((seat) => (
                <SidebarMenuItem key={seat.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={seat.slug === slug}
                    tooltip={seat.name}
                  >
                    <Link
                      href={nextJobPath(
                        pathname,
                        seat.slug,
                        enabled,
                        seat.network_role === 'coordinator'
                      )}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-xs font-semibold">
                        {seat.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate">{seat.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={workspace.current.name}>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-xs font-semibold">
                    {workspace.current.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{workspace.current.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          ) : null}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {pluginNav.map((item) => {
                const Icon = chromeIcon(item.icon);
                const href = slug ? communityPath(slug, item.href) : item.href;
                return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(href)} tooltip={copyFrom(copy, item.copyKey)}>
                  <Link href={href}>
                    {Icon ? <Icon /> : null}
                    <span>{copyFrom(copy, item.copyKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
                );
              })}
              {email && isCoordinator ? (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.includes('/coord')} tooltip={copy.coord}>
                      <Link href={slug ? communityPath(slug, '/coord/approvals') : '/coord/approvals'}>
                        <ClipboardList />
                        <span>{copy.coord}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {email ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes('/profile')} tooltip={copy.profile}>
                  <Link href={slug ? communityPath(slug, '/profile/edit') : '/profile/edit'}>
                    <UserRound />
                    <span>{copy.profile}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={copy.signout} onClick={() => setSignOutOpen(true)}>
                  <LogOut />
                  <span>{copy.signout}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/login')} tooltip={copy.signin}>
                <Link href="/login">
                  <LogIn />
                  <span>{copy.signin}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <AppAlertDialog
        isOpen={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title={copy.signoutTitle}
        description={copy.signoutBody}
        cancelLabel={copy.cancel}
        confirmLabel={copy.signout}
        onConfirm={() => void onSignOut()}
      />
    </Sidebar>
  );
}
