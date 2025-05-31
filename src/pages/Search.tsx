import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { SelfHelpSuggestions } from "@/components/SelfHelpSuggestions";
import { popularSkills } from "@/data/sampleUsers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getEnhancedSearchTerms, getExpertRecommendations } from '@/integrations/gemini/client';
import { Badge } from "@/components/ui/badge";

interface EnhancedSearchResult {
  spellCorrection?: string;
  relatedTerms: string[];
}

const Search = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [aiExperts, setAiExperts] = useState([]);
  const [searchResults, setSearchResults] = useState<EnhancedSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    try {
      // Get AI-enhanced search terms
      const enhancedSearch = await getEnhancedSearchTerms(query);
      setSearchResults(enhancedSearch);

      // Get AI expert recommendations if AI is enabled
      if (useAI && query.trim()) {
        const result = await getExpertRecommendations(query);
        if (result?.experts) {
          const transformedExperts = result.experts.map(expert => ({
            id: expert.profileUrl || expert.name,
            name: expert.name,
            avatar: expert.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=random`,
            location: expert.platform || 'Online',
            title: expert.expertise,
            expertise: expert.expertise,
            skills: expert.expertise.split(',').map(s => s.trim()),
            rating: 5,
            reviewCount: 0,
            description: expert.content[0]?.description || '',
            price: 'Contact for pricing',
            socialLinks: {
              profile: expert.profileUrl
            },
            customLinks: expert.content.map(c => ({
              title: c.title,
              url: c.url
            })),
            isAIRecommended: true,
            platform: expert.platform,
            profileUrl: expert.profileUrl
          }));
          console.log('Transformed AI experts:', transformedExperts);
          setAiExperts(transformedExperts);
        }
      } else {
        setAiExperts([]);
      }
    } catch (error) {
      console.error('Error in search:', error);
      setAiExperts([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle AI toggle
  const handleAIToggle = (enabled: boolean) => {
    setUseAI(enabled);
    if (!enabled) {
      setAiExperts([]); // Clear AI experts when disabled
    } else if (searchQuery.trim()) {
      handleSearch(searchQuery); // Refresh search with AI if there's a query
    }
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
        userid: profile.userid,
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
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={setFilters}
            popularSkills={popularSkills}
            showAI={useAI}
            onAIToggle={handleAIToggle}
          />
        </div>

        {searchQuery && (
          <>
            {searchResults && (
              <div className="mb-6">
                {searchResults.spellCorrection && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Did you mean: <span className="font-medium">{searchResults.spellCorrection}</span>?
                  </p>
                )}
                {searchResults.relatedTerms.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Related searches:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.relatedTerms.map((term, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleSearch(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex-1">
                <DiscoveryFeed
                  users={profiles}
                  searchQuery={searchQuery}
                  filters={filters}
                  showAI={useAI}
                  aiExperts={aiExperts}
                />
                {isSearching && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Searching...</p>
                  </div>
                )}
              </div>

              <div className="w-72 shrink-0 space-y-4">
                <SelfHelpSuggestions
                  searchQuery={searchQuery}
                  showAI={useAI}
                />
              </div>
            </div>
          </>
        )}

        {!searchQuery && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Search for help to get started
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Use the search bar above to find people who can help you with specific skills or interests
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
