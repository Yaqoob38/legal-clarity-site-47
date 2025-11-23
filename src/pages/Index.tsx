import { useEffect, useState } from "react";
import { 
  Menu, ChevronDown, Lock, Building2, Briefcase, Gem, Globe, 
  UploadCloud, Activity, ShieldCheck, Smartphone, CheckCircle2, 
  Circle, CheckCircle, ArrowRight, MapPin, Phone, Mail, Linkedin, 
  Twitter, Facebook 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarBg, setNavbarBg] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavbarBg(true);
      } else {
        setNavbarBg(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-brand-cream antialiased">
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 backdrop-blur-sm border-b border-white/10 transition-all duration-300 ${
          navbarBg ? 'bg-brand-navy shadow-lg' : 'bg-brand-navy/95'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="#" className="text-white font-serif text-2xl tracking-wide uppercase">
                Riseam <span className="text-brand-gold">Sharples</span>
              </a>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-300 hover:text-white hover:border-b hover:border-brand-gold transition-all pb-1 text-sm tracking-wider uppercase">About</a>
              <a href="#services" className="text-gray-300 hover:text-white hover:border-b hover:border-brand-gold transition-all pb-1 text-sm tracking-wider uppercase">Services</a>
              <a href="#portal" className="text-gray-300 hover:text-white hover:border-b hover:border-brand-gold transition-all pb-1 text-sm tracking-wider uppercase">Client Portal</a>
              <a href="#contact" className="text-gray-300 hover:text-white hover:border-b hover:border-brand-gold transition-all pb-1 text-sm tracking-wider uppercase">Contact</a>
            </div>

            {/* CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-white text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" /> {user.email}
                  </span>
                  <button 
                    onClick={signOut}
                    className="text-white text-sm hover:text-brand-gold transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <a href="/signin" className="text-white text-sm hover:text-brand-gold transition-colors flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Client Login
                </a>
              )}
              <a href="#contact" className="bg-brand-gold hover:bg-brand-goldLight text-white px-6 py-2.5 text-sm uppercase tracking-wide transition-colors duration-300">
                Contact Us
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                <Menu className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-brand-navy border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#about" className="block px-3 py-2 text-base font-medium text-white hover:bg-brand-slate">About</a>
              <a href="#services" className="block px-3 py-2 text-base font-medium text-white hover:bg-brand-slate">Services</a>
              <a href="#portal" className="block px-3 py-2 text-base font-medium text-white hover:bg-brand-slate">Client Portal</a>
              <a href="#contact" className="block px-3 py-2 text-base font-medium text-white hover:bg-brand-slate">Contact</a>
              <div className="pt-4 border-t border-white/10 mt-4">
                {user ? (
                  <>
                    <span className="block px-3 py-2 text-base font-medium text-white">
                      {user.email}
                    </span>
                    <button 
                      onClick={signOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-brand-gold hover:text-white"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <a href="/signin" className="block px-3 py-2 text-base font-medium text-brand-gold hover:text-white flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Client Login
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center hero-bg text-center px-4">
        <div className="relative z-10 max-w-4xl mx-auto" style={{ animation: 'fadeIn 1.5s ease-out forwards' }}>
          <div className="flex justify-center mb-6">
            <span className="h-px w-20 bg-brand-gold"></span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-bold leading-tight mb-6 tracking-tight">
            Clarity. Confidence.<br />
            <span className="italic font-light text-brand-gold">Exceptional Legal Expertise.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            Riseam Sharples delivers trusted guidance for property, corporate, and private client matters across the UK and the Middle East.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="bg-brand-gold hover:bg-brand-goldLight text-white px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 border border-brand-gold">
              Start a Conversation
            </a>
            <a href="#about" className="bg-transparent hover:bg-white/10 text-white px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 border border-white/30">
              Explore Our Firm
            </a>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#about" className="text-white/50 hover:text-white transition-colors">
            <ChevronDown className="w-8 h-8" />
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0 relative">
              {/* Image Grid */}
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop" alt="Office Meeting" className="w-full h-[500px] object-cover shadow-2xl filter brightness-90" />
                <div className="absolute -bottom-6 -right-6 w-2/3 h-64 bg-brand-navy p-8 shadow-xl hidden md:block">
                  <div className="h-full border border-white/20 flex flex-col justify-center p-6 text-white">
                    <span className="text-brand-gold text-5xl font-serif font-bold block mb-2">35+</span>
                    <span className="uppercase tracking-widest text-sm text-gray-300">Years of Legal Excellence in London</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-brand-gold uppercase tracking-widest text-sm font-semibold mb-2 block">Who We Are</span>
              <h2 className="text-4xl text-brand-navy font-bold mb-6">An Established London Firm Defined by Clarity</h2>
              <div className="w-20 h-1 bg-brand-navy mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                At Riseam Sharples, we believe the law should be an instrument of clarity, not confusion. Founded on the principles of integrity and personal service, we have established ourselves as a leading voice in London's legal landscape.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Our solicitors are renowned for cutting through complexity, providing you with actionable, confident advice whether you are acquiring prime real estate, restructuring a corporation, or managing private wealth.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-brand-gold mr-3 mt-1 flex-shrink-0" />
                  <span className="text-brand-slate">Personalised, partner-led service</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-brand-gold mr-3 mt-1 flex-shrink-0" />
                  <span className="text-brand-slate">Specialists in UK & International Law</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-brand-gold mr-3 mt-1 flex-shrink-0" />
                  <span className="text-brand-slate">Transparent communication at every stage</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-brand-slate text-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-gold uppercase tracking-widest text-sm font-semibold">Our Expertise</span>
            <h2 className="text-4xl font-serif mt-2">Comprehensive Legal Services</h2>
            <div className="w-20 h-1 bg-brand-gold mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Property */}
            <div className="bg-brand-navy p-8 border border-white/5 service-card group cursor-pointer hover:border-brand-gold/30">
              <div className="mb-6">
                <Building2 className="w-10 h-10 text-white group-hover:text-brand-gold transition-colors duration-300 service-icon" />
              </div>
              <h3 className="text-xl font-serif mb-4 text-white">Property Law</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Expert handling of residential and commercial transactions, development projects, and property finance with speed and precision.
              </p>
              <a href="#" className="inline-flex items-center text-brand-gold text-sm uppercase tracking-wider group-hover:text-white transition-colors">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Corporate */}
            <div className="bg-brand-navy p-8 border border-white/5 service-card group cursor-pointer hover:border-brand-gold/30">
              <div className="mb-6">
                <Briefcase className="w-10 h-10 text-white group-hover:text-brand-gold transition-colors duration-300 service-icon" />
              </div>
              <h3 className="text-xl font-serif mb-4 text-white">Corporate</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Strategic advice for businesses at all stages, from formation and M&A to commercial contracts and dispute resolution.
              </p>
              <a href="#" className="inline-flex items-center text-brand-gold text-sm uppercase tracking-wider group-hover:text-white transition-colors">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Private Wealth */}
            <div className="bg-brand-navy p-8 border border-white/5 service-card group cursor-pointer hover:border-brand-gold/30">
              <div className="mb-6">
                <Gem className="w-10 h-10 text-white group-hover:text-brand-gold transition-colors duration-300 service-icon" />
              </div>
              <h3 className="text-xl font-serif mb-4 text-white">Private Wealth</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Protecting your legacy through tailored estate planning, trusts, probate, and tax structuring for individuals and families.
              </p>
              <a href="#" className="inline-flex items-center text-brand-gold text-sm uppercase tracking-wider group-hover:text-white transition-colors">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* International */}
            <div className="bg-brand-navy p-8 border border-white/5 service-card group cursor-pointer hover:border-brand-gold/30">
              <div className="mb-6">
                <Globe className="w-10 h-10 text-white group-hover:text-brand-gold transition-colors duration-300 service-icon" />
              </div>
              <h3 className="text-xl font-serif mb-4 text-white">International Clients</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Specialized guidance for Middle Eastern and international investors navigating the UK legal and property landscape.
              </p>
              <a href="#" className="inline-flex items-center text-brand-gold text-sm uppercase tracking-wider group-hover:text-white transition-colors">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Client Portal Section */}
      <section id="portal" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gray-100 transform skew-x-12 hidden lg:block"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:flex items-center gap-16">
            <div className="lg:w-1/2">
              <span className="inline-block px-3 py-1 bg-brand-navy/10 text-brand-navy text-xs font-bold uppercase tracking-widest mb-4 rounded-sm">Tech-Forward</span>
              <h2 className="text-4xl text-brand-navy font-bold mb-6">Secure Client Portal</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Experience a seamless legal journey. Our encrypted client portal allows you to track your case progress, upload sensitive documents securely, and complete AML checks from the comfort of your home.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white p-2 shadow-sm rounded">
                    <UploadCloud className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-brand-navy font-bold">Secure Uploads</h4>
                    <p className="text-sm text-gray-500 mt-1">Bank-grade encryption for all files.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white p-2 shadow-sm rounded">
                    <Activity className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-brand-navy font-bold">Progress Tracking</h4>
                    <p className="text-sm text-gray-500 mt-1">Real-time updates on your matter.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white p-2 shadow-sm rounded">
                    <ShieldCheck className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-brand-navy font-bold">Instant AML</h4>
                    <p className="text-sm text-gray-500 mt-1">Identity verification made simple.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white p-2 shadow-sm rounded">
                    <Smartphone className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-brand-navy font-bold">Mobile Access</h4>
                    <p className="text-sm text-gray-500 mt-1">Manage everything on the go.</p>
                  </div>
                </div>
              </div>

              <a href={user ? "#" : "/signin"} className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium text-white bg-brand-navy hover:bg-brand-slate transition-colors shadow-lg">
                {user ? "View Portal" : "Login to Portal"}
              </a>
            </div>
            
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              {/* Tech Mockup */}
              <div className="relative rounded-lg shadow-2xl overflow-hidden bg-brand-navy border border-gray-700">
                <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <div>
                      <h3 className="text-white text-lg font-serif">Case #Ref-2294</h3>
                      <p className="text-gray-400 text-xs">Property Conveyance - 49 Russell Square</p>
                    </div>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">In Progress</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-gray-300 text-sm">
                      <span>Initial Instructions</span>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-gray-300 text-sm">
                      <span>AML Checks</span>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-white font-medium text-sm bg-brand-slate p-3 rounded border-l-2 border-brand-gold">
                      <span>Searches & Enquiries</span>
                      <span className="text-brand-gold text-xs">Current Step</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 text-sm">
                      <span>Exchange of Contracts</span>
                      <Circle className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between text-gray-500 text-sm">
                      <span>Completion</span>
                      <Circle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section id="contact" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-5xl font-serif text-brand-navy mb-4">Connect with us</h2>
            <p className="text-gray-500 max-w-2xl">You can also use the feedback form below to reach out to us directly through our website.</p>
          </div>

          <div className="lg:grid lg:grid-cols-2 gap-16 items-start">
            {/* Image Side */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[600px] mb-12 lg:mb-0 group">
              <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1974&auto=format&fit=crop" alt="Legal Team" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-brand-navy/10 transition-colors"></div>
            </div>

            {/* Form Side */}
            <div>
              <form className="space-y-8">
                <div>
                  <label className="block text-brand-navy font-bold mb-4">Name (required)</label>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <input type="text" placeholder="First Name" className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-brand-gold transition-colors bg-transparent placeholder-gray-400" />
                    </div>
                    <div>
                      <input type="text" placeholder="Last Name" className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-brand-gold transition-colors bg-transparent placeholder-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-brand-navy font-bold mb-2">Phone</label>
                  <input type="tel" className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" />
                </div>

                <div>
                  <label className="block text-brand-navy font-bold mb-2">Email (required)</label>
                  <input type="email" className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" />
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-brand-gold rounded border-gray-300 focus:ring-brand-gold" />
                    <span className="text-gray-500 text-sm">Sign up for news and updates</span>
                  </label>
                </div>

                <div>
                  <label className="block text-brand-navy font-bold mb-2">Describe your case</label>
                  <textarea rows={3} className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-brand-gold transition-colors bg-transparent"></textarea>
                </div>

                <button type="submit" className="w-full bg-brand-gold hover:bg-brand-goldLight text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 mt-4">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <a href="#" className="text-white font-serif text-2xl tracking-wide uppercase mb-4 block">
                Riseam <span className="text-brand-gold">Sharples</span>
              </a>
              <p className="text-sm max-w-sm leading-relaxed mb-6">
                An established London law firm delivering clarity, confidence, and exceptional legal expertise to clients in the UK and globally.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors"><Facebook className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-serif mb-4 uppercase text-sm tracking-widest">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-brand-gold transition-colors">About Us</a></li>
                <li><a href="#services" className="hover:text-brand-gold transition-colors">Our Services</a></li>
                <li><a href="#portal" className="hover:text-brand-gold transition-colors">Client Login</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-serif mb-4 uppercase text-sm tracking-widest">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-1 text-brand-gold flex-shrink-0" />
                  <span>49 Russell Square,<br />London, WC1B 4JP</span>
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-brand-gold flex-shrink-0" />
                  <span>+44 (0) 20 7123 4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-brand-gold flex-shrink-0" />
                  <span>info@riseamsharples.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; 2025 Riseam Sharples Solicitors. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Regulated by the Solicitors Regulation Authority.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
