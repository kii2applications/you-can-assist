
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { sampleUsers, popularSkills } from "@/data/sampleUsers";
import { Button } from "@/components/ui/button";
import { Users, Search, Heart, HandHeart } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  const handleSearch = (query: string, newFilters: string[]) => {
    setSearchQuery(query);
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <HandHeart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HelpConnect
              </h1>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Join Community
              </Button>
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
      <footer className="bg-white border-t border-blue-100 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 HelpConnect. Building community through helping each other.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
