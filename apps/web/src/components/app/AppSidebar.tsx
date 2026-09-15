'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, IdCard, LogIn, LogOut, UserRound } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { AppAlertDialog } from '@community/ui-member';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { CommunitySwitcher } from '@/components/app/CommunitySwitcher';
import { uiCatalog } from '@/lang/catalog';
import { chromeIcon } from '@/modules/chrome-icons';
import { copyFrom, visibleChrome } from '@/modules/registry';
import { communityPath, slugFromPathname } from '@/lib/people/community-path';
import type { MyCommunity } from '@community/memberships';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  showcase: 'chrome.showcase',
  signin: 'chrome.signin',
  directory: 'chrome.directory',
  profile: 'chrome.profile',
  communityProfile: 'chrome.community_profile',
  coord: 'chrome.coord',
  signout: 'chrome.signout',
  signoutTitle: 'chrome.signout_title',
  signoutBody: 'chrome.signout_body',
  cancel: 'chrome.cancel',
  here: 'chrome.here',
});

export function AppSidebar({ email, seats }: { email: string | null; seats: MyCommunity[] }) {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
  const enabled = useEnabledModules();
  const pluginNav = visibleChrome(enabled, 'sidebar', Boolean(email));
  const [signOutOpen, setSignOutOpen] = useState(false);
  const slug = slugFromPathname(pathname);
  const current = seats.find((seat) => seat.slug === slug);
  const isCoordinator = current?.network_role === 'coordinator';
  const accountActive = pathname === '/profile' || pathname.startsWith('/profile/');
  const communityProfileHref = slug ? communityPath(slug, '/profile') : null;
  const communityProfileActive = Boolean(
    communityProfileHref && (pathname === communityProfileHref || pathname.startsWith(`${communityProfileHref}/`))
  );

  async function onSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <Sidebar collapsible="icon" className="overflow-x-hidden">
      {seats.length > 0 ? (
        <SidebarHeader>
          <CommunitySwitcher seats={seats} pathname={pathname} slug={slug} />
        </SidebarHeader>
      ) : null}
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          {seats.length > 0 ? <SidebarGroupLabel>{copy.here}</SidebarGroupLabel> : null}
          <SidebarGroupContent>
            <SidebarMenu>
              {pluginNav.map((item) => {
                const Icon = chromeIcon(item.icon);
                const href = slug ? communityPath(slug, item.href) : item.href;
                const active = Boolean(slug) && pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={copyFrom(copy, item.copyKey)}>
                      <Link href={href}>
                        {Icon ? <Icon /> : null}
                        <span className="group-data-[collapsible=icon]:hidden">{copyFrom(copy, item.copyKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {communityProfileHref ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={communityProfileActive} tooltip={copy.communityProfile}>
                    <Link href={communityProfileHref}>
                      <IdCard />
                      <span className="group-data-[collapsible=icon]:hidden">{copy.communityProfile}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
              {email && isCoordinator ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.includes('/coord')} tooltip={copy.coord}>
                    <Link href={slug ? communityPath(slug, '/coord/approvals') : '/coord/approvals'}>
                      <ClipboardList />
                      <span className="group-data-[collapsible=icon]:hidden">{copy.coord}</span>
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
                <SidebarMenuButton asChild isActive={accountActive} tooltip={copy.profile}>
                  <Link href="/profile">
                    <UserRound />
                    <span className="group-data-[collapsible=icon]:hidden">{copy.profile}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={copy.signout} onClick={() => setSignOutOpen(true)}>
                  <LogOut />
                  <span className="group-data-[collapsible=icon]:hidden">{copy.signout}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/login')} tooltip={copy.signin}>
                <Link href="/login">
                  <LogIn />
                  <span className="group-data-[collapsible=icon]:hidden">{copy.signin}</span>
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
