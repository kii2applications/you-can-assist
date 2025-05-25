
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { HandHeart, Loader2 } from "lucide-react";

interface ConnectionRequestDialogProps {
  helper: {
    id: string;
    name: string;
    skills: string[];
  };
}

export const ConnectionRequestDialog = ({ helper }: ConnectionRequestDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const skillToRequest = selectedSkill === "custom" ? customSkill : selectedSkill;
    
    if (!skillToRequest.trim()) {
      toast({
        title: "Error",
        description: "Please select or enter a skill",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          requester_id: user.id,
          helper_id: helper.id,
          skill: skillToRequest,
          message: message || null
        });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: `Your request for help with ${skillToRequest} has been sent to ${helper.name}.`
      });

      setOpen(false);
      setSelectedSkill("");
      setCustomSkill("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate") 
          ? "You've already sent a request for this skill to this person"
          : error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
          <HandHeart className="w-4 h-4 mr-2" />
          Request Help
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Help from {helper.name}</DialogTitle>
          <DialogDescription>
            Send a request for help with a specific skill. They'll be able to accept or decline your request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill">What do you need help with?</Label>
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill..." />
              </SelectTrigger>
              <SelectContent>
                {helper.skills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Something else...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedSkill === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customSkill">Specify the skill</Label>
              <Input
                id="customSkill"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="e.g., cooking pasta, fixing bicycle"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them more about what you need help with..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              disabled={loading || !selectedSkill || (selectedSkill === "custom" && !customSkill.trim())}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
