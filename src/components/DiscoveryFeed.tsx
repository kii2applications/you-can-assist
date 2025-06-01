import { ProfileCard } from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Sparkles, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  userid: string;
  name: string;
  avatar: string;
  location: string;
  title: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  description: string;
  price: string;
  socialLinks: Record<string, string>;
  customLinks: Array<{ title: string; url: string; }>;
  isAIRecommended?: boolean;
  platform?: string;
  profileUrl?: string;
  expertise?: string;
}

interface DiscoveryFeedProps {
  users: User[];
  extendedResults?: User[];
  isExtendedSearchAvailable?: boolean;
  isExtendedSearchLoading?: boolean;
  searchQuery: string;
  filters: string[];
  showAI: boolean;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  users,
  extendedResults = [],
  isExtendedSearchAvailable = false,
  isExtendedSearchLoading = false,
  searchQuery,
  filters,
  showAI
}) => {
  const navigate = useNavigate();

  const handleProfileClick = (user: User) => {
    if (user.isAIRecommended) {
      window.open(user.profileUrl || '#', '_blank');
    } else {
      navigate(`/connect/${user.userid}`);
    }
  };

  // Function to convert Gemini expert to User format
  const convertExpertToUser = (expert: any): User => {
    // Split expertise into individual skills if it's a comma-separated string
    const skills = expert.expertise
      ? expert.expertise.split(',').map((s: string) => s.trim())
      : ['M-Files Consultant'];

    return {
      id: expert.profileUrl || Math.random().toString(),
      userid: expert.profileUrl || Math.random().toString(),
      name: expert.name,
      avatar: expert.profilePicture || '',
      location: '',
      title: expert.platform || 'Expert',  // Use platform as title if available
      skills: skills,
      rating: 0,
      reviewCount: 0,
      description: expert.content?.[0]?.description || '',
      price: '',
      socialLinks: {},
      customLinks: expert.content?.map((c: any) => ({
        title: c.title,
        url: c.url
      })) || [],
      isAIRecommended: true,
      platform: expert.platform || '',
      profileUrl: expert.profileUrl || '',
      expertise: expert.expertise || ''
    };
  };

  // Function to filter out duplicates when combining results
  const combineResults = (basicResults: User[], extendedResults: any[]) => {
    const seen = new Set(basicResults.map(user => user.id));
    // Convert and mark extended results as AI recommended
    const aiResults = extendedResults.map(expert => convertExpertToUser(expert));
    // Only add extended results that aren't in basic results
    const additional = aiResults.filter(user => !seen.has(user.id));
    console.log('AI Results:', additional);
    return [...basicResults, ...additional];
  };

  // Get the final list of users to display
  const displayUsers = showAI && isExtendedSearchAvailable ?
    combineResults(users, extendedResults) :
    users;

  // Apply any additional filters
  const filteredUsers = displayUsers.filter(user => {
    if (!filters.length) return true;
    return filters.some(filter =>
      user.skills.some(skill =>
        skill.toLowerCase().includes(filter.toLowerCase())
      )
    );
  });

  if (!filteredUsers.length && !isExtendedSearchLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No results found
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          {showAI && isExtendedSearchAvailable ?
            "No matches found in both basic and AI-enhanced search." :
            "Try adjusting your search terms or filters"}
        </p>
      </div>
    );
  }

  const renderUserCard = (user: User) => {
    const getAvatarUrl = (user: User) => {
      if (user.avatar && user.avatar.startsWith('http')) {
        return user.avatar;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
    };

    return (
      <Card className="p-4 relative hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
            <img
              src={getAvatarUrl(user)}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user.title}
                </p>
              </div>
              <div className="shrink-0">
                {user.isAIRecommended ? (
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Result
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 whitespace-nowrap">
                    <Users className="w-3 h-3 mr-1" />
                    Registered
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-2">
              <div className="flex flex-wrap gap-1 mb-2">
                {user.skills.slice(0, 3).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs whitespace-nowrap"
                  >
                    {skill}
                  </Badge>
                ))}
                {user.skills.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{user.skills.length - 3} more
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 break-words">
                {user.description}
              </p>

              {user.isAIRecommended ? (
                <div className="mt-2 space-y-2">
                  {user.customLinks && user.customLinks.length > 0 && (
                    <div className="space-y-1">
                      {user.customLinks.slice(0, 2).map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate flex-1">{link.title}</span>
                        </a>
                      ))}
                      {user.customLinks.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{user.customLinks.length - 2} more resources
                        </p>
                      )}
                    </div>
                  )}
                  {user.platform && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{user.platform}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < Math.floor(user.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                            }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      ({user.reviewCount})
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.price}
                  </span>
                </div>
              )}

              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleProfileClick(user)}
                >
                  {user.isAIRecommended ? 'View Profile →' : 'Connect'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search summary */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {searchQuery ? 'Search Results' : 'Discover People'}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'})
          </span>
        </div>
        {showAI && isExtendedSearchAvailable && (
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 whitespace-nowrap">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Enhanced
          </Badge>
        )}
      </div>

      {/* User cards */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id}>
            {renderUserCard(user)}
          </div>
        ))}
      </div>

      {/* Loading state for extended search */}
      {isExtendedSearchLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Looking for AI-enhanced matches...
          </p>
        </div>
      )}

      {/* Results summary */}
      {showAI && isExtendedSearchAvailable && extendedResults.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center border-t pt-4">
          Showing {filteredUsers.length} results
          ({extendedResults.length} from AI-enhanced search)
        </div>
      )}
    </div>
  );
};
