import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, X, MapPin, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  onFilterChange?: (filters: string[]) => void;
  popularSkills?: string[];
  showAI?: boolean;
  onAIToggle?: (enabled: boolean) => void;
  initialQuery?: string;
  initialLocation?: string;
}

export const SearchBar = ({
  onSearch,
  onFilterChange = () => { },
  popularSkills = [],
  showAI = false,
  onAIToggle,
  initialQuery = "",
  initialLocation = ""
}: SearchBarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [filters, setFilters] = useState<string[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query, location);
  };

  const handleAIToggle = (enabled: boolean) => {
    if (!user && enabled) {
      navigate("/auth");
      return;
    }
    onAIToggle?.(enabled);
  };

  const addFilter = (filter: string) => {
    if (!filters.includes(filter)) {
      const newFilters = [...filters, filter];
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const removeFilter = (filter: string) => {
    const newFilters = filters.filter(f => f !== filter);
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePopularSkillClick = (skill: string) => {
    setQuery(skill);
    onSearch(skill, location);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search skills, interests, or help needed..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative w-full md:w-64">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button type="submit" className="w-full md:w-auto">
          Search
        </Button>

        {onAIToggle && (
          <div className="flex items-center space-x-2">
            <Switch
              id="ai-mode"
              checked={showAI}
              onCheckedChange={handleAIToggle}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="ai-mode">AI Suggestions</Label>
              {!user && (
                <Lock className="w-4 h-4 text-gray-500" aria-label="Login required for AI search" />
              )}
            </div>
          </div>
        )}
      </div>

      {!user && showAI && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
          Please <Button variant="link" className="px-1 py-0 h-auto" onClick={() => navigate("/auth")}>sign in</Button>
          to use AI-powered expert search and get personalized recommendations.
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeFilter(filter)}
            >
              {filter}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {popularSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Popular:</span>
          {popularSkills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => handlePopularSkillClick(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </form>
  );
};

