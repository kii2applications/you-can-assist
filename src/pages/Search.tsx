
import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { popularSkills } from "@/data/sampleUsers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Search = () => {
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen safe-area-inset-top pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Search for Help
          </h1>
          <SearchBar onSearch={handleSearch} popularSkills={popularSkills} />
        </div>

        <DiscoveryFeed 
          users={profiles} 
          searchQuery={searchQuery} 
          filters={filters} 
        />
      </div>
    </div>
  );
};

export default Search;
