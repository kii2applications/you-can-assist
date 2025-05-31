import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: string[]) => void;
  popularSkills?: string[];
  showAI: boolean;
  onAIToggle: (enabled: boolean) => void;
  initialQuery?: string;
}

export const SearchBar = ({
  onSearch,
  onFilterChange = () => { },
  popularSkills = [],
  showAI = true,
  onAIToggle,
  initialQuery = ""
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    if (selectedFilters.length > 0) {
      onFilterChange(selectedFilters);
    }
  };

  const addFilter = (skill: string) => {
    if (!selectedFilters.includes(skill)) {
      const newFilters = [...selectedFilters, skill];
      setSelectedFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const removeFilter = (skill: string) => {
    const newFilters = selectedFilters.filter(f => f !== skill);
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="w-full space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search by skills, location, or expertise..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="ai-mode"
            checked={showAI}
            onCheckedChange={onAIToggle}
            defaultChecked={true}
          />
          <label
            htmlFor="ai-mode"
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            AI Recommendations
          </label>
        </div>
      </form>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
          {selectedFilters.map((filter) => (
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
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addFilter(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

