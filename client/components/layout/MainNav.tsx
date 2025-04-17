"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Book,
  Calendar,
  ClipboardList,
  Compass,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  Award,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher";

export function MainNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
      active: isActive("/dashboard"),
      roles: ["student", "tutor", "parent", "admin"],
    },
    {
      title: "Courses",
      href: "/courses",
      icon: <Book className="mr-2 h-4 w-4" />,
      active: isActive("/courses"),
      roles: ["student", "tutor", "parent", "admin"],
    },
    {
      title: "Live Classes",
      href: "/live-classes",
      icon: <Calendar className="mr-2 h-4 w-4" />,
      active: isActive("/live-classes"),
      roles: ["student", "tutor", "parent", "admin"],
    },
    {
      title: "Assessments",
      href: "/assessments",
      icon: <ClipboardList className="mr-2 h-4 w-4" />,
      active: isActive("/assessments"),
      roles: ["student", "tutor", "parent", "admin"],
    },
    // {
    //   title: "Assignments",
    //   href: "/assignments",
    //   icon: <ClipboardList className="mr-2 h-4 w-4" />,
    //   active: isActive("/assignments"),
    //   roles: ["student", "tutor", "parent", "admin"],
    // },
    {
      title: "Certificates",
      href: "/certificates",
      icon: <Award className="mr-2 h-4 w-4" />,
      active: isActive("/certificates"),
      roles: ["student", "admin"],
    },
    {
      title: "Study Materials",
      href: "/study-materials",
      icon: <FileText className="mr-2 h-4 w-4" />,
      active: isActive("/study-materials"),
      roles: ["student", "tutor", "admin"],
    },
    {
      title: "Career",
      href: "/career",
      icon: <Compass className="mr-2 h-4 w-4" />,
      active: isActive("/career"),
      roles: ["student", "admin"],
    },
    {
      title: "Admin Dashboard",
      href: "/admin-dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      active: isActive("/admin-dashboard"),
      roles: ["admin"],
    },
  ].filter((item) => item.roles.includes(user.role));

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">EduConnect</span>
          </Link>
          <nav className="ml-10 hidden space-x-4 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                  item.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex h-16 items-center border-b px-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <GraduationCap className="h-6 w-6" />
                  <span className="font-bold">EduConnect</span>
                </Link>
              </div>
              <nav className="flex flex-col space-y-1 px-2 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                      item.active
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    </header>
  );
}
