
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ThemeToggle } from "@/components/ThemeToggle";
import { popularSkills } from "@/data/sampleUsers";
import { Button } from "@/components/ui/button";
import { Users, Search, Heart, User, LogOut, MessageSquare, Menu } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [profiles, setProfiles] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (query: string, newFilters: string[]) => {
    setSearchQuery(query);
    setFilters(newFilters);
    setShowResults(query.trim() !== "" || newFilters.length > 0);
  };

  useEffect(() => {
    if (showResults) {
      fetchProfiles();
    }
  }, [user, showResults]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProfiles = data?.map(profile => ({
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar_url || '',
        location: profile.location || 'Location not set',
        title: profile.title || 'Helper',
        skills: profile.skills || [],
        rating: Number(profile.rating) || 0,
        reviewCount: profile.review_count || 0,
        description: profile.description || 'Happy to help!',
        price: profile.price_preference,
        socialLinks: profile.social_links || {},
        customLinks: profile.custom_links || []
      })).filter(profile => !user || profile.id !== user.id) || [];

      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
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
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400">
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
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find Someone Who Can
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Help You</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Connect with people in your community who can teach, help, or share their skills. 
            From cooking lessons to career advice - everyone has something valuable to offer.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <Search className="w-5 h-5 text-blue-500" />
              <span>Find the help you need</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Connect with helpers</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <Heart className="w-5 h-5 text-blue-500" />
              <span>Build meaningful connections</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl p-8 mb-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              "A friend in need is a friend indeed"
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Whether you need someone to teach you guitar, help fix your computer, practice a language, 
              or just want advice on career decisions - there's someone in your community ready to help. 
              Most connections happen through friendship, skill trades, or simply paying it forward.
            </p>
          </div>

          {!user && (
            <div className="mb-8">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-4"
                onClick={() => navigate("/auth")}
              >
                Get Started - Join the Community
              </Button>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} popularSkills={popularSkills} />
        </div>

        {/* Show Discovery Feed only when searching */}
        {showResults && (
          <DiscoveryFeed 
            users={profiles} 
            searchQuery={searchQuery} 
            filters={filters} 
          />
        )}

        {!showResults && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Search for help to get started</h3>
            <p className="text-gray-500 dark:text-gray-500">Use the search bar above to find people who can help you with specific skills or interests</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-blue-100 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8">
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
