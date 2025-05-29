
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Home, Search, MessageSquare, User } from "lucide-react";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: MessageSquare, label: "Requests", path: "/requests" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Button
            key={path}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 p-3 h-auto ${
              location.pathname === path 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-gray-600 dark:text-gray-400"
            }`}
            onClick={() => navigate(path)}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
