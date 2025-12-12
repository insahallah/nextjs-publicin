// app/myprofile/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Edit, 
  Upload, 
  Link, 
  MessageCircle,
  Mail,
  Globe,
  Video,
  Share2,
  ChevronRight,
  X,
  ArrowRight
} from 'lucide-react';

// Define type for the item IDs
type BusinessItemId = 
  | 'Business Name'
  | 'Contact Details'
  | 'Business Address'
  | 'Map Location'
  | 'Business Timings'
  | 'Year of Establishment'
  | 'Business Categories'
  | 'Business Website'
  | 'Social Media'
  | 'Business Tools'
  | 'KYC, Payments & Invoices'
  | 'Additional Business Info';

export default function MyProfile() {
  const router = useRouter();
  const [businessScore, setBusinessScore] = useState<number>(27);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);

  const handleBack = () => {
    router.back();
  };

  const handleEditProfileClick = () => {
    setIsEditProfileModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditProfileModalOpen(false);
  };

  // Add explicit type for itemId parameter
  const handleItemClick = (itemId: BusinessItemId) => {
    // Handle navigation for different items
    switch(itemId) {
      case 'Business Name':
        router.push('/edit/business-name');
        break;
      case 'Contact Details':
        router.push('/edit/contact-details');
        break;
      case 'Business Address':
        router.push('/edit/business-address');
        break;
      case 'Map Location':
        router.push('/edit/map-location');
        break;
      case 'Business Timings':
        router.push('/edit/business-timings');
        break;
      case 'Year of Establishment':
        router.push('/edit/year-establishment');
        break;
      case 'Business Categories':
        router.push('/edit/business-categories');
        break;
      case 'Business Website':
        router.push('/edit/business-website');
        break;
      case 'Social Media':
        router.push('/edit/social-media');
        break;
      case 'Business Tools':
        router.push('/edit/business-tools');
        break;
      case 'KYC, Payments & Invoices':
        router.push('/edit/kyc-payments');
        break;
      case 'Additional Business Info':
        router.push('/edit/additional-info');
        break;
      default:
        break;
    }
  };

  const profileItems = [
    { icon: <Edit size={20} />, label: "Advertise", color: "bg-blue-500" },
    { icon: <Edit size={20} />, label: "Edit Profile", color: "bg-green-500", onClick: handleEditProfileClick },
    { icon: <Star size={20} />, label: "Reviews", color: "bg-yellow-500" },
    { icon: <Upload size={20} />, label: "Add Photos", color: "bg-purple-500" },
    { icon: <MessageCircle size={20} />, label: "Add Contact", color: "bg-pink-500" },
    { icon: <Mail size={20} />, label: "Add Email", color: "bg-red-500" },
    { icon: <MessageCircle size={20} />, label: "Add WhatsApp", color: "bg-green-600" },
    { icon: <Upload size={20} />, label: "Upload Catalogue", color: "bg-indigo-500" },
    { icon: <Star size={20} />, label: "Add Offer", color: "bg-orange-500" },
    { icon: <Globe size={20} />, label: "Add Website", color: "bg-blue-600" },
    { icon: <Video size={20} />, label: "Add Video", color: "bg-red-600" },
    { icon: <Link size={20} />, label: "Add Social Links", color: "bg-purple-600" },
    { icon: <Star size={20} />, label: "Ratings", color: "bg-yellow-600" }
  ];

  const businessProfileItems: Array<{
    id: BusinessItemId;
    icon: string;
    title: string;
    status: string;
    value: string;
  }> = [
    {
      id: "Business Name",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/business_name_icon.svg",
      title: "Business Name",
      status: "",
      value: "Alisha computer"
    },
    {
      id: "Contact Details",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/contact_details_icon.svg",
      title: "Contact Details",
      status: "Missing Info",
      value: "+(91)-8210249746"
    },
    {
      id: "Business Address",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/map_location_icon.svg",
      title: "Business Address",
      status: "Street Missing",
      value: "36,Parmanikdih,Masjid,Jamua-815318"
    },
    {
      id: "Map Location",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/map_location_icon_new.svg",
      title: "Map Location",
      status: "Missing Info",
      value: ""
    },
    {
      id: "Business Timings",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/clock_icon.svg",
      title: "Business Timings",
      status: "",
      value: "Open Now"
    },
    {
      id: "Year of Establishment",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/yr_of_est_icon.svg",
      title: "Year of Establishment",
      status: "Missing Info",
      value: ""
    },
    {
      id: "Business Categories",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/bus_categories.svg",
      title: "Business Categories",
      status: "",
      value: "Computer Training Institutes, Computer Training Institutes-Check Point"
    },
    {
      id: "Business Website",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/website_url_icon.svg",
      title: "Business Website",
      status: "Missing Info",
      value: "Add Your Website Link to Showcase On Your Business Profile Page"
    },
    {
      id: "Social Media",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/social_media_channels_icon.svg",
      title: "Social Media",
      status: "Missing Info",
      value: ""
    },
    {
      id: "Business Tools",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/business_name_icon.svg",
      title: "Business Tools",
      status: "20 Pending",
      value: "Manage Offers, Reviews and more"
    },
    {
      id: "KYC, Payments & Invoices",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/bs_kyc_icon.svg",
      title: "KYC, Payments & Invoices",
      status: "Missing",
      value: "Update KYC Details"
    },
    {
      id: "Additional Business Info",
      icon: "https://akam.cdn.jdmagicbox.com/images/icontent/analytics/bs_businfo_icon.svg",
      title: "Additional Business Info",
      status: "Info Missing",
      value: "Update Classes for, Courses Taught, Mode of Instruction and more"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky with Shadow */}
      <div className="Header_header__container__Ho9Db sticky top-0 z-50 shadow-lg">
        <header className="Header_header__wrap__HHVYl">
          {/* Left Section */}
          <div className="Header_header__wrap__left__vye4_">
            <span 
              tabIndex={0}
              className="Header_backicon__oKkvl"
              onClick={handleBack}
              role="button"
              aria-label="Go back"
            ></span>
            
            <div className="Header_companyname__FBv6M" tabIndex={0}>
              <div className="color111 Header_companyname__name__RKVtv">
                Alisha computer
              </div>
              <div className="color777 Header_companyname__area__bz968">
                Jamua
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="Header_header__wrap__right__9crNK" tabIndex={0}>
            <button className="Header_help_btn__kCm_a">
              <figure className="Header_help_figure__xVmFC">
                <img 
                  src="https://akam.cdn.jdmagicbox.com/images/icontent/newwap/editnew/Help_Icon_Animation_8Sep25.gif" 
                  alt="Help Icon"
                />
                <figcaption className="pl-8">Help</figcaption>
              </figure>
              <svg 
                className="Header_border_svg__ZQLqz" 
                viewBox="0 0 200 60" 
                preserveAspectRatio="none"
              >
                <rect 
                  className="Header_border_path__pnsCp" 
                  x="1" 
                  y="1" 
                  width="198" 
                  height="58" 
                  rx="31" 
                  ry="31"
                ></rect>
              </svg>
            </button>
          </div>
        </header>
      </div>

      {/* Progress Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-blue-50 rounded-lg p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Increase Business Profile Score
            </h2>
            <p className="text-gray-600 mb-4">
              Reach out to more customers
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${businessScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Edit Profile Section */}
        <div className="bg-white rounded-lg shadow-md border mb-6 hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Edit size={20} />
              Edit Profile
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profileItems.map((item, index) => (
                <div
                  key={index}
                  onClick={item.onClick || (() => {})}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border"
                >
                  <div className={`p-3 rounded-full ${item.color} text-white mb-2 shadow-md`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-md border mb-6 hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
          </div>
          <div className="p-6">
            <div className="text-gray-600 mb-2">Categories</div>
            <div className="text-gray-600 mb-6">Services and products</div>
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Contact Details */}
          <div className="bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add Contact Details
            </h3>
            <p className="text-gray-600 mb-4">
              Multiple contact details ensure easy customer access
            </p>
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
              ADD CONTACT INFO
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Add WhatsApp */}
          <div className="bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add WhatsApp Number
            </h3>
            <p className="text-gray-600 mb-4">
              Offer customers a fast, easy chat option
            </p>
            <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
              ADD WHATSAPP
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* My Business Section */}
        <div className="bg-white rounded-lg shadow-md border mt-6 hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">My Business</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              Business details and analytics will appear here
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          ></div>
          
          {/* Modal Sidebar */}
          <div className="jdBusiness_sidebar__inner__zOFej relative bg-white w-full max-w-md ml-auto h-full overflow-y-auto animate-slide-in-right">
            {/* Header */}
            <div className="jdBusiness_profile__header__6EL2T sticky top-0 bg-white border-b p-4 flex items-center gap-3 z-10">
              <button 
                onClick={handleCloseModal}
                className="jdBusiness_backicon__ZC_ri p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <span className="text-lg font-semibold">Business Profile</span>
            </div>

            {/* Content */}
            <div className="jdBusiness_profile__wrapper__AQgKJ p-4">
              <div className="jdBusiness_profile__wrapper__anchrwrap__RC3B8 space-y-2">
                {businessProfileItems.map((item) => (
                  <div
                    key={item.id}
                    id={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="jdBusiness_profile__wrapper__anchrwrap__ripple___6XCj p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border group relative"
                  >
                    <div className="flex items-start gap-3">
                      <img 
                        alt={item.title} 
                        src={item.icon} 
                        className="jdBusiness_icbx_26__0RuRm w-6 h-6 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="jdBusiness_p_text__BwDSF text-sm font-medium">
                            {item.title}
                          </span>
                          {item.status && (
                            <span className="jdBusiness_missing_profile__XxwpN text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              {item.status}
                            </span>
                          )}
                        </div>
                        {item.value && (
                          <div className="jdBusiness_p_subtext__79c3a">
                            <span className="jdBusiness_p_subtext_1__0QBi_ text-sm text-gray-600">
                              {item.value}
                            </span>
                          </div>
                        )}
                      </div>
                      <ArrowRight 
                        size={16} 
                        className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" 
                      />
                    </div>
                  </div>
                ))}

                {/* Photos and Videos Section */}
                <div 
                  onClick={() => router.push('/edit/photos-videos')}
                  className="jdBusiness_videowrap__N8wQY mt-6 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="jdBusiness_videowrap__heading__jmVKN mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://akam.cdn.jdmagicbox.com/images/icontent/analytics/add_photo_bg.svg" 
                        width="22" 
                        height="22" 
                        alt="Photos and Videos" 
                      />
                      <span className="font-medium">Photos and Videos</span>
                    </div>
                    <ArrowRight 
                      size={16} 
                      className="text-gray-400 group-hover:text-blue-600 transition-colors" 
                    />
                  </div>
                  <div className="jdBusiness_videowrap__container__ja4Jb">
                    <div className="flex">
                      <div className="jdBusiness_videowrap__container__list__YBKxP jdBusiness_videowrap__container__addphoto__0tizG border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer w-full">
                        <div className="jdBusiness_addphoto__text__5Qdd1 text-sm text-gray-600 font-medium">
                          Add Photos and Videos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Website with Banner */}
                <div 
                  onClick={() => router.push('/edit/business-website')}
                  className="jdBusiness_profile__wrapper__anchrwrap__ripple___6XCj jdBusiness_omnibanner__u3zZU p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border group relative mt-4"
                >
                  <div className="flex items-start gap-3">
                    <img 
                      alt="Business Website" 
                      src="https://akam.cdn.jdmagicbox.com/images/icontent/analytics/website_url_icon.svg" 
                      className="jdBusiness_icbx_26__0RuRm w-6 h-6 mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="jdBusiness_p_text__BwDSF text-sm font-medium">
                          Business Website
                        </span>
                        <span className="jdBusiness_missing_profile__XxwpN text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Missing Info
                        </span>
                      </div>
                      <div className="jdBusiness_p_subtext__79c3a">
                        <span className="jdBusiness_p_subtext_1__0QBi_ text-sm text-gray-600">
                          Add Your Website Link to Showcase On Your Business Profile Page
                        </span>
                      </div>
                    </div>
                    <ArrowRight 
                      size={16} 
                      className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" 
                    />
                  </div>
                  <img 
                    className="jdBusiness_bannerimg__6v91i absolute bottom-2 right-2 w-20 h-12 object-cover rounded" 
                    src="https://akam.cdn.jdmagicbox.com/images/icontent/analytics/EL_omni_website_banner(mob).png" 
                    alt="Website Banner"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .Header_header__container__Ho9Db {
          width: 100%;
          background: #fff;
          border-bottom: 1px solid #e5e5e5;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }

        .Header_header__wrap__HHVYl {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .Header_header__wrap__left__vye4_ {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .Header_backicon__oKkvl {
          position: relative;
          width: 24px;
          height: 24px;
          cursor: pointer;
          border: none;
          background: none;
          transition: all 0.3s ease;
        }

        .Header_backicon__oKkvl:hover {
          transform: translateX(-2px);
        }

        .Header_backicon__oKkvl::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 12px;
          height: 12px;
          border-left: 2px solid #333;
          border-bottom: 2px solid #333;
          transform: translateY(-50%) rotate(45deg);
          transition: all 0.3s ease;
        }

        .Header_backicon__oKkvl:hover::before {
          border-left: 2px solid #0066cc;
          border-bottom: 2px solid #0066cc;
        }

        .Header_companyname__FBv6M {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .Header_companyname__FBv6M:hover .Header_companyname__name__RKVtv {
          color: #0066cc;
        }

        .color111 {
          color: #111;
        }

        .color777 {
          color: #777;
        }

        .Header_companyname__name__RKVtv {
          font-size: 18px;
          font-weight: 600;
          line-height: 1.2;
          transition: color 0.3s ease;
        }

        .Header_companyname__area__bz968 {
          font-size: 14px;
          line-height: 1.2;
          margin-top: 2px;
        }

        .Header_header__wrap__right__9crNK {
          display: flex;
          align-items: center;
        }

        .Header_help_btn__kCm_a {
          position: relative;
          background: transparent;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          min-width: 120px;
          height: 44px;
          transition: all 0.3s ease;
        }

        .Header_help_btn__kCm_a:hover {
          transform: translateY(-1px);
        }

        .Header_help_figure__xVmFC {
          display: flex;
          align-items: center;
          margin: 0;
          gap: 8px;
          z-index: 1;
          position: relative;
        }

        .Header_help_figure__xVmFC img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .Header_help_btn__kCm_a:hover .Header_help_figure__xVmFC img {
          transform: scale(1.1);
        }

        .Header_help_figure__xVmFC figcaption {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .pl-8 {
          padding-left: 8px;
        }

        .Header_border_svg__ZQLqz {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .Header_border_path__pnsCp {
          fill: none;
          stroke: #e5e5e5;
          stroke-width: 2;
          transition: all 0.3s ease;
        }

        .Header_help_btn__kCm_a:hover .Header_border_path__pnsCp {
          stroke: #0066cc;
          stroke-width: 2.5;
          filter: drop-shadow(0 2px 4px rgba(0, 102, 204, 0.2));
        }

        .Header_help_btn__kCm_a:hover .Header_help_figure__xVmFC figcaption {
          color: #0066cc;
        }

        /* Modal Animation */
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        /* Focus styles for accessibility */
        .Header_backicon__oKkvl:focus,
        .Header_companyname__FBv6M:focus,
        .Header_header__wrap__right__9crNK:focus {
          outline: 2px solid #0066cc;
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Enhanced shadow effects */
        .shadow-lg {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }

        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .shadow-inner {
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .Header_header__wrap__HHVYl {
            padding: 10px 12px;
          }
          
          .Header_companyname__name__RKVtv {
            font-size: 16px;
          }
          
          .Header_companyname__area__bz968 {
            font-size: 12px;
          }
          
          .Header_help_btn__kCm_a {
            min-width: 100px;
            height: 40px;
          }
          
          .Header_help_figure__xVmFC img {
            width: 20px;
            height: 20px;
          }
          
          .Header_help_figure__xVmFC figcaption {
            font-size: 12px;
          }

          .jdBusiness_sidebar__inner__zOFej {
            max-width: 100% !important;
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}