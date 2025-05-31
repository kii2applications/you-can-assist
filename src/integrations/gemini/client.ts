import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface SelfHelpSuggestion {
    title: string;
    steps: string[];
    resources?: string[];
}

interface EnhancedSearchResult {
    spellCorrection?: string;
    relatedTerms: string[];
}

interface ExpertInfo {
    name: string;
    expertise: string;
    platform: string;
    profileUrl?: string;
    profilePicture?: string;
    content: {
        type: 'video' | 'article' | 'course' | 'social';
        title: string;
        url?: string;
        description: string;
    }[];
}

interface ExpertRecommendations {
    query: string;
    experts: ExpertInfo[];
}

// Helper function to extract JSON from Gemini's response
const extractJSON = (text: string): any => {
    try {
        // First, try direct JSON parse
        return JSON.parse(text);
    } catch {
        try {
            // If that fails, try to extract JSON from markdown code blocks
            const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1]);
            }

            // If no code blocks, try to find the first { and last }
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(text.slice(start, end + 1));
            }
        } catch {
            // If all parsing attempts fail, return null
            return null;
        }
    }
    return null;
};

// Get expert recommendations based on search query
export const getExpertRecommendations = async (query: string): Promise<ExpertRecommendations | null> => {
    try {
        const prompt = `Task: Find people who can help with: "${query}"

Instructions:
1. Find up to 10 people in ${query}
2. Include only verifiable experts with actual online presence
3. Include peopple with different specialties and approaches to ${query}
4. For each expert, find their most relevant and helpful content
5. Try to include their profile picture URL if publicly available
6. Ensure all URLs and information are real and accessible
7. Include people from various platforms (YouTube, LinkedIn, X (Twitter), personal websites, etc.)

Return the data in this exact JSON format:
{
    "query": "${query}",
    "experts": [
        {
            "name": "Person Name",
            "expertise": "Their specific expertise in ${query}",
            "platform": "Platform where they can be found",
            "profileUrl": "Their main profile URL",
            "profilePicture": "URL to their profile picture (if available)",
            "content": [
                {
                    "type": "video/article/course/social",
                    "title": "Actual content title",
                    "url": "Direct URL to the content",
                    "description": "How this content helps with ${query}"
                }
            ]
        }
    ]
}

Example response structure (but find real people for ${query}):
{
    "query": "cooking",
    "experts": [
        {
            "name": "Gordon Ramsay",
            "expertise": "Professional Chef, Culinary Expert",
            "platform": "YouTube",
            "profileUrl": "https://www.youtube.com/@gordonramsay",
            "profilePicture": "https://example.com/gordon.jpg",
            "content": [
                {
                    "type": "video",
                    "title": "Ultimate Cooking Tips",
                    "url": "https://www.youtube.com/watch?v=...",
                    "description": "Professional cooking techniques and tips for home cooks"
                }
            ]
        }
    ]
}`;

        console.log('Sending prompt to Gemini:', prompt);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log('Raw Gemini response:', response.text());

        const parsedResponse = extractJSON(response.text());
        console.log('Parsed response:', parsedResponse);

        if (!parsedResponse || !parsedResponse.experts || !Array.isArray(parsedResponse.experts)) {
            console.error('Invalid response structure:', parsedResponse);
            return null;
        }

        // Validate each expert has required fields
        const validExperts = parsedResponse.experts.filter(expert =>
            expert.name &&
            expert.expertise &&
            expert.platform &&
            Array.isArray(expert.content) &&
            expert.content.length > 0
        );

        if (validExperts.length === 0) {
            console.error('No valid experts found in response');
            return null;
        }

        return {
            query: parsedResponse.query,
            experts: validExperts
        };
    } catch (error) {
        console.error('Error getting expert recommendations:', error);
        return null;
    }
};

// Get self-help suggestions based on search query
export const getSelfHelpSuggestions = async (query: string): Promise<SelfHelpSuggestion | null> => {
    try {
        const prompt = `Analyze this search for people request: "${query}"
Return ONLY a JSON object in this exact format (no other text):
{
    "title": "Brief title summarizing the help needed",
    "steps": [
        "Step 1: First actionable step",
        "Step 2: Second actionable step",
        "Step 3: Third actionable step if applicable"
    ],
    "resources": [
        "Relevant resource or tool 1",
        "Relevant resource or tool 2"
    ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const parsedResponse = extractJSON(response.text());

        if (!parsedResponse) {
            throw new Error('Failed to parse AI response');
        }

        return parsedResponse;
    } catch (error) {
        console.error('Error getting self-help suggestions:', error);
        return null;
    }
};

// Get related search terms and handle spelling corrections
export const getEnhancedSearchTerms = async (query: string): Promise<EnhancedSearchResult | null> => {
    try {
        const prompt = `Analyze this search term: "${query}"
Return ONLY a JSON object in this exact format (no other text):
{
    "spellCorrection": "corrected term if needed, otherwise leave empty",
    "relatedTerms": [
        "related term 1",
        "related term 2",
        "related term 3",
        "related term 4"
    ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const parsedResponse = extractJSON(response.text());

        if (!parsedResponse) {
            throw new Error('Failed to parse AI response');
        }

        return parsedResponse;
    } catch (error) {
        console.error('Error getting enhanced search terms:', error);
        return null;
    }
}; 