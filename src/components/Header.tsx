import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Bell, Menu, User, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

export const Header = () => {
    const navigate = useNavigate();
    const { user, signOut, loading } = useAuth();
    const { isSubscribed, subscribe, unsubscribe, permissionState } = usePushNotifications();

    const handleNotificationClick = async () => {
        if (!user) {
            toast.error("Please sign in to enable notifications");
            return;
        }

        if (isSubscribed) {
            const success = await unsubscribe();
            if (success) toast.success("Notifications disabled");
        } else {
            const success = await subscribe();
            if (success) toast.success("Notifications enabled!");
            else if (Notification.permission === 'denied') {
                toast.error("Notifications are blocked. Please enable them in your browser settings.");
            }
        }
    };

    return (
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

                    {/* Right side - Theme + Notifications + Menu */}
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />

                        {user && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNotificationClick}
                                className={`relative ${isSubscribed ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                                title={isSubscribed ? "Notifications enabled" : "Enable notifications"}
                            >
                                <Bell className="w-5 h-5" />
                                {permissionState === 'denied' && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                                )}
                                {isSubscribed && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                                )}
                            </Button>
                        )}

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
                                            <DropdownMenuItem onClick={() => navigate("/requests")}>
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Requests
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate("/profile")}>
                                                <User className="w-4 h-4 mr-2" />
                                                Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => signOut()} className="text-red-600 dark:text-red-400">
                                                <LogOut className="w-4 h-4 mr-2" />
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
    );
};
