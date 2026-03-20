import { supabase } from "@/integrations/supabase/client";

export const sendNotificationToUser = async (recipientId: string, title: string, body: string, url: string = '/') => {
    try {
        // In a real implementation with a backend, we might just call a Supabase Edge Function
        // that handles the actual push sending using web-push library and VAPID keys.

        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions' as any)
            .select('subscription')
            .eq('user_id', recipientId);

        if (error) {
            console.error('Error fetching subscriptions:', error);
            return;
        }

        if (!subscriptions || (subscriptions as any[]).length === 0) {
            console.log('No push subscriptions found for user:', recipientId);
            return;
        }

        // Call our Supabase Edge Function to send the push
        const { error: edgeFunctionError } = await supabase.functions.invoke('send-push-notification', {
            body: {
                recipientId,
                title,
                body,
                url,
                subscriptions: (subscriptions as any[]).map(s => s.subscription)
            }
        });

        if (edgeFunctionError) {
            console.warn('Edge function not yet deployed or error occurred:', edgeFunctionError);
            // Fallback: we could show a real-time toast if we had a channel
        }
    } catch (error) {
        console.error('Error in sendNotificationToUser:', error);
    }
};
