"use client";

import { useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon, DashboardSquare01Icon, HelpCircleIcon, KanbanIcon, Menu01Icon, Settings02Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";
import { Drawer, IconButton, NavItem } from "sherick-ui";
import "./sidebar.css";

function SidebarLinks({
  currentPath, basePath, onNavigate,
}: { currentPath: string; basePath: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="sidebar-links">
      <div className="sidebar-destinations">
        <NavItem href={`${basePath}/overview`} icon={<HugeiconsIcon icon={DashboardSquare01Icon} aria-hidden="true" />} active={currentPath === `${basePath}/overview`} onClick={onNavigate}>
          Overview
        </NavItem>
        <NavItem href={`${basePath}/projects`} icon={<HugeiconsIcon icon={KanbanIcon} aria-hidden="true" />} active={currentPath === `${basePath}/projects`} onClick={onNavigate}>
          Projects
        </NavItem>
        <NavItem href={`${basePath}/activity`} icon={<HugeiconsIcon icon={Activity01Icon} aria-hidden="true" />} active={currentPath === `${basePath}/activity`} onClick={onNavigate}>
          Activity
        </NavItem>
      </div>
      <div className="sidebar-section">
        <h2>Workspace</h2>
        <NavItem href={`${basePath}/team`} icon={<HugeiconsIcon icon={UserMultipleIcon} aria-hidden="true" />} active={currentPath === `${basePath}/team`} onClick={onNavigate}>
          Team
        </NavItem>
        <NavItem href={`${basePath}/settings`} icon={<HugeiconsIcon icon={Settings02Icon} aria-hidden="true" />} active={currentPath === `${basePath}/settings`} onClick={onNavigate}>
          Settings
        </NavItem>
      </div>
      <div className="sidebar-bottom">
        <NavItem href={`${basePath}/help`} icon={<HugeiconsIcon icon={HelpCircleIcon} aria-hidden="true" />} active={currentPath === `${basePath}/help`} onClick={onNavigate}>
          Help
        </NavItem>
        <p>Alex Morgan<br /><span>Workspace admin</span></p>
      </div>
    </nav>
  );
}

// Pass the current pathname from your router; replace the destinations, identity and account copy.
export default function SidebarExample({
  currentPath, children, basePath = "",
}: { currentPath: string; children: ReactNode; basePath?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sidebar-shell">
      <aside className="sidebar-desktop">
        <div className="sidebar-identity">Atlas</div>
        <SidebarLinks currentPath={currentPath} basePath={basePath} />
      </aside>
      <div className="sidebar-content">
        <header className="sidebar-mobile-header">
          <span className="sidebar-identity">Atlas</span>
          <Drawer side="left" open={menuOpen} onOpenChange={setMenuOpen}>
            <Drawer.Trigger
              render={<IconButton appearance="ghost" variant="secondary" icon={<HugeiconsIcon icon={Menu01Icon} aria-hidden="true" />} aria-label="Open navigation" />}
            />
            <Drawer.Content>
              <Drawer.Header>Atlas</Drawer.Header>
              <div className="sidebar-drawer-body">
                <SidebarLinks currentPath={currentPath} basePath={basePath} onNavigate={() => setMenuOpen(false)} />
              </div>
            </Drawer.Content>
          </Drawer>
        </header>
        <main className="sidebar-main">{children}</main>
      </div>
    </div>
  );
}
