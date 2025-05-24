
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star } from "lucide-react";

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
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      <CardContent className="p-6 -mt-16 relative">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg mb-4">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-bold text-xl text-gray-900 mb-1">{user.name}</h3>
          <p className="text-purple-600 font-medium mb-2">{user.title}</p>
          
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {user.location}
          </div>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{user.rating}</span>
              <span className="text-gray-500 text-sm ml-1">({user.reviewCount})</span>
            </div>
            {user.price && (
              <span className="ml-4 text-green-600 font-semibold">{user.price}</span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{user.description}</p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {user.skills.slice(0, 4).map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 transition-colors"
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
        </div>
      </CardContent>
    </Card>
  );
};
