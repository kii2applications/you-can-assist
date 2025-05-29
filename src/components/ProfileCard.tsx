
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Heart, Youtube, Instagram, Linkedin, Github, Twitter, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import { ConnectionRequestDialog } from "./ConnectionRequestDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    location: string;
    title: string;
    skills: string[];
    rating: number;
    reviewCount: number;
    description: string;
    price?: string;
    socialLinks?: Record<string, string>;
    customLinks?: Array<{title: string; url: string}>;
  };
}

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return <Youtube className="w-4 h-4" />;
    case 'instagram':
      return <Instagram className="w-4 h-4" />;
    case 'linkedin':
      return <Linkedin className="w-4 h-4" />;
    case 'github':
      return <Github className="w-4 h-4" />;
    case 'twitter':
      return <Twitter className="w-4 h-4" />;
    case 'whatsapp':
      return <MessageCircle className="w-4 h-4" />;
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
};

export const ProfileCard = ({ user }: ProfileCardProps) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name}'s Profile on Kii2Connect`,
          text: `Check out ${user.name}'s profile and skills on Kii2Connect`,
          url: profileUrl,
        });
      } catch (error) {
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: "Profile link copied!",
          description: "Share this link with others."
        });
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Profile link copied!",
        description: "Share this link with others."
      });
    }
  };

  const formatWhatsAppLink = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  const formatSocialLink = (platform: string, url: string) => {
    if (platform === 'whatsapp') {
      return formatWhatsAppLink(url);
    }
    return url.startsWith('http') ? url : `https://${url}`;
  };
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="relative h-32 bg-gradient-to-br from-blue-400 via-green-400 to-teal-400">
        <div className="absolute inset-0 bg-black/20"></div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={shareProfile}
        >
          <Share2 className="w-4 h-4 text-white" />
        </Button>
      </div>
      
      <CardContent className="p-6 -mt-16 relative">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 border-4 border-white dark:border-gray-800 shadow-lg mb-4">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-green-500 text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-1">{user.name}</h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">{user.title}</p>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {user.location}
          </div>
          
          <div className="flex items-center justify-center mb-4 space-x-4">
            <div className="flex items-center">
              <Heart className="w-4 h-4 fill-red-400 text-red-400 mr-1" />
              <span className="font-medium text-gray-900 dark:text-gray-100">{user.rating}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">({user.reviewCount} helped)</span>
            </div>
          </div>

          {user.price && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg p-3 mb-4 w-full">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prefers:</div>
              <div className="text-green-700 dark:text-green-400 font-semibold">{user.price}</div>
            </div>
          )}
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{user.description}</p>
          
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {user.skills.slice(0, 4).map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/50 dark:to-green-900/50 text-blue-700 dark:text-blue-300 hover:from-blue-200 hover:to-green-200 dark:hover:from-blue-800/50 dark:hover:to-green-800/50 transition-colors"
              >
                {skill}
              </Badge>
            ))}
            {user.skills.length > 4 && (
              <Badge variant="outline" className="text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                +{user.skills.length - 4} more
              </Badge>
            )}
          </div>

          {/* Social Media Links */}
          {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
            <div className="mb-4 w-full">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connect with me:</h4>
              <div className="flex justify-center gap-2 flex-wrap">
                {Object.entries(user.socialLinks).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={formatSocialLink(platform, url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs"
                    >
                      {getSocialIcon(platform)}
                      <span className="capitalize">{platform}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Custom Links */}
          {user.customLinks && user.customLinks.length > 0 && (
            <div className="mb-4 w-full">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Links:</h4>
              <div className="flex justify-center gap-2 flex-wrap">
                {user.customLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 transition-colors text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {currentUser && currentUser.id !== user.id && (
            <ConnectionRequestDialog
              helper={{
                id: user.id,
                name: user.name,
                skills: user.skills
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
