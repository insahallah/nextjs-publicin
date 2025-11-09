// app/list/[...slug]/[business]/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from "next/navigation";
import SubHeader from "@/components/SubHeader";
import Footer from "@/components/Footer";

export default function BusinessDetailsPage({ params }: { params: Promise<{ slug: string[]; business: string; id: string }> }) {
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const { id, business, slug } = resolvedParams;

        console.log('🔍 DEBUG - Business details params:', { id, business, slug });
        setDebugInfo({ id, business, slug });

        // Try multiple approaches to get business data
        let businessDetails = await fetchBusinessFromAllSources(id, slug);
        
        if (!businessDetails) {
          console.log('❌ Business not found in any source');
          notFound();
          return;
        }

        console.log('✅ Business found:', businessDetails);
        setBusinessData(businessDetails);
      } catch (error) {
        console.error('Error fetching business details:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [params]);

  // Try multiple methods to find the business
  const fetchBusinessFromAllSources = async (businessId: string, slug: string[]): Promise<any> => {
    console.log('🔄 Searching for business ID:', businessId);
    
    // Method 1: Try your main listings API
    const fromListings = await fetchFromListingsAPI(businessId, slug);
    if (fromListings) {
      console.log('✅ Found in listings API');
      return fromListings;
    }

    // Method 2: Try direct database query simulation
    const fromDirect = await fetchDirectBusinessData(businessId);
    if (fromDirect) {
      console.log('✅ Found in direct fetch');
      return fromDirect;
    }

    // Method 3: Fallback to mock data for testing
    console.log('⚠️ Using mock data for testing');
    return getMockBusinessData(businessId, slug);
  };

  // Method 1: Fetch from your existing listings API
  const fetchFromListingsAPI = async (businessId: string, slug: string[]): Promise<any> => {
    try {
      const lastPart = slug[slug.length - 1]; // Get the last segment which should be category ID
      console.log('📡 Fetching from listings API with category:', lastPart);

      const formData = new FormData();
      
      if (lastPart.startsWith("child")) formData.append("childrenId", lastPart);
      else if (lastPart.startsWith("sub")) formData.append("subcategoryId", lastPart);
      else if (lastPart.startsWith("cat")) formData.append("category", lastPart);
      else formData.append("category", lastPart); // Fallback

      const res = await fetch(
        "https://allupipay.in/publicsewa/api/users/main-search-display-request-for-web.php",
        { 
          method: "POST", 
          body: formData,
          cache: 'no-store'
        }
      );

      console.log('📊 API Response status:', res.status);

      if (!res.ok) {
        console.error('❌ API response not OK');
        return null;
      }

      const data = await res.json();
      console.log('📦 Raw API data:', data);

      let listings: any[] = [];
      
      // Parse the response data
      if (Array.isArray(data)) {
        listings = data;
      } else if (data?.data && Array.isArray(data.data)) {
        listings = data.data;
      } else if (typeof data === 'object') {
        // Try to extract arrays from object
        listings = Object.values(data)
          .flat()
          .filter((v: any) => Array.isArray(v))
          .flat();
      }

      console.log(`📋 Found ${listings.length} listings`);

      // Find the specific business by ID - try different ID fields
      const foundBusiness = listings.find(listing => {
        const possibleIds = [
          listing.id,
          listing.business_id,
          listing.user_id,
          listing.businessId
        ];
        
        const match = possibleIds.some(pid => 
          pid && String(pid) === String(businessId)
        );
        
        if (match) {
          console.log('🎯 Business matched:', listing);
        }
        
        return match;
      });

      if (foundBusiness) {
        // Format the business data
        return {
          ...foundBusiness,
          id: foundBusiness.id || businessId,
          displayName: foundBusiness.businessName || foundBusiness.displayName || foundBusiness.name || "Business",
          location: [foundBusiness.village, foundBusiness.district, foundBusiness.state].filter(Boolean).join(", ") || "Location not available",
          phone: foundBusiness.mobile && foundBusiness.mobile !== "Unknown" ? foundBusiness.mobile : null,
          rating: foundBusiness.averageRating || foundBusiness.rating || 0,
          reviewCount: foundBusiness.ratingCount || foundBusiness.reviewCount || 0,
          services: foundBusiness.services || [],
          images: foundBusiness.images || [],
          isOpen: true,
          description: foundBusiness.description || `Welcome to ${foundBusiness.businessName}. We provide quality services to our customers.`
        };
      }

      console.log('❌ Business not found in listings');
      return null;
    } catch (error) {
      console.error('❌ Error fetching from listings:', error);
      return null;
    }
  };

  // Method 2: Try direct fetch (you'll need to create this API endpoint)
  const fetchDirectBusinessData = async (businessId: string): Promise<any> => {
    try {
      const res = await fetch(
        `https://allupipay.in/publicsewa/api/users/get-business.php?id=${businessId}`,
        { cache: 'no-store' }
      );
      
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Method 3: Mock data for testing
  const getMockBusinessData = (businessId: string, slug: string[]) => {
    const category = slug.join(' > ');
    
    const mockBusinesses: { [key: string]: any } = {
      '121': {
        id: '121',
        displayName: 'Tata Motors Service Center',
        description: 'Professional automotive services and repairs for all Tata Motors vehicles. We specialize in engine maintenance, brake services, and overall vehicle care.',
        phone: '+919876543210',
        location: 'Kisanpur, Lakhisarai, Bihar',
        rating: 4.5,
        reviewCount: 127,
        services: ['Engine Repair', 'Brake Services', 'Oil Change', 'Tire Rotation', 'Electrical Repair', 'AC Service'],
        images: ['/default-listing.jpg'],
        isOpen: true,
        latitude: '25.1670',
        longitude: '86.0946'
      },
      '122': {
        id: '122',
        displayName: 'City Hospital',
        description: 'Multi-specialty hospital providing comprehensive healthcare services with modern facilities and experienced medical professionals.',
        phone: '+919876543211',
        location: 'City Center, Lakhisarai, Bihar',
        rating: 4.2,
        reviewCount: 89,
        services: ['General Medicine', 'Emergency Care', 'Surgery', 'Pediatrics', 'Cardiology'],
        images: ['/default-listing.jpg'],
        isOpen: true
      }
    };

    return mockBusinesses[businessId] || {
      id: businessId,
      displayName: `Business ${businessId}`,
      description: `This is a test business with ID ${businessId} in category ${category}.`,
      phone: '+910000000000',
      location: 'Test Location',
      rating: 4.0,
      reviewCount: 50,
      services: ['Service 1', 'Service 2', 'Service 3'],
      images: ['/default-listing.jpg'],
      isOpen: true
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business details...</p>
          {debugInfo.id && (
            <p className="text-sm text-gray-500 mt-2">Business ID: {debugInfo.id}</p>
          )}
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find the business you're looking for.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          <button 
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <SubHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Debug info - remove in production */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <details>
            <summary className="cursor-pointer font-semibold">Debug Information</summary>
            <pre className="text-xs mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        </div>

        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Business Image */}
            <div className="md:w-1/3">
              <img 
                src={businessData.images && businessData.images[0] ? 
                  (typeof businessData.images[0] === 'string' ? 
                    businessData.images[0] :
                    businessData.images[0].path ? 
                      `https://allupipay.in/publicsewa/images/${businessData.images[0].path}` : 
                      "/default-listing.jpg"
                  ) : "/default-listing.jpg"
                } 
                alt={businessData.displayName}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            {/* Business Info */}
            <div className="md:w-2/3">
              <button 
                onClick={() => router.back()}
                className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                ← Back to listings
              </button>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {businessData.displayName}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`text-lg ${i < Math.floor(businessData.rating || 0) ? "text-yellow-500" : "text-gray-300"}`}>
                      ★
                    </span>
                  ))}
                  <span className="text-lg font-bold ml-2">{businessData.rating || 0}</span>
                  <span className="text-gray-600">({businessData.reviewCount || 0} reviews)</span>
                </div>
                
                {businessData.isOpen ? (
                  <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                    🟢 Open Now
                  </span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                    🔴 Closed
                  </span>
                )}
              </div>
              
              {/* Location */}
              {businessData.location && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <span>📍</span>
                  <span>{businessData.location}</span>
                </div>
              )}
              
              {/* Phone */}
              {businessData.phone && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <span>📞</span>
                  <span>{businessData.phone}</span>
                  <button 
                    onClick={() => window.open(`tel:${businessData.phone}`)}
                    className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Call Now
                  </button>
                </div>
              )}
              
              {/* Description */}
              {businessData.description && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed">{businessData.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services Section */}
        {businessData.services && businessData.services.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-xl mb-4">Services Offered</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {businessData.services.map((service: string, index: number) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-800 font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-xl mb-4">Contact Business</h3>
          <div className="flex flex-wrap gap-3">
            {businessData.phone && (
              <>
                <button 
                  onClick={() => window.open(`tel:${businessData.phone}`)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  📞 Call Now
                </button>
                <button 
                  onClick={() => {
                    const message = `Hi, I'm interested in your services at ${businessData.displayName}. Could you please provide more information?`;
                    const whatsappUrl = `https://wa.me/${businessData.phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  💬 WhatsApp
                </button>
              </>
            )}
            <button 
              onClick={() => {
                if (businessData.latitude && businessData.longitude) {
                  const mapsUrl = `https://www.google.com/maps?q=${businessData.latitude},${businessData.longitude}`;
                  window.open(mapsUrl, '_blank');
                } else if (businessData.location) {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessData.location)}`;
                  window.open(mapsUrl, '_blank');
                } else {
                  alert('Location information not available');
                }
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              📍 Get Directions
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}