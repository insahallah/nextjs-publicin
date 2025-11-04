import { notFound } from "next/navigation";
import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import ImageWithFallback from "@/components/ImageWithFallback";
import SortingControls from "@/components/SortingControls";
import ListingsContainer from "@/components/ListingsContainer";

// 🧠 Ensure dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🌐 Fetch categories from API
async function fetchAndFormatCategories(): Promise<{ fullPath: string; name: string }[]> {
  try {
    const res = await fetch("https://allupipay.in/publicsewa/api/main-search.php", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Failed: ${res.status}`);

    const data = await res.json();
    const formattedCategories: { fullPath: string; name: string }[] = [];

    const categories = data?.data?.categories || [];

    categories.forEach((mainCat: any) => {
      if (!mainCat) return;

      const mainName = mainCat.category_name || mainCat.name || "Unknown Category";
      const mainSlug = mainCat.slug || mainName.toLowerCase().replace(/\s+/g, "-");
      const mainId = `cat${mainCat.id}`;

      // Main category
      const mainPath = `${mainSlug}/${mainId}`;
      formattedCategories.push({ fullPath: mainPath, name: mainName });

      // Subcategories
      (mainCat.subcategories || []).forEach((subCat: any) => {
        if (!subCat) return;

        const subName = subCat.subcategory_name || subCat.name || "Unknown Subcategory";
        const subSlug = subCat.slug || subName.toLowerCase().replace(/\s+/g, "-");
        const subId = `sub${subCat.id}`;
        const subPath = `${mainSlug}/${subSlug}/${subId}`;
        formattedCategories.push({ fullPath: subPath, name: subName });

        // Child categories
        (subCat.child_categories || []).forEach((childCat: any) => {
          if (!childCat) return;
          const childName = childCat.child_name || childCat.name || "Unknown Child Category";
          const childSlug = childCat.slug || childName.toLowerCase().replace(/\s+/g, "-");
          const childId = `child${childCat.id}`;
          const childPath = `${mainSlug}/${subSlug}/${childSlug}/${childId}`;
          formattedCategories.push({ fullPath: childPath, name: childName });
        });
      });
    });

    return formattedCategories;
  } catch (error) {
    console.error("💥 Error fetching categories:", error);
    return [];
  }
}

// ✅ Get category info dynamically
async function getCategoryInfo(slugArray: string[]) {
  const categories = await fetchAndFormatCategories();
  const path = slugArray.join("/");
  const category = categories.find((cat) => cat.fullPath === path);

  if (category) {
    const id = category.fullPath.split("/").pop() || "";
    return { id, name: category.name, path };
  }

  // Fallback
  const id = slugArray.at(-1) || "";
  const nameSlug = slugArray.at(-2) || slugArray[0];
  const name = nameSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return { id, name, path };
}

// 🖼️ Image helper
function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "/default-doctor.jpg";
  return `https://allupipay.in/publicsewa/images/${imagePath.replace(/^[\\/]+/, "")}`;
}

// 🏙️ Get location info from slug
function getLocationInfo(slugArray: string[]) {
  // Extract location from slug - typically the first part
  const locationSlug = slugArray[0] || "kisanpur";
  const areaSlug = slugArray[1] || "lakhisarai";
  
  const location = locationSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
    
  const area = areaSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return { location, area };
}

// 📝 Generate dynamic descriptions based on category
function getCategoryDescription(categoryName: string, location: string, area: string) {
  const descriptions: { [key: string]: string } = {
    "beauty parlours": `Discover the best beauty services and salons near you in ${location}, ${area}. Find top-rated beauty parlours for all your beauty needs.`,
    "doctors": `Find the best doctors and medical specialists in ${location}, ${area}. Book appointments with top-rated healthcare professionals.`,
    "hospitals": `Discover leading hospitals and healthcare centers in ${location}, ${area}. Find emergency care, specialists, and medical facilities.`,
    "restaurants": `Explore the finest restaurants and eateries in ${location}, ${area}. Discover delicious cuisine and dining experiences.`,
    "hotels": `Find the perfect hotels and accommodations in ${location}, ${area}. Book your stay with top-rated hospitality services.`,
    "electricians": `Hire reliable electricians and electrical services in ${location}, ${area}. Find experts for all your electrical needs.`,
    "plumbers": `Find professional plumbers and plumbing services in ${location}, ${area}. Get quick solutions for all plumbing issues.`,
    "carpenters": `Discover skilled carpenters and woodwork services in ${location}, ${area}. Quality craftsmanship for your projects.`,
    "teachers": `Find qualified teachers and tutors in ${location}, ${area}. Get personalized learning and educational support.`,
    "drivers": `Hire professional drivers and chauffeur services in ${location}, ${area}. Safe and reliable transportation solutions.`
  };

  const lowerCategory = categoryName.toLowerCase();
  return descriptions[lowerCategory] || `Discover the best ${categoryName.toLowerCase()} services in ${location}, ${area}. Find top-rated professionals and service providers near you.`;
}

// 🎯 Get relevant icons based on category
function getCategoryIcon(categoryName: string) {
  const icons: { [key: string]: string } = {
    "beauty parlours": "💄",
    "doctors": "👨‍⚕️",
    "hospitals": "🏥",
    "restaurants": "🍽️",
    "hotels": "🏨",
    "electricians": "⚡",
    "plumbers": "🔧",
    "carpenters": "🪚",
    "teachers": "👩‍🏫",
    "drivers": "🚗"
  };

  const lowerCategory = categoryName.toLowerCase();
  return icons[lowerCategory] || "🏢";
}

// 📸 Generate unique images for each listing
function generateListingImages(listing: any, index: number) {
  const beautyImages = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=320&h=320&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=320&h=320&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=320&h=320&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=320&h=320&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=320&h=320&fit=crop&crop=center"
  ];

  const doctorImages = [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=320&h=320&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=320&h=320&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=320&h=320&fit=crop&crop=center"
  ];

  const restaurantImages = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=320&h=320&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=320&h=320&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=320&h=320&fit=crop&crop=center"
  ];

  // Select image set based on category or use default
  let imageSet = beautyImages;
  if (listing.category?.toLowerCase().includes('doctor') || listing.category?.toLowerCase().includes('hospital')) {
    imageSet = doctorImages;
  } else if (listing.category?.toLowerCase().includes('restaurant')) {
    imageSet = restaurantImages;
  }

  // Use actual image from API if available, otherwise use unique images from set
  const mainImage = listing.imageUrl || imageSet[index % imageSet.length];
  
  // Create unique image array for each listing
  return [
    mainImage,
    ...imageSet.filter(img => img !== mainImage).slice(0, 2) // Add 2 more unique images
  ];
}

async function fetchListings(slugArray: string[]) {
  try {
    const lastPart = slugArray[slugArray.length - 1];

    const formData = new FormData();

    if (lastPart.startsWith("child")) {
      formData.append("childrenId", lastPart);
    } else if (lastPart.startsWith("sub")) {
      formData.append("subcategoryId", lastPart);
    } else if (lastPart.startsWith("cat")) {
      formData.append("category", lastPart);
    }

    const res = await fetch(
      "https://allupipay.in/publicsewa/api/users/main-search-display-request.php",
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    let listings: any[] = [];
    if (Array.isArray(data)) listings = data;
    else if (data?.data && Array.isArray(data.data)) listings = data.data;
    else
      listings = Object.values(data)
        .flat()
        .filter((v) => Array.isArray(v))
        .flat();

    return listings
      .filter((l) => l.status === 1)
      .map((l, index) => ({
        ...l,
        imageUrl: getImageUrl(l.images?.[0]?.path),
        rating: l.averageRating || 0,
        reviewCount: l.ratingCount || 0,
        displayName: l.businessName || "Service Provider",
        location: [l.city, l.district, l.state].filter(Boolean).join(", "),
        phone: l.phone || l.mobile || "",
        services: l.services || [],
        respondsIn: l.respondsIn || "5 Mins",
        distance: parseFloat(l.distance) || (index + 1) * 2, // Different distances
        isOpen: l.isOpen ?? true,
      }));
  } catch (e) {
    console.error("💥 Fetch failed:", e);
    return [];
  }
}

export default async function ListPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug || !Array.isArray(slug)) return notFound();

  const { id, name, path } = await getCategoryInfo(slug);
  const { location, area } = getLocationInfo(slug);

  if (!id) return notFound();

  // ✅ FIXED: Pass slug array instead of just id
  const listings = await fetchListings(slug);

  // Generate dynamic content based on category and location
  const categoryIcon = getCategoryIcon(name);
  const categoryDescription = getCategoryDescription(name, location, area);
  const pageTitle = `${name} in ${location}, ${area}`;

  // Use only real data from API with unique images for each listing
  const displayListings = listings.map((listing, index) => ({ 
    ...listing, 
    images: generateListingImages(listing, index),
    badge: getBadgeType(index),
    badgeColor: getBadgeColor(index),
    services: listing.services && listing.services.length > 0 ? listing.services : getDefaultServices(name, index)
  }));
  
  const fallbackImage = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=320&h=320&fit=crop&crop=center";

  return (
    <div id="page" className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <Header />

      <main className="theia-exception">
        {/* Dynamic Breadcrumb */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 py-4 shadow-sm">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 hover:text-green-600 cursor-pointer transition-colors">{area}</span>
              <span className="text-gray-400">›</span>
              <span className="text-gray-500 hover:text-green-600 cursor-pointer transition-colors">{name} in {area}</span>
              <span className="text-gray-400">›</span>
              <span className="text-gray-500 hover:text-green-600 cursor-pointer transition-colors">{location}</span>
              <span className="text-gray-400">›</span>
              <span className="text-green-600 font-semibold">{displayListings.length}+ Listings</span>
            </nav>
          </div>
        </div>

        {/* Dynamic Page Header */}
        <div className="bg-white/60 backdrop-blur-sm py-8 border-b border-gray-200/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{categoryIcon}</span>
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
                    {pageTitle}
                  </h1>
                </div>
                <p className="text-gray-600 text-lg">{categoryDescription}</p>
                
                {/* Dynamic Quick Stats */}
                <div className="flex flex-wrap gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{displayListings.filter(l => l.isOpen).length} Open Now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{displayListings.filter(l => l.rating >= 4.5).length} Highly Rated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{displayListings.length} {name} in {location}</span>
                  </div>
                </div>
              </div>
              
              {/* REMOVED SortingControls from here - now it's inside ListingsContainer */}
            </div>
          </div>
        </div>

        {/* Client-side Listings Container */}
        <div className="container mx-auto px-4 py-8">
          <ListingsContainer 
            initialListings={displayListings}
            categoryName={name}
            location={location}
            fallbackImage={fallbackImage}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Helper functions for dynamic data
function getBadgeType(index: number): string {
  const badges = ["Q Top Search", "Popular", "Trending", "Verified", "Best Rated"];
  return badges[index % badges.length];
}

function getBadgeColor(index: number): string {
  const colors = [
    "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200",
    "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200",
    "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200",
    "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200",
    "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200"
  ];
  return colors[index % colors.length];
}

function getDefaultServices(categoryName: string, index: number): string[] {
  const serviceMap: { [key: string]: string[][] } = {
    "beauty parlours": [
      ["Bridal Makeup", "Hair Styling", "Skincare", "Mehndi"],
      ["Facial", "Threading", "Waxing", "Manicure"],
      ["Hair Color", "Spa", "Pedicure", "Makeover"],
      ["Hair Cut", "Facial Treatment", "Body Massage", "Nail Art"]
    ],
    "doctors": [
      ["General Consultation", "Health Checkup", "Prescription"],
      ["Specialist Consultation", "Diagnostic Tests", "Treatment"],
      ["Emergency Care", "Follow-up", "Medical Advice"]
    ],
    "restaurants": [
      ["Dine-in", "Takeaway", "Home Delivery"],
      ["Fine Dining", "Bar", "Outdoor Seating"],
      ["Buffet", "Family Dining", "Catering"]
    ]
  };

  const defaultServices = ["Service 1", "Service 2", "Service 3", "Professional Services"];
  const categoryServices = serviceMap[categoryName.toLowerCase()];
  
  if (categoryServices) {
    return categoryServices[index % categoryServices.length];
  }
  
  return defaultServices;
}