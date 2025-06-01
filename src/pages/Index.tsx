import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ThemeToggle } from "@/components/ThemeToggle";
import { popularSkills } from "@/data/sampleUsers";
import { Button } from "@/components/ui/button";
import { Users, Search, Heart, User, LogOut, MessageSquare, Menu, Sparkles, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [showAI, setShowAI] = useState(false);

  const handleSearch = (query: string, location: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query);
    if (location.trim()) params.set("location", location);
    navigate(`/search?${params.toString()}`);
  };

  const handleAIToggle = (enabled: boolean) => {
    setShowAI(enabled);
  };

  return (
    <div className="min-h-screen safe-area-inset-top pb-20">
      {/* Mobile-friendly Header */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50 safe-area-inset-top">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
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
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
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
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/auth")}>
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/auth")}>
                      Join Community
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find Someone Who Can
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Help You</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Connect with people in your community who can teach, help, or share their skills.
            From cooking lessons to career advice - everyone has something valuable to offer.
          </p>
        </div>

        {/* Centered Search Section */}
        <div className="mb-16">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-center mb-6">
              What kind of help are you looking for?
            </h3>
            <SearchBar
              onSearch={handleSearch}
              onFilterChange={() => { }}
              popularSkills={popularSkills}
              showAI={showAI}
              onAIToggle={handleAIToggle}
              initialQuery=""
              initialLocation=""
            />
          </div>
        </div>

        {/* Quote Card */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              "A friend in need is a friend indeed"
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Whether you need someone to teach you guitar, help fix your computer, practice a language,
              or just want advice on career decisions - there's someone in your community ready to help.
              Most connections happen through friendship, skill trades, or simply paying it forward.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-4"
              onClick={() => navigate("/auth")}
            >
              Get Started - Join the Community
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Sign up to unlock AI-powered expert recommendations and more features
            </p>
          </div>
        )}

        {/* How it Works Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-16">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-2">How it works</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Three simple steps to get started</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Search className="w-8 h-8 text-blue-500 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
                <p className="text-gray-600 dark:text-gray-300">Find exactly what you need with our intelligent search system</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                <MapPin className="w-8 h-8 text-blue-500 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Local Community</h3>
                <p className="text-gray-600 dark:text-gray-300">Connect with helpers in your area for in-person assistance</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-8 h-8 text-blue-500 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
                <p className="text-gray-600 dark:text-gray-300">Get personalized expert recommendations with AI assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-blue-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>&copy; 2024 Kii2Connect. Building community through helping each other.</p>
          </div>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
