// app/about/page.tsx
import { 
  Building2, 
  Users, 
  Target, 
  Shield, 
  MapPin, 
  TrendingUp, 
  CheckCircle, 
  Globe, 
  Phone, 
  Mail, 
  ArrowRight,
  Search,
  Eye,
  Network,
  Award,
  HeartHandshake,
  Sparkles,
  BadgeCheck,
  Map,
  Zap,
  Star,
  Navigation
} from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const categories = [
    { name: 'Manufacturers', icon: '🏭', count: '8,500+' },
    { name: 'Exporters', icon: '🌐', count: '4,200+' },
    { name: 'IT Services', icon: '💻', count: '6,800+' },
    { name: 'Construction', icon: '🏗️', count: '5,300+' },
    { name: 'Healthcare', icon: '🏥', count: '3,900+' },
    { name: 'Retail', icon: '🛍️', count: '12,000+' },
    { name: 'Hospitality', icon: '🏨', count: '4,500+' },
    { name: 'Education', icon: '🎓', count: '3,200+' },
    { name: 'Real Estate', icon: '🏠', count: '4,800+' },
    { name: 'Logistics', icon: '🚚', count: '3,600+' },
    { name: 'Agriculture', icon: '🌾', count: '2,900+' },
    { name: 'Consulting', icon: '📊', count: '5,700+' },
  ]

  const values = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Trust & Verification',
      description: 'Every business undergoes verification for authenticity'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Pan-India Reach',
      description: 'Connecting businesses across 500+ Indian cities'
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Smart Discovery',
      description: 'AI-powered search for relevant business matches'
    },
    {
      icon: <HeartHandshake className="h-8 w-8" />,
      title: 'Community First',
      description: 'Built by businesses, for businesses'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Fast & Easy',
      description: 'Simple listing process, instant visibility'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality Focus',
      description: 'Curated listings for better business connections'
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative section-padding py-20 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Navigation className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm font-medium">Based in Jharkhand, Serving All India</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  From <span className="text-yellow-300">Jharkhand</span> to All <span className="text-yellow-300">India</span>
                </h1>
                
                <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                  PublicIn started in Jamua, Giridih with a vision to connect local businesses nationwide. Today, we're India's premier B2B platform connecting verified businesses with opportunities, partners, and growth.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/list-business" 
                    className="group btn-primary bg-white text-primary-700 hover:bg-gray-50 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Sparkles className="h-5 w-5" />
                    List Your Business - Free Forever
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/businesses" 
                    className="group btn-secondary border-2 border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50"
                  >
                    <Search className="h-5 w-5" />
                    Explore Businesses
                  </Link>
                </div>
              </div>
              
              {/* Stats Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-center">PublicIn in Numbers</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-300 mb-2">50K+</div>
                    <div className="text-sm text-blue-100">Active Businesses</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-300 mb-2">500+</div>
                    <div className="text-sm text-blue-100">Indian Cities</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-300 mb-2">1M+</div>
                    <div className="text-sm text-blue-100">Monthly Visitors</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-300 mb-2">95%</div>
                    <div className="text-sm text-blue-100">Satisfaction Rate</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-blue-100">
                      <MapPin className="h-5 w-5" />
                      <span>Headquartered in Jharkhand</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-primary-50 text-primary-700 rounded-full px-6 py-3 mb-6">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">Our Jharkhand Roots</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Born in <span className="text-primary-600">Jharkhand</span>, Growing Across <span className="text-primary-600">India</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small town vision to India's trusted business ecosystem
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="prose prose-lg text-gray-600">
                <p className="text-xl leading-relaxed">
                  PublicIn was founded in <strong>Jamua, Giridih, Jharkhand</strong> with a simple mission: to help local businesses get the visibility they deserve. We started by connecting businesses in Jharkhand and quickly realized the potential to help businesses nationwide.
                </p>
                <p>
                  Our journey began with small shop owners, local manufacturers, and service providers in Giridih who needed better ways to connect with customers and partners. Today, we serve businesses from Srinagar to Kanyakumari while staying true to our Jharkhand roots.
                </p>
                <p>
                  We understand the challenges faced by businesses in smaller towns and cities. That's why we've built a platform that's simple, accessible, and effective for businesses of all sizes, from local kirana stores to large manufacturers.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/jharkhand-businesses" 
                  className="group inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
                >
                  <Navigation className="h-5 w-5" />
                  Explore Jharkhand Businesses
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/team" 
                  className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold"
                >
                  Meet Our Team
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            {/* Location Card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-8 rounded-2xl shadow-lg border border-primary-100">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Headquarters</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="font-semibold text-primary-700">Jamua, Giridih</p>
                      <p>Jharkhand 815318</p>
                      <p className="text-sm mt-3">📍 Located in the heart of Jharkhand, serving businesses across India</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Local Focus, National Reach</h3>
                    <p className="text-gray-600">
                      While we serve all of India, we remain committed to empowering businesses in Jharkhand and Eastern India with special initiatives and support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-28">
        <div className="section-padding">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why <span className="text-primary-600">Thousands</span> Choose PublicIn
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're redefining business discovery with innovation and integrity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-primary-600">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="section-padding py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* For Businesses */}
            <div className="bg-gradient-to-br from-primary-50 to-white p-10 rounded-3xl shadow-xl border border-primary-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary-600 p-3 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">For Businesses</h3>
                  <p className="text-primary-600 font-medium">Grow your reach & network</p>
                </div>
              </div>
              
              <ul className="space-y-5">
                {[
                  'Free Verified Business Listing',
                  'Lead Generation & Client Acquisition',
                  'B2B Partner Discovery',
                  'Digital Presence Enhancement',
                  'Product Showcase Gallery',
                  'Business Analytics Dashboard',
                  'Review & Rating System',
                  'Priority Support'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10">
                <Link 
                  href="/list-business" 
                  className="group btn-primary w-full text-center justify-center hover:shadow-lg"
                >
                  Start Listing - It's Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
            
            {/* For Buyers/Seekers */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-3xl shadow-xl border border-blue-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">For Buyers & Seekers</h3>
                  <p className="text-blue-600 font-medium">Find trusted partners</p>
                </div>
              </div>
              
              <ul className="space-y-5">
                {[
                  'Verified Business Database',
                  'Advanced Search & Filters',
                  'Location-Based Discovery',
                  'Direct Contact Access',
                  'Genuine Reviews & Ratings',
                  'Quick Enquiry System',
                  'Price Comparison',
                  'Save & Bookmark Favorites'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="bg-blue-100 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10">
                <Link 
                  href="/businesses" 
                  className="group btn-secondary w-full text-center justify-center border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Explore Businesses
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Categories - Jharkhand Focus */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20 md:py-28">
        <div className="section-padding">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-yellow-50 text-yellow-700 rounded-full px-6 py-3 mb-6">
              <Navigation className="h-5 w-5" />
              <span className="font-semibold">Popular in Jharkhand</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Top Business <span className="text-primary-600">Categories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From agriculture to mining - connecting Jharkhand's core industries with India
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-12">
            {[
              { name: 'Agriculture', icon: '🌾', count: '2,900+' },
              { name: 'Mining', icon: '⛏️', count: '1,500+' },
              { name: 'Manufacturing', icon: '🏭', count: '8,500+' },
              { name: 'Construction', icon: '🏗️', count: '5,300+' },
              { name: 'Retail', icon: '🛍️', count: '12,000+' },
              { name: 'Transport', icon: '🚚', count: '3,600+' },
              { name: 'Healthcare', icon: '🏥', count: '3,900+' },
              { name: 'Education', icon: '🎓', count: '3,200+' },
              { name: 'Hospitality', icon: '🏨', count: '4,500+' },
              { name: 'IT Services', icon: '💻', count: '6,800+' },
              { name: 'Real Estate', icon: '🏠', count: '4,800+' },
              { name: 'Consulting', icon: '📊', count: '5,700+' },
            ].map((category, index) => (
              <Link 
                href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={index}
                className="group bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <div className="font-semibold text-gray-800 group-hover:text-primary-600 mb-1">
                  {category.name}
                </div>
                <div className="text-sm text-gray-500">{category.count} businesses</div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/categories" 
              className="group inline-flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-primary-600 text-gray-800 hover:text-primary-700 font-semibold py-4 px-8 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Map className="h-5 w-5" />
              Browse All Categories & Locations
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-yellow-50 text-yellow-700 rounded-full px-6 py-3 mb-6">
              <Star className="h-5 w-5" />
              <span className="font-semibold">Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by <span className="text-primary-600">50,000+</span> Businesses
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                quote: "As a small manufacturer in Giridih, PublicIn helped me connect with buyers across India. My business grew 200% in one year!",
                name: "Ramesh Kumar",
                company: "Kumar Steel Works, Giridih",
                role: "Owner"
              },
              {
                quote: "PublicIn made it easy to find reliable suppliers in Jharkhand. The local focus helped us build strong partnerships.",
                name: "Priya Singh",
                company: "Singh Retail Chain, Ranchi",
                role: "Procurement Head"
              },
              {
                quote: "From a small shop in Jamua to suppliers across India - PublicIn transformed our business reach and visibility.",
                name: "Amit Das",
                company: "Das Hardware, Jamua",
                role: "Proprietor"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="text-yellow-400 mb-4">
                  {'★★★★★'.split('').map((_, i) => (
                    <Star key={i} className="h-5 w-5 inline fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/testimonials" 
              className="group inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              Read more success stories
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-blue-800 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-blue-800/20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative section-padding py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Join India's most trusted business network today. Whether you're listing your business or searching for partners, PublicIn makes it simple, fast, and effective.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/list-business" 
                className="group btn-primary bg-white text-primary-700 hover:bg-gray-50 hover:scale-105 px-10 py-4 text-lg"
              >
                <Sparkles className="h-6 w-6" />
                Start Free Listing
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                href="/contact" 
                className="group btn-secondary border-2 border-white bg-transparent hover:bg-white/10 px-10 py-4 text-lg"
              >
                <Phone className="h-6 w-6" />
                Talk to Our Team
              </Link>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-blue-100">
                <div className="flex items-center gap-3">
                  <Navigation className="h-5 w-5" />
                  <span>Based in Jharkhand, Serving India</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <span>100% Free Basic Listing</span>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5" />
                  <span>Verified Businesses Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact - Updated Address */}
      <section className="bg-gray-900 text-white">
        <div className="section-padding py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-6">
              <div className="bg-primary-500/20 p-3 rounded-xl">
                <MapPin className="h-8 w-8 text-primary-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Headquarters</h3>
                <p className="text-gray-300">
                  Jamua, Giridih<br />
                  Jharkhand 815318<br />
                  India
                </p>
                <div className="mt-3">
                  <div className="inline-flex items-center gap-2 text-sm text-primary-300">
                    <Navigation className="h-4 w-4" />
                    <span>Heart of Jharkhand</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Phone className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Contact Us</h3>
                <p className="text-gray-300">
                  <strong>Phone:</strong> +91 6542 123456<br />
                  <strong>Toll Free:</strong> 1800 123 4567<br />
                  <strong>Hours:</strong> Mon-Sat, 9AM-7PM
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <Mail className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Email & Support</h3>
                <p className="text-gray-300">
                  <strong>Support:</strong> support@publicin.in<br />
                  <strong>Business:</strong> partners@publicin.in<br />
                  <strong>Careers:</strong> careers@publicin.in
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Navigation className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-bold">PublicIn</span>
                <span className="text-sm text-gray-400">| Jamua, Giridih</span>
              </div>
              <p className="text-gray-400">
                © {new Date().getFullYear()} PublicIn. All rights reserved. India's Trusted Business Platform.
              </p>
              <div className="flex gap-4">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}