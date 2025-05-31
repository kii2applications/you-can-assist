import { useState, useEffect } from 'react';
import { DiscoveryFeed } from '@/components/DiscoveryFeed';
import { SearchBar } from '@/components/SearchBar';
import { getExpertRecommendations } from '@/integrations/gemini/client';

const popularSkills = [
    'Cooking', 'Programming', 'Guitar', 'Language Learning',
    'Fitness', 'Career Advice', 'Photography', 'Writing'
];

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<string[]>([]);
    const [showAI, setShowAI] = useState(true);
    const [aiExperts, setAiExperts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock user data - replace with actual API call
    const users = [
        {
            id: '1',
            name: 'John Doe',
            avatar: '/placeholder-avatar.jpg',
            location: 'San Francisco, CA',
            title: 'Full Stack Developer',
            skills: ['React', 'Node.js', 'TypeScript'],
            rating: 4.8,
            reviewCount: 12,
            description: 'Experienced full stack developer with a focus on React and Node.js',
            price: '$100/hr',
            socialLinks: {},
            customLinks: []
        },
        {
            id: '2',
            name: 'Jane Smith',
            avatar: '/placeholder-avatar.jpg',
            location: 'New York, NY',
            title: 'UX Designer',
            skills: ['UI Design', 'User Research', 'Figma'],
            rating: 4.9,
            reviewCount: 15,
            description: 'Passionate UX designer with expertise in creating intuitive user experiences',
            price: '$90/hr',
            socialLinks: {},
            customLinks: []
        }
    ];

    const handleSearch = async (query: string) => {
        console.log('Search query:', query);
        setSearchQuery(query);

        if (query.trim()) {
            setLoading(true);
            try {
                const result = await getExpertRecommendations(query);
                if (result?.experts) {
                    const transformedExperts = result.experts.map((expert: any) => ({
                        id: expert.profileUrl || expert.name,
                        name: expert.name,
                        avatar: '/placeholder-avatar.jpg',
                        location: expert.platform || 'Online',
                        title: expert.expertise,
                        skills: expert.expertise.split(',').map((s: string) => s.trim()),
                        rating: 5,
                        reviewCount: 0,
                        description: expert.content[0]?.description || '',
                        price: 'Contact for pricing',
                        socialLinks: {
                            profile: expert.profileUrl
                        },
                        customLinks: expert.content.map((c: any) => ({
                            title: c.title,
                            url: c.url
                        })),
                        isAIRecommended: true,
                        platform: expert.platform,
                        profileUrl: expert.profileUrl
                    }));
                    console.log('Setting AI experts:', transformedExperts);
                    setAiExperts(transformedExperts);
                }
            } catch (error) {
                console.error('Error fetching AI experts:', error);
                setAiExperts([]);
            } finally {
                setLoading(false);
            }
        } else {
            setAiExperts([]);
        }
    };

    const handleAIToggle = (enabled: boolean) => {
        console.log('AI toggle:', enabled);
        setShowAI(enabled);
        if (!enabled) {
            setAiExperts([]); // Clear AI experts when AI is disabled
        } else if (searchQuery.trim()) {
            // Refresh AI experts if there's an existing search query
            handleSearch(searchQuery);
        }
    };

    // Initial search if needed
    useEffect(() => {
        if (searchQuery.trim() && showAI) {
            handleSearch(searchQuery);
        }
    }, []);

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <SearchBar
                            onSearch={handleSearch}
                            onFilterChange={setFilters}
                            popularSkills={popularSkills}
                            showAI={showAI}
                            onAIToggle={handleAIToggle}
                        />
                        {loading && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Loading AI recommendations...
                            </div>
                        )}
                    </div>

                    <DiscoveryFeed
                        users={users}
                        aiExperts={aiExperts}
                        searchQuery={searchQuery}
                        filters={filters}
                        showAI={showAI}
                    />
                </div>
            </div>
        </main>
    );
} 