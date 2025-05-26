
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";

interface ConnectionRequest {
  id: string;
  skill: string;
  message: string | null;
  status: string;
  created_at: string;
  requester_profile?: {
    name: string;
    avatar_url: string | null;
  } | null;
  helper_profile?: {
    name: string;
    avatar_url: string | null;
  } | null;
}

export const ConnectionRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      // Fetch incoming requests (where user is the helper)
      const { data: incoming, error: incomingError } = await supabase
        .from('connection_requests')
        .select(`
          *,
          requester_profile:profiles!connection_requests_requester_id_fkey(name, avatar_url)
        `)
        .eq('helper_id', user.id)
        .order('created_at', { ascending: false });

      if (incomingError) {
        console.error('Error fetching incoming requests:', incomingError);
        // Fallback: fetch without profile data
        const { data: incomingFallback, error: fallbackError } = await supabase
          .from('connection_requests')
          .select('*')
          .eq('helper_id', user.id)
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        setIncomingRequests((incomingFallback || []).map(req => ({
          ...req,
          requester_profile: null
        })));
      } else {
        // Process the data to handle potential join errors
        const processedIncoming = (incoming || []).map(req => ({
          ...req,
          requester_profile: req.requester_profile && 
            req.requester_profile !== null && 
            typeof req.requester_profile === 'object' && 
            'name' in req.requester_profile 
            ? req.requester_profile 
            : null
        }));
        setIncomingRequests(processedIncoming);
      }

      // Fetch outgoing requests (where user is the requester)
      const { data: outgoing, error: outgoingError } = await supabase
        .from('connection_requests')
        .select(`
          *,
          helper_profile:profiles!connection_requests_helper_id_fkey(name, avatar_url)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (outgoingError) {
        console.error('Error fetching outgoing requests:', outgoingError);
        // Fallback: fetch without profile data
        const { data: outgoingFallback, error: fallbackError } = await supabase
          .from('connection_requests')
          .select('*')
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        setOutgoingRequests((outgoingFallback || []).map(req => ({
          ...req,
          helper_profile: null
        })));
      } else {
        // Process the data to handle potential join errors
        const processedOutgoing = (outgoing || []).map(req => ({
          ...req,
          helper_profile: req.helper_profile && 
            req.helper_profile !== null && 
            typeof req.helper_profile === 'object' && 
            'name' in req.helper_profile 
            ? req.helper_profile 
            : null
        }));
        setOutgoingRequests(processedOutgoing);
      }
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

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'accepted' ? "Request Accepted" : "Request Declined",
        description: `You have ${action} the help request.`
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">
            Incoming Requests ({incomingRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            My Requests ({outgoingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-4">
          {incomingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No incoming requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            incomingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Help request for: {request.skill}
                      </CardTitle>
                      <CardDescription>
                        From {request.requester_profile?.name || 'Unknown user'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {request.message && (
                    <p className="text-gray-600 mb-4">"{request.message}"</p>
                  )}
                  <p className="text-sm text-gray-500 mb-4">
                    Requested on {new Date(request.created_at).toLocaleDateString()}
                  </p>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestAction(request.id, 'declined')}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          {outgoingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">You haven't sent any requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            outgoingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Request for: {request.skill}
                      </CardTitle>
                      <CardDescription>
                        To {request.helper_profile?.name || 'Unknown user'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {request.message && (
                    <p className="text-gray-600 mb-4">Your message: "{request.message}"</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Sent on {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
