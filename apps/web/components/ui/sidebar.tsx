"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

export interface Links {
  label: string;
  href?: string;
  icon: React.JSX.Element | React.ReactNode;
}

export interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export interface DesktopSidebarProps extends React.ComponentProps<typeof motion.div> {
  openWidth?: string;
  collapsedWidth?: string;
}

export const DesktopSidebar = ({
  className,
  children,
  openWidth = "240px",
  collapsedWidth = "60px",
  ...props
}: DesktopSidebarProps) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-[#08090a] border-r border-[#23252a] shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? openWidth : collapsedWidth) : openWidth,
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-12 px-4 flex flex-row md:hidden items-center justify-between bg-[#08090a] border-b border-[#23252a] w-full shrink-0",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-[4px] bg-white text-black flex items-center justify-center font-mono font-bold text-xs">
          L
        </div>
        <span className="text-xs font-semibold text-white tracking-tight">LENORA</span>
      </div>
      <div className="flex justify-end z-20">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#161718] transition-colors"
        >
          <IconMenu2 className="w-5 h-5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            className="fixed h-full w-full inset-0 bg-[#08090a] p-6 z-[100] flex flex-col justify-between border-r border-[#23252a]"
          >
            <div
              className="absolute right-6 top-6 z-50 text-neutral-400 hover:text-white cursor-pointer p-1.5 rounded hover:bg-[#161718] transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <IconX className="w-5 h-5" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface SidebarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  link: Links;
  className?: string;
  isActive?: boolean;
}

export const SidebarLink = ({
  link,
  className,
  isActive = false,
  onClick,
  ...props
}: SidebarLinkProps) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href || "#"}
      onClick={onClick}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar px-2.5 py-2 rounded-[6px] transition-colors cursor-pointer select-none",
        isActive
          ? "bg-[#161718] text-white font-medium border border-[#23252a] shadow-xs"
          : "text-[#8a8f98] hover:text-[#d0d6e0] hover:bg-[#121315]",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "w-5 h-5 shrink-0 flex items-center justify-center transition-colors",
          isActive ? "text-[#e4f222]" : "text-[#8a8f98] group-hover/sidebar:text-white"
        )}
      >
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{
          duration: 0.15,
        }}
        className="text-xs font-medium tracking-tight whitespace-nowrap truncate !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};
