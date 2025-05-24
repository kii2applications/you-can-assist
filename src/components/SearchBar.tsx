
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, filters: string[]) => void;
  popularSkills: string[];
}

export const SearchBar = ({ onSearch, popularSkills }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch(query, selectedFilters);
  };

  const addFilter = (skill: string) => {
    if (!selectedFilters.includes(skill)) {
      setSelectedFilters([...selectedFilters, skill]);
    }
  };

  const removeFilter = (skill: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== skill));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search for skills, services, or people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-lg border-2 border-purple-200 focus:border-purple-400 rounded-full"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button 
          onClick={handleSearch}
          className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full font-semibold"
        >
          Search
        </Button>
      </div>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-600 mr-2">Filters:</span>
          {selectedFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="default" 
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
              onClick={() => removeFilter(filter)}
            >
              {filter}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 mr-2">Popular:</span>
        {popularSkills.map((skill) => (
          <Badge 
            key={skill}
            variant="outline" 
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => addFilter(skill)}
          >
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
};
