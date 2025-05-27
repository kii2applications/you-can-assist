
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, X, Plus, Youtube, Instagram, Linkedin, Github, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  title?: string;
  location?: string;
  description?: string;
  skills: string[];
  price_preference?: string;
  social_links?: Record<string, string>;
}

const socialPlatforms = [
  { key: 'youtube', label: 'YouTube', icon: Youtube },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'twitter', label: 'Twitter', icon: Twitter },
];

export const ProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data || {
        id: user.id,
        name: user.email?.split('@')[0] || 'New User',
        title: '',
        location: '',
        description: '',
        skills: [],
        price_preference: '',
        social_links: {}
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          title: profile.title,
          location: profile.location,
          description: profile.description,
          skills: profile.skills,
          price_preference: profile.price_preference,
          social_links: profile.social_links,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && profile && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: profile.skills.filter(skill => skill !== skillToRemove)
      });
    }
  };

  const updateSocialLink = (platform: string, url: string) => {
    if (profile) {
      setProfile({
        ...profile,
        social_links: {
          ...profile.social_links,
          [platform]: url
        }
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title/Profession</Label>
            <Input
              id="title"
              value={profile.title || ''}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              placeholder="e.g., Software Developer, Teacher"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={profile.location || ''}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            placeholder="City, State or Region"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">About You</Label>
          <Textarea
            id="description"
            value={profile.description || ''}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            placeholder="Tell others about yourself, what you're passionate about, and how you like to help..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Skills & Interests</Label>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill or interest"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="cursor-pointer">
                {skill}
                <X 
                  className="w-3 h-3 ml-1 hover:text-red-500" 
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preferred Exchange</Label>
          <Input
            id="price"
            value={profile.price_preference || ''}
            onChange={(e) => setProfile({ ...profile, price_preference: e.target.value })}
            placeholder="e.g., Free, Coffee/meal, Skill trade, $20/hour"
          />
        </div>

        {/* Social Media Links Section */}
        <div className="space-y-4">
          <Label>Social Media Showcase</Label>
          <div className="space-y-3">
            {socialPlatforms.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <Input
                    placeholder={`Your ${label} profile URL`}
                    value={profile.social_links?.[key] || ''}
                    onChange={(e) => updateSocialLink(key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Add your social media profiles to showcase your work and connect with others
          </p>
        </div>

        <Button onClick={updateProfile} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
};
