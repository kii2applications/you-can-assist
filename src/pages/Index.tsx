import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { popularSkills } from "@/data/sampleUsers";
import { Button } from "@/components/ui/button";
import { Users, Search, Heart, User, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [profiles, setProfiles] = useState([]);

  const handleSearch = (query: string, newFilters: string[]) => {
    setSearchQuery(query);
    setFilters(newFilters);
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform profiles to match expected format and filter out current user
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
        price: profile.price_preference
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/090ce9d9-42be-47cc-9f82-9287adf4e57b.png" 
                  alt="Kii2Connect Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Kii2Connect
              </h1>
            </div>
            <div className="flex space-x-3">
              {loading ? (
                <div>Loading...</div>
              ) : user ? (
                <>
                  <Button 
                    variant="outline" 
                    className="border-green-200 text-green-600 hover:bg-green-50"
                    onClick={() => navigate("/requests")}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Requests
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    onClick={() => navigate("/auth")}
                  >
                    Join Community
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Someone Who Can
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Help You</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with people in your community who can teach, help, or share their skills. 
            From cooking lessons to career advice - everyone has something valuable to offer.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <Search className="w-5 h-5 text-blue-500" />
              <span>Find the help you need</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Connect with helpers</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Heart className="w-5 h-5 text-blue-500" />
              <span>Build meaningful connections</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-2xl p-8 mb-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              "A friend in need is a friend indeed"
            </h3>
            <p className="text-gray-700 text-lg">
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

        {/* Discovery Feed */}
        <DiscoveryFeed 
          users={profiles} 
          searchQuery={searchQuery} 
          filters={filters} 
        />
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
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
