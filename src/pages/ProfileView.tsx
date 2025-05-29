
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface Profile {
  id: string;
  userid?: string;
  name: string;
  avatar_url?: string;
  location?: string;
  title?: string;
  skills: string[];
  rating: number;
  review_count: number;
  description?: string;
  price_preference?: string;
  social_links?: Record<string, string>;
  custom_links?: Array<{title: string; url: string}>;
}

const ProfileView = () => {
  const { userId, userid } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId || userid) {
      fetchProfile();
    }
  }, [userId, userid]);

  const fetchProfile = async () => {
    try {
      let query = supabase.from('profiles').select('*');
      
      if (userid) {
        // Handle @username route
        query = query.eq('userid', userid);
      } else if (userId) {
        // Handle /profile/uuid route
        query = query.eq('id', userId);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Transform the data to match our Profile interface
        const transformedProfile: Profile = {
          id: data.id,
          userid: data.userid,
          name: data.name,
          avatar_url: data.avatar_url,
          location: data.location,
          title: data.title,
          skills: data.skills || [],
          rating: Number(data.rating) || 0,
          review_count: data.review_count || 0,
          description: data.description,
          price_preference: data.price_preference,
          social_links: (data.social_links as Record<string, string>) || {},
          custom_links: (data.custom_links as Array<{title: string; url: string}>) || []
        };
        setProfile(transformedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center safe-area-inset-top">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center safe-area-inset-top">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const transformedProfile = {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar_url || '',
    location: profile.location || 'Location not set',
    title: profile.title || 'Helper',
    skills: profile.skills || [],
    rating: Number(profile.rating) || 0,
    reviewCount: profile.review_count || 0,
    description: profile.description || 'Happy to help!',
    price: profile.price_preference,
    socialLinks: profile.social_links || {},
    customLinks: profile.custom_links || []
  };

  const profileUrl = profile.userid 
    ? `${window.location.origin}/@${profile.id}`
    : `${window.location.origin}/connect/${profile.userid}`;

  return (
    <>
      <Helmet>
        <title>{profile.name} - {profile.title || 'Helper'} | Kii2Connect</title>
        <meta name="description" content={`Connect with ${profile.name}, ${profile.title || 'a helpful community member'} in ${profile.location || 'your area'}. ${profile.description || 'Ready to help with various skills and services.'}`} />
        <meta name="keywords" content={`${profile.name}, ${profile.skills?.join(', ')}, community help, skill sharing, ${profile.location}, Kii2Connect`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`${profile.name} - ${profile.title || 'Helper'} | Kii2Connect`} />
        <meta property="og:description" content={`Connect with ${profile.name}, ${profile.title || 'a helpful community member'} in ${profile.location || 'your area'}. Skills: ${profile.skills?.slice(0, 3).join(', ')}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={profileUrl} />
        <meta property="og:image" content={profile.avatar_url || `${window.location.origin}/lovable-uploads/090ce9d9-42be-47cc-9f82-9287adf4e57b.png`} />
        <meta property="profile:first_name" content={profile.name.split(' ')[0]} />
        <meta property="profile:last_name" content={profile.name.split(' ').slice(1).join(' ')} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${profile.name} - ${profile.title || 'Helper'} | Kii2Connect`} />
        <meta name="twitter:description" content={`Connect with ${profile.name} for help with ${profile.skills?.slice(0, 2).join(' and ')}`} />
        <meta name="twitter:image" content={profile.avatar_url || `${window.location.origin}/lovable-uploads/090ce9d9-42be-47cc-9f82-9287adf4e57b.png`} />
        
        {/* Structured data for Google */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": profile.name,
            "jobTitle": profile.title,
            "description": profile.description,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": profile.location
            },
            "knows": profile.skills?.map(skill => ({
              "@type": "Thing",
              "name": skill
            })),
            "url": profileUrl,
            "image": profile.avatar_url
          })}
        </script>
        
        <link rel="canonical" href={profileUrl} />
        
        {/* PWA Safe Area */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </Helmet>
      
      <div className="min-h-screen safe-area-inset-top pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ProfileCard user={transformedProfile} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileView;
