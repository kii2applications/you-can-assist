
import { ProfileCard } from "./ProfileCard";

interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
  title: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  description: string;
  price?: string;
}

interface DiscoveryFeedProps {
  users: User[];
  searchQuery: string;
  filters: string[];
}

export const DiscoveryFeed = ({ users, searchQuery, filters }: DiscoveryFeedProps) => {
  const filteredUsers = users.filter(user => {
    const matchesQuery = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = filters.length === 0 || 
      filters.some(filter => user.skills.some(skill => skill.toLowerCase().includes(filter.toLowerCase())));

    return matchesQuery && matchesFilters;
  });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {searchQuery || filters.length > 0 ? 'Search Results' : 'Discover People'}
        </h2>
        <p className="text-gray-600">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <ProfileCard key={user.id} user={user} />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
          <p className="text-gray-500">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};
