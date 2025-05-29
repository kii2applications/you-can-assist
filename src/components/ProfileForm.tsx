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
import { Loader2, X, Plus, Youtube, Instagram, Linkedin, Github, Twitter, MessageCircle, ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  userid?: string;
  name: string;
  title?: string;
  location?: string;
  description?: string;
  skills: string[];
  price_preference?: string;
  social_links?: Record<string, string>;
  custom_links?: Array<{title: string; url: string}>;
}

const socialPlatforms = [
  { key: 'youtube', label: 'YouTube', icon: Youtube },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'twitter', label: 'Twitter', icon: Twitter },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

export const ProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newCustomLink, setNewCustomLink] = useState({ title: "", url: "" });
  const [useridAvailable, setUseridAvailable] = useState<boolean | null>(null);
  const [checkingUserid, setCheckingUserid] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);

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

      if (data) {
        setProfile({
          id: data.id,
          userid: data.userid || '',
          name: data.name,
          title: data.title || '',
          location: data.location || '',
          description: data.description || '',
          skills: data.skills || [],
          price_preference: data.price_preference || '',
          social_links: (data.social_links as Record<string, string>) || {},
          custom_links: (data.custom_links as Array<{title: string; url: string}>) || []
        });
      } else {
        setProfile({
          id: user.id,
          userid: '',
          name: user.email?.split('@')[0] || 'New User',
          title: '',
          location: '',
          description: '',
          skills: [],
          price_preference: '',
          social_links: {},
          custom_links: []
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const checkUseridAvailability = async (userid: string) => {
    if (!userid.trim() || userid === profile?.userid) {
      setUseridAvailable(null);
      return;
    }

    setCheckingUserid(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('userid', userid.toLowerCase())
        .maybeSingle();

      if (error) throw error;
      setUseridAvailable(!data);
    } catch (error) {
      setUseridAvailable(false);
    } finally {
      setCheckingUserid(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    // Validate userid format
    if (profile.userid && !/^[a-zA-Z0-9_.-]+$/.test(profile.userid)) {
      toast({
        title: "Invalid Username",
        description: "Username can only contain letters, numbers, dots, hyphens, and underscores.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          userid: profile.userid?.toLowerCase() || null,
          name: profile.name,
          title: profile.title,
          location: profile.location,
          description: profile.description,
          skills: profile.skills,
          price_preference: profile.price_preference,
          social_links: profile.social_links,
          custom_links: profile.custom_links,
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

  const addCustomLink = () => {
    if (newCustomLink.title.trim() && newCustomLink.url.trim() && profile) {
      setProfile({
        ...profile,
        custom_links: [...(profile.custom_links || []), { ...newCustomLink }]
      });
      setNewCustomLink({ title: "", url: "" });
    }
  };

  const removeCustomLink = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        custom_links: profile.custom_links?.filter((_, i) => i !== index) || []
      });
    }
  };

  const shareProfile = async () => {
    const profileUrl = profile?.userid 
      ? `${window.location.origin}/@${user.id}`
      : `${window.location.origin}/connect/${profile?.userid}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name}'s Profile on Kii2Connect`,
          text: `Check out ${profile?.name}'s profile and skills on Kii2Connect`,
          url: profileUrl,
        });
      } catch (error) {
        await navigator.clipboard.writeText(profileUrl);
        setProfileCopied(true);
        setTimeout(() => setProfileCopied(false), 2000);
        toast({
          title: "Profile link copied!",
          description: "Share this link with others to show your profile."
        });
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      setProfileCopied(true);
      setTimeout(() => setProfileCopied(false), 2000);
      toast({
        title: "Profile link copied!",
        description: "Share this link with others to show your profile."
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
    <div className="pb-20">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Complete Your Profile</CardTitle>
            <Button onClick={shareProfile} variant="outline" size="sm">
              {profileCopied ? <Check className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              {profileCopied ? "Copied!" : "Share Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userid">Username (for sharing)</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</div>
                <Input
                  id="userid"
                  value={profile.userid || ''}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setProfile({ ...profile, userid: value });
                    checkUseridAvailability(value);
                  }}
                  placeholder="your-username"
                  className="pl-8"
                />
              </div>
              {checkingUserid && <Loader2 className="w-4 h-4 animate-spin mt-3" />}
            </div>
            {profile.userid && (
              <div className="text-sm">
                {useridAvailable === true && (
                  <p className="text-green-600">✓ Username available</p>
                )}
                {useridAvailable === false && (
                  <p className="text-red-600">✗ Username already taken</p>
                )}
                <p className="text-gray-500">
                  Your profile will be: {window.location.origin}/@{profile.userid}
                </p>
              </div>
            )}
          </div>

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

          <div className="space-y-4">
            <Label>Social Media & Contact</Label>
            <div className="space-y-3">
              {socialPlatforms.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <Input
                      placeholder={key === 'whatsapp' ? 'Your WhatsApp number (with country code)' : `Your ${label} profile URL`}
                      value={profile.social_links?.[key] || ''}
                      onChange={(e) => updateSocialLink(key, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Custom Links</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Link title (e.g., My Portfolio)"
                value={newCustomLink.title}
                onChange={(e) => setNewCustomLink({ ...newCustomLink, title: e.target.value })}
              />
              <Input
                placeholder="URL"
                value={newCustomLink.url}
                onChange={(e) => setNewCustomLink({ ...newCustomLink, url: e.target.value })}
              />
              <Button type="button" onClick={addCustomLink} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {profile.custom_links?.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <span className="font-medium">{link.title}</span>
                    <span className="text-gray-500 ml-2 text-sm">{link.url}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomLink(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Add custom links to showcase your work, portfolio, or other relevant pages
            </p>
          </div>

          <Button 
            onClick={updateProfile} 
            disabled={loading || (profile.userid && useridAvailable === false)} 
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
