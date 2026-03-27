import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { useSummary } from "@/hooks/use-data";
import {
  LayoutDashboard,
  Monitor,
  AlertTriangle,
  Ticket,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

function NocLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-label="Atera NOC Dashboard"
        className="flex-shrink-0"
      >
        <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <circle cx="16" cy="16" r="2" fill="currentColor" className="text-primary" />
        <line x1="16" y1="2" x2="16" y2="10" stroke="currentColor" strokeWidth="1" className="text-primary opacity-40" />
        <line x1="16" y1="22" x2="16" y2="30" stroke="currentColor" strokeWidth="1" className="text-primary opacity-40" />
        <line x1="2" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1" className="text-primary opacity-40" />
        <line x1="22" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1" className="text-primary opacity-40" />
      </svg>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground tracking-tight">Atera NOC</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Dashboard</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [location] = useLocation();
  const { data: summary } = useSummary();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Initialize dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const activeAlertCount = summary?.kpis.activeAlerts ?? 0;

  const navItems: NavItem[] = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/agents", label: "Agents", icon: Monitor },
    { path: "/alerts", label: "Alerts", icon: AlertTriangle, badge: activeAlertCount > 0 ? activeAlertCount : undefined },
    { path: "/tickets", label: "Tickets", icon: Ticket },
    { path: "/customers", label: "Customers", icon: Building2 },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/" || location === "";
    return location.startsWith(path);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 flex-shrink-0 ${
          collapsed ? "w-16" : "w-56"
        }`}
        data-testid="sidebar"
      >
        <NocLogo collapsed={collapsed} />

        <nav className="flex-1 flex flex-col gap-0.5 px-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer relative ${
                    active
                      ? "bg-sidebar-accent text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {item.badge && (
                    <span
                      className={`${
                        collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                      } bg-noc-critical text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-mono`}
                      data-testid={`badge-${item.label.toLowerCase()}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="flex flex-col gap-1 px-2 pb-3 mt-auto">
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
            data-testid="toggle-theme"
          >
            {isDark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
            {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
            data-testid="toggle-sidebar"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && (
            <div className="px-3 pt-2">
              <PerplexityAttribution />
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" data-testid="main-content">
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
