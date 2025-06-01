import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Debug log for development
if (!GEMINI_API_KEY) {
    console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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
export const getExpertRecommendations = async (searchTerm: string, location?: string): Promise<ExpertRecommendations | null> => {
    try {
        const locationContext = location ? ` in ${location}` : '';
        const prompt = `Task: Find people who can help with: "${searchTerm}"${locationContext}

Instructions:
1. Find at least 10 people who are experts in ${searchTerm}${locationContext}
2. Include only verifiable experts with actual online presence
3. Include people with different specialties and approaches to ${searchTerm}
4. For each expert, find their most relevant and helpful content
5. Try to include their profile picture URL if publicly available
6. Ensure all URLs and information are real and accessible
7. Include people from various platforms (YouTube, LinkedIn, X (Twitter), Instagram, Snapchat, Tiktok, personal websites, etc.)

Return the data in this exact JSON format:
{
    "query": "${searchTerm}",
    "experts": [
        {
            "name": "Person Name",
            "expertise": "Their specific expertise in ${searchTerm}",
            "platform": "Platform where they can be found",
            "profileUrl": "Their main profile URL",
            "profilePicture": "URL to their profile picture (if available)",
            "content": [
                {
                    "type": "video/article/course/social",
                    "title": "Actual content title",
                    "url": "Direct URL to the content",
                    "description": "How this content helps with ${searchTerm}"
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

export const getSearchTermExpansion = async (searchTerm: string): Promise<string[]> => {
    try {
        const prompt = `Given the search term "${searchTerm}", provide a list of closely related terms, skills, and variations that would be relevant in a professional/skills context. Focus on terms that would appear in someone's profile, skills, or job description. Return only an array of terms, no explanations.

Example input: "cook"
Example output: ["cook", "chef", "cooking", "culinary", "food preparation", "kitchen", "baking", "food service"]

Input: "${searchTerm}"
Output:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        let terms: string[] = [];

        try {
            // Try to parse as JSON array first
            terms = JSON.parse(responseText);
        } catch {
            // If not valid JSON, split by commas and clean up
            terms = responseText
                .replace(/[\[\]"']/g, '')
                .split(',')
                .map(term => term.trim().toLowerCase())
                .filter(term => term.length > 0);
        }

        // Add the original search term if not present
        if (!terms.includes(searchTerm.toLowerCase())) {
            terms.unshift(searchTerm.toLowerCase());
        }

        return terms;
    } catch (error) {
        console.error('Error getting search term expansion:', error);
        // Return original term if AI expansion fails
        return [searchTerm.toLowerCase()];
    }
}; 