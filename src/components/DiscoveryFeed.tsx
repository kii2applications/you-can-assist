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
  users?: User[];
  aiExperts?: User[];
  searchQuery: string;
  filters: string[];
  showAI: boolean;
}

export const DiscoveryFeed = ({
  users = [],
  aiExperts = [],
  searchQuery,
  filters = [],
  showAI
}: DiscoveryFeedProps) => {
  const navigate = useNavigate();

  const handleProfileClick = (user: User) => {
    if (user.isAIRecommended) {
      window.open(user.profileUrl || '#', '_blank');
    } else {
      navigate(`/connect/${user.userid}`);
    }
  };

  const getFilteredUsers = () => {
    let allUsers = [...(users || [])];

    if (showAI && aiExperts?.length > 0) {
      console.log('Adding AI experts to results:', aiExperts);
      allUsers = [...allUsers, ...aiExperts];
    }

    let filteredUsers = allUsers;

    if (searchQuery?.trim()) {
      // Split search terms and clean them
      const searchTerms = searchQuery.toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 1)
        .filter(term => !['in', 'at', 'from', 'of', 'and', 'or'].includes(term));

      console.log('Cleaned search terms:', searchTerms);

      filteredUsers = allUsers.filter(user => {
        // For debugging
        const userDetails = {
          name: user.name,
          skills: user.skills,
          location: user.location,
          isAI: user.isAIRecommended
        };
        console.log('Checking user:', userDetails);

        // Check if any search term matches the user data
        const matches = searchTerms.some(term => {
          const termMatches =
            // Check skills
            user.skills.some(skill => skill.toLowerCase().includes(term)) ||
            // Check title
            user.title.toLowerCase().includes(term) ||
            // Check description
            user.description.toLowerCase().includes(term) ||
            // Check location
            user.location.toLowerCase().includes(term);

          console.log(`Term "${term}" matches for ${user.name}:`, termMatches);
          return termMatches;
        });

        // If it's an AI expert, be more lenient with matching
        if (user.isAIRecommended) {
          // For AI experts, also check their expertise and platform
          const aiMatches = searchTerms.some(term => {
            const expertiseMatch = user.expertise?.toLowerCase().includes(term);
            const platformMatch = user.platform?.toLowerCase().includes(term);
            console.log(`AI expert ${user.name} expertise/platform match:`, { expertiseMatch, platformMatch });
            return matches || expertiseMatch || platformMatch;
          });
          return aiMatches;
        }

        return matches;
      });

      // Sort results: registered users first, then AI recommendations
      filteredUsers.sort((a, b) => {
        if (a.isAIRecommended === b.isAIRecommended) return 0;
        return a.isAIRecommended ? 1 : -1;
      });
    }

    if (filters?.length > 0) {
      filteredUsers = filteredUsers.filter(user =>
        filters.some(filter =>
          user.skills.some(skill =>
            skill.toLowerCase().includes(filter.toLowerCase())
          )
        )
      );
    }

    // Log the final filtered results
    console.log('Final filtered users:', filteredUsers.map(u => ({
      name: u.name,
      isAI: u.isAIRecommended,
      skills: u.skills,
      location: u.location
    })));

    return filteredUsers;
  };

  const filteredUsers = getFilteredUsers();
  const filteredAIExperts = filteredUsers.filter(user => user.isAIRecommended);

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
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user.title}
                </p>
              </div>
              {user.isAIRecommended ? (
                <Badge variant="secondary" className="shrink-0 bg-purple-100 dark:bg-purple-900/50">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Result
                </Badge>
              ) : (
                <Badge variant="secondary" className="shrink-0 bg-green-100 dark:bg-green-900/50">
                  <Users className="w-3 h-3 mr-1" />
                  Registered
                </Badge>
              )}
            </div>

            <div className="mt-2">
              <div className="flex flex-wrap gap-1 mb-2">
                {user.skills.slice(0, 3).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
                {user.skills.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.skills.length - 3} more</span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
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
                          <ExternalLink className="w-3 h-3" />
                          {link.title}
                        </a>
                      ))}
                      {user.customLinks.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{user.customLinks.length - 2} more resources
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Platform: {user.platform}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({user.reviewCount})
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.price}
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
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
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {searchQuery || (filters?.length ?? 0) > 0 ? 'Search Results' : 'Discover People'}
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
          </p>
          {showAI && filteredAIExperts.length > 0 && (
            <span className="text-sm text-gray-500">
              (including {filteredAIExperts.length} online experts)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id || user.profileUrl}>
            {renderUserCard(user)}
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No results found</h3>
          <p className="text-gray-500 dark:text-gray-500">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};
