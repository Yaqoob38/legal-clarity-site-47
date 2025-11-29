import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

const signinSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(1, { message: "Password is required" }),
});

type SigninFormData = z.infer<typeof signinSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (!error) {
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white font-sans text-brand-navy antialiased min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="bg-brand-navy text-white p-1.5 rounded-sm">
              <span className="font-serif font-bold text-xl">RS</span>
            </div>
            <span className="text-brand-navy font-serif text-xl tracking-wide uppercase group-hover:text-brand-gold transition-colors">
              Riseam <span className="text-brand-gold group-hover:text-brand-navy transition-colors">Sharples</span>
            </span>
          </a>

          {/* Right Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-500 hover:text-brand-navy text-sm font-medium transition-colors">Home</a>
            <a href="/#contact" className="text-gray-500 hover:text-brand-navy text-sm font-medium transition-colors">Contact</a>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <a href="/signup" className="text-brand-navy border border-gray-200 hover:border-brand-gold px-5 py-2 text-sm font-medium rounded transition-all">
                {t('auth.signUp')}
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ animation: 'fadeIn 0.8s ease-out' }}>
        <div className="max-w-md w-full space-y-10">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-brand-navy mb-4">Welcome back</h1>
            <p className="text-gray-500 text-sm">{t('auth.clientSignIn')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-brand-navy">{t('auth.email')}*</label>
              <input 
                type="email" 
                id="email" 
                placeholder={t('auth.email')}
                {...register("email")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-brand-navy">{t('auth.password')}*</label>
              <input 
                type="password" 
                id="password" 
                placeholder={t('auth.password')}
                {...register("password")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a href="#" className="text-sm text-brand-gold hover:text-brand-goldLight font-medium">
                Forgot password?
              </a>
            </div>

            {/* Button */}
            <div className="space-y-4 pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-brand-gold hover:bg-brand-goldLight text-white font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? `${t('auth.signIn')}...` : t('auth.signIn')}
              </button>
            </div>

          </form>

          {/* Footer Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              {t('auth.noAccount')}
              <a href="/signup" className="text-brand-gold font-bold hover:text-brand-goldLight underline decoration-2 underline-offset-4 transition-colors ml-1">{t('auth.signUp')}</a>
            </p>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-100">
        <p>&copy; 2025 Riseam Sharples Solicitors. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignIn;
