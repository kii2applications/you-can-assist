
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ConnectionRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select(`
          *,
          requester_profile:profiles!requester_id(*),
          helper_profile:profiles!helper_id(*)
        `)
        .or(`requester_id.eq.${user.id},helper_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('connection_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: `Request ${status}`,
        description: `The connection request has been ${status}.`,
      });

      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  const incomingRequests = requests.filter(req => req.helper_id === user?.id && req.status === 'pending');
  const outgoingRequests = requests.filter(req => req.requester_id === user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Incoming Requests
        </h2>
        {incomingRequests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No incoming requests</p>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      {req.requester_profile?.name || 'Unknown User'}
                    </div>
                    <Badge variant="outline">
                      <Clock className="w-4 h-4 mr-1" />
                      Pending
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{req.message}</p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateRequestStatus(req.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateRequestStatus(req.id, 'rejected')}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Your Requests
        </h2>
        {outgoingRequests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No outgoing requests</p>
        ) : (
          <div className="space-y-4">
            {outgoingRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      {req.helper_profile?.name || 'Unknown User'}
                    </div>
                    <Badge
                      variant={req.status === 'pending' ? 'outline' :
                        req.status === 'accepted' ? 'default' : 'destructive'}
                    >
                      {req.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                      {req.status === 'accepted' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {req.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{req.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
