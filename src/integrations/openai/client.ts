import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Note: In production, proxy these requests through your backend
});

// Get self-help suggestions based on search query
export const getSelfHelpSuggestions = async (query: string) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant providing concise self-help suggestions. Focus on actionable steps and resources."
                },
                {
                    role: "user",
                    content: `I need help with: ${query}. Please provide 2-3 quick self-help suggestions.`
                }
            ],
            max_tokens: 150
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error getting self-help suggestions:', error);
        return null;
    }
};

// Get related search terms and handle spelling corrections
export const getEnhancedSearchTerms = async (query: string) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a search enhancement assistant. Provide related terms and correct spelling mistakes."
                },
                {
                    role: "user",
                    content: `Original search: ${query}. Please provide: 1) Spelling correction if needed 2) 3-4 related search terms.`
                }
            ],
            max_tokens: 100
        });

        const response = completion.choices[0].message.content;
        return {
            original: query,
            suggestions: response
        };
    } catch (error) {
        console.error('Error getting enhanced search terms:', error);
        return {
            original: query,
            suggestions: null
        };
    }
}; 