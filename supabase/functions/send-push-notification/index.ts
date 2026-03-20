import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import * as webpush from "https://esm.sh/web-push@3.6.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { title, body, url, subscriptions } = await req.json()

        const publicKey = Deno.env.get("VAPID_PUBLIC_KEY")
        const privateKey = Deno.env.get("VAPID_PRIVATE_KEY")

        if (!publicKey || !privateKey) {
            throw new Error("VAPID keys not configured in Edge Function secrets")
        }

        webpush.setVapidDetails(
            'mailto:admin@kii2connect.com',
            publicKey,
            privateKey
        )

        const notifications = subscriptions.map((sub: any) => {
            return webpush.sendNotification(
                sub,
                JSON.stringify({ title, body, url })
            ).catch((err: any) => {
                console.error('Error sending notification to one subscription:', err)
                return null
            })
        })

        await Promise.all(notifications)

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('Edge Function Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
