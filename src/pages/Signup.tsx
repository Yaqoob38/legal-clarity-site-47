import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";

const signupSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
  confirmPassword: z.string(),
  terms: z.boolean()
    .refine((val) => val === true, { message: "You must accept the terms and conditions" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const { signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.name);
      if (!error) {
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Google OAuth will be configured separately
    alert("Google sign-up coming soon!");
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
              <a href="/signin" className="text-brand-navy border border-gray-200 hover:border-brand-gold px-5 py-2 text-sm font-medium rounded transition-all">
                Sign In
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
            <h1 className="text-4xl md:text-5xl font-serif text-brand-navy mb-4">Create an account</h1>
            <p className="text-gray-500 text-sm">Join our secure client portal to manage your legal matters.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-bold text-brand-navy">Full Name*</label>
              <input 
                type="text" 
                id="name" 
                placeholder="Your full name"
                {...register("name")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-brand-navy">Email*</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Email address"
                {...register("email")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-brand-navy">Password*</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Create a password"
                {...register("password")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Repeat Password */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-bold text-brand-navy">Repeat Password*</label>
              <input 
                type="password" 
                id="confirm-password" 
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 mt-4">
                <input 
                  type="checkbox" 
                  id="terms"
                  {...register("terms")}
                  className="h-4 w-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
                />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  I agree to the <a href="#" className="text-brand-navy font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-navy font-bold hover:underline">Privacy Policy</a>.
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-4 pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-brand-gold hover:bg-brand-goldLight text-white font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>

              <button 
                type="button" 
                onClick={handleGoogleSignup}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-brand-navy font-medium py-3.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                {/* Google SVG Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="group-hover:text-brand-slate">Sign up with Google</span>
              </button>
            </div>

          </form>

          {/* Footer Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Already have an account? 
              <a href="/signin" className="text-brand-gold font-bold hover:text-brand-goldLight underline decoration-2 underline-offset-4 transition-colors ml-1">Sign In</a>
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

export default Signup;
