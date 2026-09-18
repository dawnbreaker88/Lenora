"use client";

import React, { useState, ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/sidebar";

export type NavTab =
  | "home"
  | "plan"
  | "feynman"
  | "calendar"
  | "assessments"
  | "resources"
  | "settings";

interface AppShellProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: ReactNode;
}

function BrandLogo() {
  const { open, animate } = useSidebar();
  return (
    <div className="flex items-center gap-2.5 px-1 h-8">
      <div className="w-6 h-6 rounded-[5px] bg-white text-black flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
        L
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.15 }}
        className="text-sm font-semibold tracking-tight text-white whitespace-nowrap"
      >
        LENORA
      </motion.span>
    </div>
  );
}

function UserProfileFooter() {
  const { data: session } = useSession();
  const { open, animate } = useSidebar();

  return (
    <div className="pt-2 border-t border-[#23252a]/60 flex items-center justify-between px-1">
      <div className="flex items-center gap-2 min-w-0">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-6 h-6 rounded-full ring-1 ring-[#23252a] shrink-0 object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center text-[10px] text-white font-medium shrink-0">
            {session?.user?.name?.[0] || "U"}
          </div>
        )}
        <motion.div
          animate={{
            display: animate ? (open ? "block" : "none") : "block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          transition={{ duration: 0.15 }}
          className="min-w-0 truncate"
        >
          <p className="text-xs font-medium text-white truncate">
            {session?.user?.name || "Student"}
          </p>
          <p className="text-[10px] text-[#62666d] truncate">
            {session?.user?.email}
          </p>
        </motion.div>
      </div>

      <motion.div
        animate={{
          display: animate ? (open ? "block" : "none") : "block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
          aria-label="Sign out"
          className="p-1 text-[#62666d] hover:text-red-400 rounded transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </div>
  );
}

export function AppShell({ activeTab, onSelectTab, children }: AppShellProps) {
  const [open, setOpen] = useState(false);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ElementType }> = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "plan", label: "Plan", icon: Compass },
    { id: "feynman", label: "Feynman", icon: GraduationCap },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "assessments", label: "Assessments", icon: BarChart3 },
    { id: "resources", label: "Resources", icon: FileText },
  ];

  const handleSelectTab = (tab: NavTab) => {
    onSelectTab(tab);
    setOpen(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-[#05070A] text-[#d0d6e0] font-sans antialiased selection:bg-[#0B2A4A] selection:text-white">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6 bg-[#08090a] border-r border-[#23252a] px-3 py-4">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <BrandLogo />
            <div className="mt-5 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarLink
                    key={item.id}
                    link={{
                      label: item.label,
                      href: "#",
                      icon: <Icon className="w-4 h-4" />,
                    }}
                    isActive={activeTab === item.id}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectTab(item.id);
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-3 border-t border-[#23252a]/60">
            <SidebarLink
              link={{
                label: "Settings",
                href: "#",
                icon: <Settings className="w-4 h-4" />,
              }}
              isActive={activeTab === "settings"}
              onClick={(e) => {
                e.preventDefault();
                handleSelectTab("settings");
              }}
            />
            <UserProfileFooter />
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 min-w-0 min-h-0 h-full overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
