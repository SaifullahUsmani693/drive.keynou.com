import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Link2, Globe2, Settings, LogOut, LayoutDashboard, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Link2, label: "Links", path: "/dashboard/links" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Globe2, label: "Domains", path: "/dashboard/domains" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50">
        <div className="p-6">
          <Link to="/" className="font-display text-lg font-bold">
            keynou<span className="text-primary"> drive</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <div className="glass rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold">Free Plan</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Upgrade for custom domains & branding</p>
            <Button size="sm" className="w-full bg-gradient-primary hover:opacity-90 text-xs">
              Upgrade to Pro
            </Button>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-3 py-2">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border">
          <Link to="/" className="font-display text-lg font-bold">
            keynou<span className="text-primary"> drive</span>
          </Link>
          <Link to="/dashboard/settings">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
