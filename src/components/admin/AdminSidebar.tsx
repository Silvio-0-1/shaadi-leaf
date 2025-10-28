
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileImage,
  Tag,
  MapPin,
  FileText,
  Coins,
  Users,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { title: 'Templates', icon: FileImage, path: '/admin/templates' },
  { title: 'Tags', icon: Tag, path: '/admin/tags' },
  { title: 'Venue Icons', icon: MapPin, path: '/admin/venue-icons' },
  { title: 'Pages', icon: FileText, path: '/admin/pages' },
  { title: 'Credits', icon: Coins, path: '/admin/credits' },
  { title: 'Users', icon: Users, path: '/admin/users' },
  { title: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
  { title: 'Settings', icon: Settings, path: '/admin/settings' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

export const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileToggle }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileToggle}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => window.innerWidth < 1024 && onMobileToggle()}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{item.title}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};
