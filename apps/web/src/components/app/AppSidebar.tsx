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
import { uiCatalog } from '@/lang/catalog';
import { chromeIcon } from '@/modules/chrome-icons';
import { copyFrom, visibleChrome } from '@/modules/registry';

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
});

export function AppSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
  const enabled = useEnabledModules();
  const pluginNav = visibleChrome(enabled, 'sidebar', Boolean(email));
  const { toggleSidebar, state, isMobile } = useSidebar();
  const collapsed = state === 'collapsed' && !isMobile;
  const [signOutOpen, setSignOutOpen] = useState(false);

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
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {pluginNav.map((item) => {
                const Icon = chromeIcon(item.icon);
                return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={copyFrom(copy, item.copyKey)}>
                  <Link href={item.href}>
                    {Icon ? <Icon /> : null}
                    <span>{copyFrom(copy, item.copyKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
                );
              })}
              {email ? (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/coord')} tooltip={copy.coord}>
                      <Link href="/coord/approvals">
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
                <SidebarMenuButton asChild isActive={pathname.startsWith('/profile')} tooltip={copy.profile}>
                  <Link href="/profile/edit">
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
