import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Menu, Printer, Upload, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload & Print" },
  { href: "/history", label: "Activity" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clear();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Printer className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold">Smart Campus Print</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === link.href
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {identity ? (
            <>
              <Button size="sm" onClick={() => navigate("/upload")}>
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Quick Upload
              </Button>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                location.pathname === link.href
                  ? "text-primary bg-accent"
                  : "text-muted-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {identity ? (
            <button
              type="button"
              className="px-3 py-2 text-left text-sm text-destructive"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-2 text-sm font-medium text-primary"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
