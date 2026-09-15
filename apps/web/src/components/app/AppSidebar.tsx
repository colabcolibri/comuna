'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, LayoutGrid, LogIn, LogOut, SquareChevronLeft, SquareChevronRight, UserRound, Users } from 'lucide-react';
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
import { pickContent } from '@community/identity';
import { AppAlertDialog } from '@community/ui-member';
import { useLocale } from '@/components/app/LocaleProvider';

const CONTENT = {
  'pt-BR': {
    showcase: 'Vitrine',
    closeMenu: 'Fechar menu',
    openMenu: 'Abrir menu',
    signin: 'Entrar',
    directory: 'Diretório',
    profile: 'Meu perfil',
    coord: 'Pedidos',
    signout: 'Sair',
    signoutTitle: 'Sair da sessão?',
    signoutBody: 'Você vai precisar de um código no e-mail para entrar de novo.',
    cancel: 'Cancelar',
  },
  en: {
    showcase: 'Showcase',
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
    signin: 'Sign in',
    directory: 'Directory',
    profile: 'My profile',
    coord: 'Requests',
    signout: 'Sign out',
    signoutTitle: 'Leave this session?',
    signoutBody: 'You will need an email code to sign in again.',
    cancel: 'Cancel',
  },
} as const;

export function AppSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/showcase')} tooltip={copy.showcase}>
                  <Link href="/showcase">
                    <LayoutGrid />
                    <span>{copy.showcase}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {email ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/directory')} tooltip={copy.directory}>
                      <Link href="/directory">
                        <Users />
                        <span>{copy.directory}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/coord')} tooltip={copy.coord}>
                      <Link href="/coord/approvals">
                        <ClipboardList />
                        <span>{copy.coord}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
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
