import { NavbarRoutes } from "@/components/navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";

export const Navbar = ({ role }) => {
  return (
    <header className="px-6 h-full flex items-center bg-white/80 backdrop-blur-md border-b border-ink-200/80 shadow-subtle">
      <MobileSidebar role={role} />
      <NavbarRoutes role={role} />
    </header>
  );
};
