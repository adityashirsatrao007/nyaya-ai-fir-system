import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Scale, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "../services/auth";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-300 ${scrolled ? "pt-2" : "pt-4"}`}>
      <div className={`flex items-center justify-between w-full max-w-7xl px-5 py-2.5 transition-all duration-300 ${scrolled ? "glass shadow-lg" : "bg-transparent"}`} style={{ borderRadius: "100px" }}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <Scale size={22} className="text-nyaya-500 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold font-heading text-white tracking-tight">
            Nyaya <span className="text-amber-500">AI</span>
          </span>
        </div>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              {location.pathname !== "/app" && (
                <Button
                  variant="flat"
                  size="sm"
                  className="bg-white/5 text-stone-300 font-medium hover:bg-white/10 rounded-full h-9 px-4"
                  startContent={<LayoutDashboard size={14} />}
                  onPress={() => navigate("/app")}
                >
                  Dashboard
                </Button>
              )}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-nyaya-500/50 transition-colors">
                    <span className="text-nyaya-500 font-bold text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat" className="bg-elevated border border-glass-border text-foreground rounded-xl p-1.5">
                  <DropdownItem key="profile" className="h-14 gap-2 opacity-80 text-stone-300 rounded-lg" textValue="profile">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold text-nyaya-500">{user.email}</p>
                  </DropdownItem>
                  <DropdownItem key="dashboard" onPress={() => navigate("/app")} className="rounded-lg" textValue="dashboard">
                    Workspace
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" onPress={handleLogout} className="rounded-lg" textValue="logout" startContent={<LogOut size={14} />}>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Button
                  variant="light"
                  size="sm"
                  className="text-stone-400 font-medium hover:text-white rounded-full h-9 px-4"
                  startContent={<LogIn size={14} />}
                  onPress={() => navigate("/login")}
                >
                  Sign In
                </Button>
              )}
              {location.pathname !== "/signup" && (
                <Button
                  size="sm"
                  className="bg-nyaya-500 hover:bg-nyaya-600 text-white font-medium rounded-full h-9 px-5 shadow-glow"
                  startContent={<UserPlus size={14} />}
                  onPress={() => navigate("/signup")}
                >
                  Access Portal
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
