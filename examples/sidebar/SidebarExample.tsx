"use client";

import { useState, type ReactNode } from "react";
import { Activity, CircleHelp, FolderKanban, LayoutDashboard, Menu, Settings2, Users } from "lucide-react";
import { Drawer, IconButton, NavItem } from "sherick-ui";
import "./sidebar.css";

function SidebarLinks({
  currentPath, basePath, onNavigate,
}: { currentPath: string; basePath: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="sidebar-links">
      <div className="sidebar-destinations">
        <NavItem href={`${basePath}/overview`} icon={<LayoutDashboard />} active={currentPath === `${basePath}/overview`} onClick={onNavigate}>
          Overview
        </NavItem>
        <NavItem href={`${basePath}/projects`} icon={<FolderKanban />} active={currentPath === `${basePath}/projects`} onClick={onNavigate}>
          Projects
        </NavItem>
        <NavItem href={`${basePath}/activity`} icon={<Activity />} active={currentPath === `${basePath}/activity`} onClick={onNavigate}>
          Activity
        </NavItem>
      </div>
      <div className="sidebar-section">
        <h2>Workspace</h2>
        <NavItem href={`${basePath}/team`} icon={<Users />} active={currentPath === `${basePath}/team`} onClick={onNavigate}>
          Team
        </NavItem>
        <NavItem href={`${basePath}/settings`} icon={<Settings2 />} active={currentPath === `${basePath}/settings`} onClick={onNavigate}>
          Settings
        </NavItem>
      </div>
      <div className="sidebar-bottom">
        <NavItem href={`${basePath}/help`} icon={<CircleHelp />} active={currentPath === `${basePath}/help`} onClick={onNavigate}>
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
              render={<IconButton appearance="ghost" variant="secondary" icon={<Menu />} aria-label="Open navigation" />}
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
