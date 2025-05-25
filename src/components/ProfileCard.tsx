
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Heart } from "lucide-react";
import { ConnectionRequestDialog } from "./ConnectionRequestDialog";
import { useAuth } from "@/hooks/useAuth";

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
  };
}

export const ProfileCard = ({ user }: ProfileCardProps) => {
  const { user: currentUser } = useAuth();
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-blue-400 via-green-400 to-teal-400">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      <CardContent className="p-6 -mt-16 relative">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg mb-4">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-green-500 text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-bold text-xl text-gray-900 mb-1">{user.name}</h3>
          <p className="text-blue-600 font-medium mb-2">{user.title}</p>
          
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {user.location}
          </div>
          
          <div className="flex items-center justify-center mb-4 space-x-4">
            <div className="flex items-center">
              <Heart className="w-4 h-4 fill-red-400 text-red-400 mr-1" />
              <span className="font-medium">{user.rating}</span>
              <span className="text-gray-500 text-sm ml-1">({user.reviewCount} helped)</span>
            </div>
          </div>

          {user.price && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-4 w-full">
              <div className="text-sm text-gray-600 mb-1">Prefers:</div>
              <div className="text-green-700 font-semibold">{user.price}</div>
            </div>
          )}
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{user.description}</p>
          
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {user.skills.slice(0, 4).map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 hover:from-blue-200 hover:to-green-200 transition-colors"
              >
                {skill}
              </Badge>
            ))}
            {user.skills.length > 4 && (
              <Badge variant="outline" className="text-gray-500">
                +{user.skills.length - 4} more
              </Badge>
            )}
          </div>

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
