import { Card } from '@/components/ui/card';
import { Lightbulb, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SelfHelpSuggestionsProps {
    searchQuery: string;
    searchResults: {
        spellCorrection?: string;
        relatedTerms: string[];
    } | null;
    isOpen: boolean;
    onToggle: () => void;
    onSearch: (query: string) => void;
    error?: string | null;
    isLoading?: boolean;
}

export const SelfHelpSuggestions = ({
    searchQuery,
    searchResults,
    isOpen,
    onToggle,
    onSearch,
    error,
    isLoading = false
}: SelfHelpSuggestionsProps) => {
    if (!searchQuery) return null;

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-medium">AI Insights</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={onToggle}>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
            </div>

            {isOpen && (
                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : searchResults ? (
                        <div className="space-y-4">
                            {searchResults.spellCorrection && searchResults.spellCorrection !== searchQuery && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Did you mean: </span>
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto font-medium"
                                        onClick={() => onSearch(searchResults.spellCorrection!)}
                                    >
                                        {searchResults.spellCorrection}
                                    </Button>
                                </div>
                            )}

                            {searchResults.relatedTerms.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Related searches:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {searchResults.relatedTerms.map((term) => (
                                            <Badge
                                                key={term}
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-secondary/80"
                                                onClick={() => onSearch(term)}
                                            >
                                                {term}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                            No AI suggestions available for this search.
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}; 