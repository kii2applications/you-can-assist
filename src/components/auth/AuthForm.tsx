import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from 'react';

// Create a Script component that matches Next.js Script props
const Script = (props: ComponentProps<'script'>) => {
  return <script {...props} />;
};

// Add type declarations for Google One Tap
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (notification?: (resp: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

export const AuthForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Function to handle Google One Tap sign in
  async function handleSignInWithGoogle(response: { credential: string }) {
    try {
      setError(null);
      setMessage(null);
      setLoading(true);

      console.log("Received Google credential, attempting Supabase sign in...");

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      console.log("Sign in successful:", data);
      setMessage("Signed in successfully!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  }

  // Initialize Google One Tap
  useEffect(() => {
    // Load the Google Identity script
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Debug environment variable and Google client availability
      console.log('Environment check:', {
        hasGoogleClient: !!window.google?.accounts?.id,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'not set',
        isDevelopment: import.meta.env.DEV,
        mode: import.meta.env.MODE
      });

      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        console.error('Google Client ID is not set in environment variables');
        return;
      }

      if (window.google?.accounts?.id) {
        try {
          // Initialize Google One Tap
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleSignInWithGoogle,
            auto_select: false,
            use_fedcm_for_prompt: true
          });

          // Render the button
          const buttonDiv = document.getElementById('googleButton');
          if (buttonDiv) {
            window.google.accounts.id.renderButton(buttonDiv, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: '100%',
            });
          } else {
            console.error('Google button container not found');
          }

          // Also show the One Tap prompt with notification callback
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log("One Tap not displayed:", notification.getNotDisplayedReason());
            }
            if (notification.isSkippedMoment()) {
              console.log("One Tap skipped:", notification.getSkippedReason());
            }
            if (notification.isDismissedMoment()) {
              console.log("One Tap dismissed:", notification.getDismissedReason());
            }
          });
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else {
        console.error('Google Identity API not loaded properly');
      }
    };

    script.onerror = (error) => {
      console.error('Error loading Google Identity script:', error);
    };

    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAuth = async (email: string, password: string, isSignUp: boolean, name?: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'New User'
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setMessage("Please check your email for verification link!");
        } else {
          setMessage("Account created successfully!");
          onSuccess?.();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Signed in successfully!");
        onSuccess?.();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 shadow-xl">
      <CardHeader className="space-y-1 px-4 md:px-6 py-4 md:py-6">
        <CardTitle className="text-xl md:text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center text-sm md:text-base">
          Join your community of helpers and learners
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-6 py-2 md:py-4">
        {/* Google Sign In Button Container */}
        <div id="googleButton" className="w-full mb-4 md:mb-6"></div>

        <div className="relative mb-4 md:mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin" className="text-sm md:text-base">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm md:text-base">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-0 space-y-4">
            <SignInForm onSubmit={(email, password) => handleAuth(email, password, false)} loading={loading} />
          </TabsContent>

          <TabsContent value="signup" className="mt-0 space-y-4">
            <SignUpForm onSubmit={(email, password, name) => handleAuth(email, password, true, name)} loading={loading} />
          </TabsContent>
        </Tabs>

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="mt-4">
            <AlertDescription className="text-sm">{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const SignInForm = ({ onSubmit, loading }: { onSubmit: (email: string, password: string) => void; loading: boolean }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="signin-email" className="text-sm md:text-base">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/50 dark:bg-gray-800/50 h-9 md:h-10 text-sm md:text-base"
        />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="signin-password" className="text-sm md:text-base">Password</Label>
        <Input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white/50 dark:bg-gray-800/50 h-9 md:h-10 text-sm md:text-base"
        />
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-9 md:h-10 text-sm md:text-base" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
};

const SignUpForm = ({ onSubmit, loading }: { onSubmit: (email: string, password: string, name: string) => void; loading: boolean }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="signup-name" className="text-sm md:text-base">Full Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-white/50 dark:bg-gray-800/50 h-9 md:h-10 text-sm md:text-base"
        />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="signup-email" className="text-sm md:text-base">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/50 dark:bg-gray-800/50 h-9 md:h-10 text-sm md:text-base"
        />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="signup-password" className="text-sm md:text-base">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Choose a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="bg-white/50 dark:bg-gray-800/50 h-9 md:h-10 text-sm md:text-base"
        />
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-9 md:h-10 text-sm md:text-base" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
};
