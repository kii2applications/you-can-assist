
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { sampleUsers, popularSkills } from "@/data/sampleUsers";
import { Button } from "@/components/ui/button";
import { Users, Search, Heart } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  const handleSearch = (query: string, newFilters: string[]) => {
    setSearchQuery(query);
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SkillConnect
              </h1>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find People Who Can
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Help You</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover talented individuals based on their skills and what they can do. 
            Connect, collaborate, and grow together in our community of makers and helpers.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <Search className="w-5 h-5 text-purple-500" />
              <span>Search by Skills</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5 text-purple-500" />
              <span>Connect Instantly</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Heart className="w-5 h-5 text-purple-500" />
              <span>Help Each Other</span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} popularSkills={popularSkills} />
        </div>

        {/* Discovery Feed */}
        <DiscoveryFeed 
          users={sampleUsers} 
          searchQuery={searchQuery} 
          filters={filters} 
        />
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 SkillConnect. Connecting people through skills and passion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
