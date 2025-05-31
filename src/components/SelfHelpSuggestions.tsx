import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Lightbulb, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { getSelfHelpSuggestions } from '@/integrations/gemini/client';
import { Button } from '@/components/ui/button';

interface SelfHelpSuggestionsProps {
    searchQuery: string;
    showAI: boolean;
}

interface SelfHelpSuggestion {
    title: string;
    steps: string[];
    resources?: string[];
}

export const SelfHelpSuggestions = ({ searchQuery, showAI }: SelfHelpSuggestionsProps) => {
    const [suggestions, setSuggestions] = useState<SelfHelpSuggestion | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery.trim() || !showAI) {
                setSuggestions(null);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                console.log('Fetching self-help suggestions for query:', searchQuery);
                const result = await getSelfHelpSuggestions(searchQuery);
                console.log('Self-help suggestions result:', result);

                if (!result) {
                    setError('No suggestions found');
                    setSuggestions(null);
                } else {
                    setSuggestions(result);
                    setError(null);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setError('Failed to load suggestions');
                setSuggestions(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [searchQuery, showAI]);

    if (!searchQuery.trim() || !showAI) return null;

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    AI Tips
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="h-6 px-2 text-gray-500"
                >
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
            </div>

            {expanded && (
                <Card className="p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 border-none">
                    {loading ? (
                        <p className="text-xs text-gray-600 dark:text-gray-400">Loading suggestions...</p>
                    ) : error ? (
                        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <p>{error}</p>
                        </div>
                    ) : suggestions ? (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {suggestions.title}
                            </h4>
                            <div className="space-y-1">
                                {suggestions.steps.map((step, index) => (
                                    <p key={index} className="text-xs text-gray-700 dark:text-gray-300">
                                        {step}
                                    </p>
                                ))}
                            </div>
                            {suggestions.resources && suggestions.resources.length > 0 && (
                                <div className="mt-2">
                                    <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                                        Resources:
                                    </h5>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        {suggestions.resources.map((resource, index) => (
                                            <li key={index} className="text-xs text-gray-700 dark:text-gray-300">
                                                {resource}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-600 dark:text-gray-400">No suggestions available</p>
                    )}
                </Card>
            )}
        </div>
    );
}; 