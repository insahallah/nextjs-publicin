import { notFound } from "next/navigation";
import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import ListingImage from "@/components/ListingImage";

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
      .map((l) => ({
        ...l,
        imageUrl: getImageUrl(l.images?.[0]?.path),
        rating: l.averageRating || 0,
        reviewCount: l.ratingCount || 0,
        displayName: l.businessName || "Service Provider",
        location: [l.city, l.district, l.state].filter(Boolean).join(", "),
      }));
  } catch (e) {
    console.error("💥 Fetch failed:", e);
    return [];
  }
}

// ⭐ Rating stars component
function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <i key={i} className={`icon_star ${i < rating ? "voted" : ""}`}></i>
  ));
}

// 🚀 Main Page Component
export default async function ListPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug || !Array.isArray(slug)) return notFound();

  const { id, name, path } = await getCategoryInfo(slug);

  if (!id) return notFound();

  // ✅ FIXED: Pass slug array instead of just id
  const listings = await fetchListings(slug);

  return (
    <div id="page">
      <Header />

      <main className="theia-exception">
        {/* Results Header */}
        <div id="results">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h4>
                  <strong>Showing {listings.length}</strong> results for {name}
                </h4>
                <small className="text-muted">Category Path: {path}</small>
              </div>
              <div className="col-md-6">
                <div className="search_bar_list">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex. Specialist, Name, Doctor..."
                  />
                  <input type="submit" value="Search" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters_listing">
          <div className="container">
            <ul className="clearfix">
              <li>
                <h6>Type</h6>
                <div className="switch-field">
                  <input type="radio" id="all" name="type_patient" value="all" defaultChecked />
                  <label htmlFor="all">All</label>
                  <input type="radio" id="doctors" name="type_patient" value="doctors" />
                  <label htmlFor="doctors">Doctors</label>
                  <input type="radio" id="clinics" name="type_patient" value="clinics" />
                  <label htmlFor="clinics">Clinics</label>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Listings */}
        <div className="container margin_60_35">
          <div className="row">
            <div className="col-lg-7">
              {listings.length > 0 ? (
                listings.map((listing, index) => (
                  <div key={listing.id || index} className="strip_list wow fadeIn">
                    <figure>
                      <a href={`/detail/${listing.id}`}>
                        <ListingImage
                          src={listing.imageUrl}
                          alt={listing.displayName}
                          fallbackSrc="/default-doctor.jpg"
                        />
                      </a>
                    </figure>
                    <small>{name}</small>
                    <h3>{listing.displayName}</h3>
                    <p>{listing.description || "Professional service provider."}</p>
                    <span className="rating">
                      {renderStars(Math.round(listing.rating))}
                      <small>({listing.reviewCount})</small>
                    </span>
                    <ul>
                      <li>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(listing.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Directions
                        </a>
                      </li>
                      <li>
                        <a href={`/detail/${listing.id}`}>Book now</a>
                      </li>
                    </ul>
                  </div>
                ))
              ) : (
                <div className="strip_list wow fadeIn text-center">
                  <div className="display-1 text-muted mb-3">🏥</div>
                  <h3 className="text-muted">No Active {name} Found</h3>
                  <p className="text-muted mb-4">
                    No active {name.toLowerCase()} listings available.
                    <br />
                    <small>Category ID: {id}</small>
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="col-lg-5" id="sidebar">
              <div id="map_listing" className="normal_list text-center p-4">
                <i className="icon-map-1" style={{ fontSize: "48px", color: "#ccc" }}></i>
                <p className="mt-2 text-muted">Interactive Map</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <div id="toTop"></div>
    </div>
  );
}