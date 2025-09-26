import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Brain, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const NavLinks = () => (
    <>
      <Link href="/" data-testid="link-dashboard">
        <Button variant="ghost" className="text-foreground hover:text-primary">
          Dashboard
        </Button>
      </Link>
      <Link href="/study-groups" data-testid="link-study-groups">
        <Button variant="ghost" className="text-foreground hover:text-primary">
          Study Groups
        </Button>
      </Link>
      <Link href="/community" data-testid="link-community">
        <Button variant="ghost" className="text-foreground hover:text-primary">
          Community
        </Button>
      </Link>
      <Link href="/interview-prep" data-testid="link-interview-prep">
        <Button variant="ghost" className="text-foreground hover:text-primary">
          Interview Prep
        </Button>
      </Link>
    </>
  );

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display">EduAI Hub</span>
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <NavLinks />
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  data-testid="button-theme-toggle"
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user?.firstName, user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" data-testid="link-logout">
                        Log out
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <div className="flex flex-col space-y-4 mt-6">
                        <NavLinks />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                data-testid="button-theme-toggle"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              <Button asChild data-testid="button-login">
                <a href="/api/login">Login</a>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
