import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { SelfHelpSuggestions } from "@/components/SelfHelpSuggestions";
import { popularSkills } from "@/data/sampleUsers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getEnhancedSearchTerms, getExpertRecommendations, getSearchTermExpansion } from '@/integrations/gemini/client';
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import debounce from "lodash/debounce";
import { useToast } from "@/components/ui/use-toast";

interface EnhancedSearchResult {
  spellCorrection?: string;
  relatedTerms: string[];
}

interface SearchState {
  profiles: any[];
  page: number;
  loading: boolean;
  hasMore: boolean;
}

const Search = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("location") || "");
  const [filters, setFilters] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(false);
  const [searchResults, setSearchResults] = useState<EnhancedSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);
  const [searchState, setSearchState] = useState<SearchState>({
    profiles: [],
    page: 1,
    loading: false,
    hasMore: true
  });
  const ITEMS_PER_PAGE = 20;
  const [isExtendedSearchAvailable, setIsExtendedSearchAvailable] = useState(false);
  const [extendedSearchResults, setExtendedSearchResults] = useState<any[]>([]);
  const [isExtendedSearchLoading, setIsExtendedSearchLoading] = useState(false);

  // Create a debounced version of performSearch
  const debouncedSearch = useCallback(
    debounce((query: string, location: string) => {
      performSearch(query, location);
    }, 300),
    []
  );

  // Effect to handle URL search params on initial load
  useEffect(() => {
    const query = searchParams.get("q");
    const location = searchParams.get("location");
    if (query || location) {
      setSearchQuery(query || "");
      setSearchLocation(location || "");
      // Don't debounce the initial search from URL
      performSearch(query || "", location || "", true);
    } else {
      fetchProfiles();
    }

    // Cleanup debounced function on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  // Helper function for basic search
  const performBasicSearch = (query: any, searchTerm: string) => {
    // Normalize the search term to lowercase for consistent processing
    const normalizedTerm = searchTerm.toLowerCase().trim();

    // Generate case variations for skills search
    const skillVariations = new Set([
      normalizedTerm,
      // Add capitalized version
      normalizedTerm.charAt(0).toUpperCase() + normalizedTerm.slice(1),
      // Add fully capitalized version
      normalizedTerm.toUpperCase()
    ]);

    // Add plural/singular variations
    if (normalizedTerm.endsWith('s')) {
      const singular = normalizedTerm.slice(0, -1);
      skillVariations.add(singular);
      skillVariations.add(singular.charAt(0).toUpperCase() + singular.slice(1));
    } else {
      const plural = normalizedTerm + 's';
      skillVariations.add(plural);
      skillVariations.add(plural.charAt(0).toUpperCase() + plural.slice(1));
    }

    // Handle 'ing' and 'er' variations
    if (normalizedTerm.endsWith('ing')) {
      const base = normalizedTerm.slice(0, -3);
      const erForm = base + 'er';
      skillVariations.add(erForm);
      skillVariations.add(erForm.charAt(0).toUpperCase() + erForm.slice(1));
    } else if (normalizedTerm.endsWith('er')) {
      const base = normalizedTerm.slice(0, -2);
      const ingForm = base + 'ing';
      skillVariations.add(ingForm);
      skillVariations.add(ingForm.charAt(0).toUpperCase() + ingForm.slice(1));
    }

    // Handle multi-word searches and common compound skills
    const words = normalizedTerm.split(/\s+/).filter(word => word.length > 1);

    // Common prefixes and suffixes for skills
    const commonPrefixes = ['digital', 'web', 'mobile', 'social', 'content', 'data', 'software'];
    const commonSuffixes = ['development', 'design', 'marketing', 'management', 'engineering', 'analysis'];

    if (words.length > 1) {
      // Add the full multi-word term with different casings
      const fullTerm = words.join(' ');
      skillVariations.add(fullTerm); // lowercase
      skillVariations.add(fullTerm.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')); // Title Case
      skillVariations.add(fullTerm.toUpperCase()); // UPPERCASE

      // Add individual words with proper casing
      words.forEach(word => {
        skillVariations.add(word);
        skillVariations.add(word.charAt(0).toUpperCase() + word.slice(1));

        // For each word, check if it's in commonSuffixes
        if (commonSuffixes.includes(word.toLowerCase())) {
          // Add combinations with common prefixes
          commonPrefixes.forEach(prefix => {
            const compound = `${prefix} ${word}`;
            skillVariations.add(compound);
            skillVariations.add(compound.split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '));
          });
        }
        // For each word, check if it's in commonPrefixes
        if (commonPrefixes.includes(word.toLowerCase())) {
          // Add combinations with common suffixes
          commonSuffixes.forEach(suffix => {
            const compound = `${word} ${suffix}`;
            skillVariations.add(compound);
            skillVariations.add(compound.split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '));
          });
        }
      });
    } else {
      // Single word - check if it's a prefix or suffix and generate compounds
      const word = normalizedTerm;
      if (commonSuffixes.includes(word)) {
        commonPrefixes.forEach(prefix => {
          const compound = `${prefix} ${word}`;
          skillVariations.add(compound);
          skillVariations.add(compound.split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '));
        });
      }
      if (commonPrefixes.includes(word)) {
        commonSuffixes.forEach(suffix => {
          const compound = `${word} ${suffix}`;
          skillVariations.add(compound);
          skillVariations.add(compound.split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '));
        });
      }
    }

    // Build all OR conditions in a single array
    const orConditions = [
      // Text search conditions
      `name.ilike.%${normalizedTerm}%`,
      `description.ilike.%${normalizedTerm}%`,
      `title.ilike.%${normalizedTerm}%`,
      // Skills overlap condition (using PostgreSQL && operator via 'ov')
      `skills.ov.{${Array.from(skillVariations).map(skill =>
        // Properly quote skills that contain spaces
        skill.includes(' ') ? `"${skill}"` : skill
      ).join(',')}}`
    ];

    // Combine all conditions into a single OR query
    return query.or(orConditions.join(','));
  };

  // Function to fetch AI recommendations with error handling
  const fetchAIRecommendations = async (query: string) => {
    if (!useAI || !query.trim() || !user) {
      setSearchResults(null);
      return;
    }

    try {
      setAIError(null);
      // Get AI-enhanced search terms
      const enhancedSearch = await getEnhancedSearchTerms(query);
      setSearchResults(enhancedSearch);

      // Get AI expert recommendations
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
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      setAIError('AI recommendations are temporarily unavailable.');

      if (useAI) {
        toast({
          title: "AI Features Unavailable",
          description: "AI-powered recommendations are currently unavailable. You can still search normally.",
          duration: 5000,
        });
      }
    }
  };

  // Main search function that coordinates everything
  const performSearch = async (query: string, location: string, updateUrl = true) => {
    setIsSearching(true);
    setSearchState(prev => ({ ...prev, page: 1, profiles: [] }));
    setAIError(null);

    // Update URL if needed
    if (updateUrl) {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (location) params.set("location", location);
      setSearchParams(params);
    }

    try {
      // First perform the basic search
      await fetchProfiles(query, location, 1);

      // Then perform AI search if enabled and user is logged in
      if (useAI && query.trim() && user) {
        await performExtendedSearch(query, location);
      }
    } catch (error) {
      console.error('Error in search:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Separate function for extended AI search
  const performExtendedSearch = async (searchTerm: string, location: string) => {
    if (!searchTerm.trim() || !user) return;

    setIsExtendedSearchLoading(true);
    setAIError(null);
    setIsAIInsightsOpen(true);

    try {
      // Get AI expert recommendations with location
      const result = await getExpertRecommendations(searchTerm, location.trim() || undefined);
      console.log('AI expert recommendations:', result);

      if (result?.experts) {
        setExtendedSearchResults(result.experts);
        setIsExtendedSearchAvailable(true);
      }

      // Get AI-enhanced search terms
      const expandedTerms = await getSearchTermExpansion(searchTerm);
      console.log('AI expanded terms:', expandedTerms);

      // Limit to 5 terms and ensure original term is included
      const limitedTerms = [searchTerm.toLowerCase()];
      expandedTerms
        .filter(term => term.toLowerCase() !== searchTerm.toLowerCase())
        .slice(0, 4)
        .forEach(term => limitedTerms.push(term));

      // Set the search results for the suggestions panel
      setSearchResults({
        spellCorrection: searchTerm,
        relatedTerms: limitedTerms
      });

      // If we have expanded terms, perform additional DB search with them
      if (limitedTerms.length > 0) {
        const additionalProfiles = await fetchAdditionalProfiles(limitedTerms, location);
        if (additionalProfiles.length > 0) {
          setSearchState(prev => ({
            ...prev,
            profiles: [...new Map([...prev.profiles, ...additionalProfiles].map(item => [item.id, item])).values()]
          }));
        }
      }

    } catch (error) {
      console.error('Error in extended search:', error);
      setAIError('Failed to get AI recommendations');
      setIsExtendedSearchAvailable(false);
      setExtendedSearchResults([]);
    } finally {
      setIsExtendedSearchLoading(false);
    }
  };

  // Function to fetch additional profiles with expanded terms
  const fetchAdditionalProfiles = async (terms: string[], location: string) => {
    try {
      let supabaseQuery = supabase
        .from('profiles')
        .select('*');

      // Build OR conditions for all terms
      const orConditions = terms.flatMap(term => [
        `name.ilike.%${term}%`,
        `description.ilike.%${term}%`,
        `title.ilike.%${term}%`,
        `skills.ov.{${term}}`
      ]);

      supabaseQuery = supabaseQuery.or(orConditions.join(','));

      // Add location filter if provided
      if (location.trim()) {
        supabaseQuery = supabaseQuery.ilike('location', `%${location.toLowerCase()}%`);
      }

      // Exclude current user if logged in
      if (user) {
        supabaseQuery = supabaseQuery.neq('id', user.id);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      return data?.map(profile => ({
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
      })) || [];
    } catch (error) {
      console.error('Error fetching additional profiles:', error);
      return [];
    }
  };

  // Effect to reset AI states when search is cleared
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults(null);
      setExtendedSearchResults([]);
      setIsExtendedSearchAvailable(false);
      setIsExtendedSearchLoading(false);
      setAIError(null);
    }
  }, [searchQuery]);

  const fetchProfiles = async (query: string = '', location: string = '', page: number = 1) => {
    try {
      setSearchState(prev => ({ ...prev, loading: true }));
      setIsExtendedSearchAvailable(false);
      setExtendedSearchResults([]);

      let supabaseQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const searchTerm = query.toLowerCase().trim();

      if (searchTerm || location.trim()) {
        if (searchTerm) {
          // Always perform basic search first
          supabaseQuery = performBasicSearch(supabaseQuery, searchTerm);
        }

        // Add location filter if provided (this creates an AND condition)
        if (location.trim()) {
          // Make location search case insensitive
          supabaseQuery = supabaseQuery.ilike('location', `%${location.toLowerCase()}%`);
        }
      }

      // Add pagination
      const start = (page - 1) * ITEMS_PER_PAGE;
      supabaseQuery = supabaseQuery
        .order('created_at', { ascending: false })
        .range(start, start + ITEMS_PER_PAGE - 1);

      // Exclude current user if logged in
      if (user) {
        supabaseQuery = supabaseQuery.neq('id', user.id);
      }

      const { data, error, count } = await supabaseQuery;

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
      })) || [];

      setSearchState(prev => ({
        profiles: page === 1 ? transformedProfiles : [...prev.profiles, ...transformedProfiles],
        page,
        loading: false,
        hasMore: count ? start + ITEMS_PER_PAGE < count : false
      }));

      // After basic search is complete and results are shown, 
      // trigger AI search if enabled
      if (useAI && searchTerm) {
        performExtendedSearch(searchTerm, location);
      }

    } catch (error) {
      console.error('Error fetching profiles:', error);
      setSearchState(prev => ({ ...prev, loading: false }));
      toast({
        title: "Error",
        description: "Failed to fetch profiles. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler for search bar input
  const handleSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setSearchLocation(location);
    performSearch(query, location);
  };

  // Handler for related search terms
  const handleRelatedSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query, searchLocation);
  };

  const loadMore = () => {
    if (!searchState.loading && searchState.hasMore) {
      setSearchState(prev => ({ ...prev, loading: true }));
      fetchProfiles(searchQuery, searchLocation, searchState.page + 1);
    }
  };

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
                        <DropdownMenuItem onClick={() => navigate("/auth")}>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Search People
          </h1>
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={setFilters}
            popularSkills={popularSkills}
            showAI={useAI}
            onAIToggle={(enabled) => {
              setUseAI(enabled);
              if (enabled && searchQuery) {
                // Trigger AI search when enabling if there's a search query
                performExtendedSearch(searchQuery, searchLocation);
              }
            }}
            initialQuery={searchQuery}
            initialLocation={searchLocation}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {searchState.loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <DiscoveryFeed
                users={searchState.profiles}
                extendedResults={extendedSearchResults}
                isExtendedSearchAvailable={isExtendedSearchAvailable}
                isExtendedSearchLoading={isExtendedSearchLoading}
                searchQuery={searchQuery}
                filters={filters}
                showAI={useAI}
              />
            )}
            {searchState.hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={searchState.loading}
                >
                  {searchState.loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>

          {useAI && searchQuery && (
            <div className="lg:w-80">
              <div className="sticky top-24">
                <SelfHelpSuggestions
                  searchQuery={searchQuery}
                  searchResults={searchResults}
                  isOpen={isAIInsightsOpen}
                  onToggle={() => setIsAIInsightsOpen(!isAIInsightsOpen)}
                  onSearch={handleRelatedSearch}
                  error={aiError}
                  isLoading={isExtendedSearchLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
