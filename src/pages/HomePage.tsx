import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Users, CheckCircle, Star, Home, Building, MapPin, Award, Eye, ChevronLeft, ChevronRight, Play, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DownloadImage from '../images/download.jpeg';
import Testimonial1 from '../images/testimonial1.jpeg';
import Testimonial2 from '../images/testimonial2.jpeg';
import Testimonial3 from '../images/testimonial3.jpeg';
import Property1 from '../images/property1.jpeg';
import Property2 from '../images/property2.jpeg';
import Property3 from '../images/property3.jpeg';
import DashboardPreview from '../images/dashboard.jpeg';
import BackgroundImage from '../images/background.jpeg';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentProperty, setCurrentProperty] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Sample testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Jean Paul",
      location: "Douala",
      text: "I never thought I could own a piece of premium real estate in Bonanjo. With Green, I'm now earning rental income from properties I could never afford alone.",
      image: Testimonial1 ,
      investment: "2,500,000 XAF",
      return: "14.2%"
    },
    {
      id: 2,
      name: "Aisha M.",
      location: "Yaoundé",
      text: "The process was so simple. I started with just 100,000 XAF and now have investments in three different properties across Cameroon.",
      image: Testimonial2 ,      investment: "850,000 XAF",
      return: "12.8%"
    },
    {
      id: 3,
      name: "Thomas E.",
      location: "Buea",
      text: "The transparency is incredible. I can track my investments in real-time and see exactly which properties my tokens represent.",
      image: Testimonial3 ,
      investment: "1,200,000 XAF",
      return: "15.1%"
    }
  ];

  // Sample featured properties
  const featuredProperties = [
    {
      id: 1,
      name: "Skyline Apartments",
      location: "Bonanjo, Douala",
      yield: "9.2%",
      price: "85,000",
      image: Property1,
      details: "Luxury apartments in the heart of Douala's business district with panoramic city views and premium amenities."
    },
    {
      id: 2,
      name: "Hillside Villas",
      location: "Bastos, Yaounde",
      yield: "8.7%",
      price: "75,000",
      image: Property2,
      details: "Elegant villas in Yaounde's most prestigious neighborhood, featuring modern architecture and lush gardens."
    },
    {
      id: 3,
      name: "Ocean View Residence",
      location: "Limbe",
      yield: "10.1%",
      price: "95,000",
      image: Property3,
      details: "Beachfront properties with stunning ocean views, perfect for vacation rentals and long-term appreciation."
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Auto-rotate properties
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentProperty((prev) => (prev + 1) % featuredProperties.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredProperties.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 py-4 px-6 shadow-lg border-b border-gray-100/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md"
            >
              <span className="text-white font-extrabold text-2xl">G</span>
            </motion.div>
            <span className="text-2xl font-bold text-gray-900">Green</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/properties" className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors">Properties</Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors">How It Works</Link>
            <Link to="/about" className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors">Contact</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Dashboard
              </motion.button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors"
                >
                  Login
                </button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Sign Up
                </motion.button>
              </>
            )}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="absolute right-0 top-0 h-full w-72 bg-white/95 backdrop-blur-md shadow-2xl border-l border-gray-100/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-extrabold text-xl">G</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Green</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
                <div className="space-y-6">
                  <Link to="/properties" className="block text-gray-700 hover:text-emerald-600 font-semibold transition-colors">Properties</Link>
                  <Link to="/how-it-works" className="block text-gray-700 hover:text-emerald-600 font-semibold transition-colors">How It Works</Link>
                  <Link to="/about" className="block text-gray-700 hover:text-emerald-600 font-semibold transition-colors">About</Link>
                  <Link to="/contact" className="block text-gray-700 hover:text-emerald-600 font-semibold transition-colors">Contact</Link>
                  <div className="pt-6 border-t border-gray-200">
                    {isAuthenticated ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Dashboard
                      </motion.button>
                    ) : (
                      <>
                        <button 
                          onClick={() => navigate('/login')}
                          className="w-full text-center text-gray-700 hover:text-emerald-600 font-semibold transition-colors mb-3"
                        >
                          Login
                        </button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/register')}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          Sign Up
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover"
            poster={DownloadImage}
          >
            <source src="video.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-md">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Cameroon's #1 Real Estate Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              <span className="block">Real Estate</span>
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Reimagined</span>
            </h1>
            
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-gray-100 leading-relaxed">
              Own a piece of premium Cameroonian real estate with digital tokens. Start building wealth with just 50,000 XAF.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center shadow-lg"
              >
                Start Investing Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVideoModal(true)}
                className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Video
              </motion.button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                Fully Regulated
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                Bank-Grade Security
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                Property Verified
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition-colors"
                onClick={() => setShowVideoModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video">
                <iframe 
                  src="https://player.vimeo.com/video/370331493?h=3432c99e95&autoplay=1&title=0&byline=0&portrait=0" 
                  className="w-full h-full rounded-2xl" 
                  frameBorder="0" 
                  allow="autoplay; fullscreen" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Section with Parallax Effect */}
      <section className="relative py-24 bg-white/95 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={BackgroundImage} 
            alt="Background" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Join a thriving community of investors building wealth through real estate.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500M+", label: "Total Value Locked (XAF)" },
              { value: "1,200+", label: "Active Investors" },
              { value: "150+", label: "Properties Listed" },
              { value: "8.4%", label: "Average Annual Yield" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md"
              >
                <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-24 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Featured Properties</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover exclusive real estate opportunities across Cameroon's most promising markets.</p>
          </motion.div>
          
          <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-md shadow-2xl border border-gray-100/30">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-96 lg:h-auto">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={featuredProperties[currentProperty].id}
                    src={featuredProperties[currentProperty].image} 
                    alt={featuredProperties[currentProperty].name}
                    className="w-full h-full object-cover rounded-t-3xl lg:rounded-l-3xl"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {featuredProperties.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentProperty(index)}
                      className={`w-3 h-3 rounded-full ${currentProperty === index ? 'bg-emerald-600' : 'bg-white/70'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{featuredProperties[currentProperty].name}</h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                    <span className="font-semibold">{featuredProperties[currentProperty].location}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div>
                      <div className="text-sm text-gray-500 uppercase tracking-wide">Estimated Yield</div>
                      <div className="text-2xl font-bold text-emerald-600">{featuredProperties[currentProperty].yield}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 uppercase tracking-wide">Starting at</div>
                      <div className="text-2xl font-bold text-emerald-600">{featuredProperties[currentProperty].price} XAF</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 leading-relaxed">{featuredProperties[currentProperty].details}</p>
                
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border border-emerald-600 text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300"
                  >
                    Invest Now
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/properties"
              className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 group"
            >
              Explore All Investment Opportunities
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Start your real estate investment journey in just three simple steps.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Home, title: "Browse Properties", desc: "Explore our curated selection of premium real estate opportunities across Cameroon's most promising markets." },
              { icon: Building, title: "Invest Securely", desc: "Select your investment amount and complete the secure payment process to acquire property tokens." },
              { icon: TrendingUp, title: "Earn Returns", desc: "Receive regular rental income distributions and benefit from potential property appreciation over time." }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center group bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-emerald-200 transition-colors duration-300">
                    <step.icon className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-1 shadow-xl">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="overflow-hidden rounded-xl">
                <img 
                  src={DashboardPreview} 
                  alt="Dashboard preview" 
                  className="w-full h-full object-cover rounded-xl transform hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Track Everything in Your Dashboard</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our intuitive dashboard gives you complete visibility into your investments, returns, and property performance.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                    Real-time investment tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                    Detailed performance analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                    Transparent fee structure
                  </li>
                </ul>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                  className="self-start bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Explore Dashboard
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Hear from real investors who are building wealth through our platform.</p>
          </motion.div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonials[currentTestimonial].id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center border border-gray-100/30"
                >
                  <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                    <img 
                      src={testimonials[currentTestimonial].image} 
                      alt={testimonials[currentTestimonial].name}
                      className="w-28 h-28 rounded-full object-cover shadow-md border-2 border-emerald-100"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                      "{testimonials[currentTestimonial].text}"
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide">Investment</div>
                        <div className="font-semibold text-emerald-600">{testimonials[currentTestimonial].investment}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide">Annual Return</div>
                        <div className="font-semibold text-emerald-600">{testimonials[currentTestimonial].return}</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                      <div className="text-gray-600">{testimonials[currentTestimonial].location}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentTestimonial((currentTestimonial - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentTestimonial((currentTestimonial + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </motion.button>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-emerald-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={BackgroundImage} 
            alt="Background" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Ready to Transform Your Financial Future?</h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of investors who are already building generational wealth through real estate in Cameroon.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Investing Today
            </motion.button>
            
            <div className="mt-12 flex flex-wrap justify-center gap-10">
              {[
                { value: "50,000 XAF", label: "Minimum Investment" },
                { value: "24-48h", label: "Average Process Time" },
                { value: "100%", label: "Secure & Regulated" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold mb-1">{item.value}</div>
                  <div className="text-emerald-200 text-sm">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-extrabold text-xl">G</span>
                </div>
                <span className="text-xl font-bold">Green</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Cameroon's leading real estate investment platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
                <li><Link to="/properties" className="hover:text-white transition-colors">Properties</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Green. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;