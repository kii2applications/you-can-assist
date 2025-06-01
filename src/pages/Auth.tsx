import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Users, Heart, MessageCircle, BookOpen } from "lucide-react";
import { Helmet } from "react-helmet";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Kii2Connect - Find Community Help & Share Your Skills</title>
        <meta name="description" content="Connect with people in your community who can help you learn new skills, solve problems, or provide assistance. From cooking lessons to career advice - find the help you need or share your expertise with others." />
        <meta name="keywords" content="community help, skill sharing, local assistance, tutoring, mentoring, neighborhood support, skill exchange, learning platform" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Consistent top bar */}
        <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50 safe-area-inset-top">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
                <div className="w-8 h-8 flex items-center justify-center">
                  <img
                    src="/lovable-uploads/d6feabf9-2ed6-480e-91b4-827b47d13167.png"
                    alt="Kii2Connect Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Kii2Connect
                </h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-8 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center justify-start max-w-4xl mx-auto">
            {/* Auth form */}
            <div className="w-full mb-4 md:mb-8">
              <AuthForm onSuccess={() => navigate("/")} />
            </div>

            {/* Quote card - hidden on mobile until form is in view */}
            <div className="text-center w-full bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-xl md:rounded-2xl p-4 md:p-8">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 md:mb-4">
                "A friend in need is a friend indeed"
              </h3>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                Whether you need someone to teach you guitar, help fix your computer, practice a language,
                or just want advice on career decisions - there's someone in your community ready to help.
                Most connections happen through friendship, skill trades, or simply paying it forward.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
