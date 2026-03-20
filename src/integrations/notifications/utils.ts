import { supabase } from "@/integrations/supabase/client";

export const sendNotificationToUser = async (recipientId: string, title: string, body: string, url: string = '/') => {
    try {
        // In a real implementation with a backend, we might just call a Supabase Edge Function
        // that handles the actual push sending using web-push library and VAPID keys.

        console.log('Push: Fetching subscriptions for recipient:', recipientId);
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions' as any)
            .select('subscription')
            .eq('user_id', recipientId);

        if (error) {
            console.error('Push: Error fetching subscriptions:', error);
            return;
        }

        if (!subscriptions || (subscriptions as any[]).length === 0) {
            console.log('Push: No push subscriptions found for recipient:', recipientId);
            return;
        }

        console.log(`Push: Found ${subscriptions.length} subscriptions. Triggering Edge Function...`);

        // Call our Supabase Edge Function to send the push
        const { data, error: edgeFunctionError } = await supabase.functions.invoke('send-push-notification', {
            body: {
                recipientId,
                title,
                body,
                url,
                subscriptions: (subscriptions as any[]).map(s => s.subscription)
            }
        });

        if (edgeFunctionError) {
            console.warn('Push: Edge function error:', edgeFunctionError);
        } else {
            console.log('Push: Edge function response:', data);
        }
    } catch (error) {
        console.error('Error in sendNotificationToUser:', error);
    }
};
