import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectionRequests } from "@/components/ConnectionRequests";

const Requests = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen safe-area-inset-top pb-20">
      {/* Header matching Index page */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50 safe-area-inset-top">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/lovable-uploads/d6feabf9-2ed6-480e-91b4-827b47d13167.png"
                  alt="Kii2Connect Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Kii2Connect
              </h1>
            </div>

            {/* Right side - Theme + Menu */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />

              {loading ? (
                <div className="text-gray-600 dark:text-gray-300 text-sm">Loading...</div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {user ? (
                      <>
                        <DropdownMenuItem onClick={() => signOut()}>
                          Sign Out
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/auth")}>
                          Sign In
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/auth")}>
                          Join Community
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Connection Requests
        </h1>

        <ConnectionRequests />
      </main>
    </div>
  );
};

export default Requests;
