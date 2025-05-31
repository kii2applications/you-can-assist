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
    customLinks?: Array<{ title: string; url: string }>;
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
    <Card className="w-full overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-xl">
      <div className="relative h-32 bg-gradient-to-r from-blue-400 to-green-400">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            shareProfile();
          }}
        >
          <Share2 className="w-4 h-4 text-white" />
        </Button>
      </div>

      <CardContent className="p-6 -mt-16 relative">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg mb-4">
            <AvatarImage src={user.avatar || ''} alt={user.name} />
            <AvatarFallback className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <h3 className="font-bold text-2xl text-gray-900 dark:text-gray-100 mb-1">{user.name}</h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">{user.title}</p>

          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            {user.location}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {user.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 text-gray-800 dark:text-gray-200"
              >
                {skill}
              </Badge>
            ))}
          </div>

          <div className="w-full p-4 mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
            <p className="text-gray-700 dark:text-gray-300">{user.description}</p>
          </div>

          {(user.rating > 0 || user.reviewCount > 0) && (
            <div className="flex items-center justify-center mb-6 space-x-4">
              {user.rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{user.rating}</span>
                </div>
              )}
              {user.reviewCount > 0 && (
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-red-400 mr-1" />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {user.reviewCount} helped
                  </span>
                </div>
              )}
            </div>
          )}

          {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
            <div className="w-full mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Connect with me:</h4>
              <div className="flex justify-center gap-2 flex-wrap">
                {Object.entries(user.socialLinks).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={formatSocialLink(platform, url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/50 dark:hover:to-gray-500/50 transition-colors"
                    >
                      {getSocialIcon(platform)}
                      <span className="capitalize">{platform}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {user.customLinks && user.customLinks.length > 0 && (
            <div className="w-full mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Additional Links:</h4>
              <div className="flex justify-center gap-2 flex-wrap">
                {user.customLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {currentUser && currentUser.id !== user.id && (
            <div className="w-full">
              <ConnectionRequestDialog
                helper={{
                  id: user.id,
                  name: user.name,
                  skills: user.skills
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
