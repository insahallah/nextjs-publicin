'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS2 } from '@/configs/api';

interface Category {
  id?: string | number;
  name?: string;
  label?: string;
  slug?: string;
  subcategories?: Category[];
  childcategories?: Category[];
}

const Hero = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);

  const router = useRouter();

  // 🔹 Utility Functions
  const slugify = (text?: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const cleanLabel = (label?: string): string => {
    if (!label) return '';
    return label.replace(/^[^a-zA-Z0-9]+/, '').trim();
  };

  const getEmojiFromLabel = (label?: string): string => {
    if (!label) return '📁';
    
    const cleanLabelText = cleanLabel(label).toLowerCase();
    
    const emojiMap: { [key: string]: string } = {
      'doctor': '👨‍⚕️',
      'medical': '🏥',
      'health': '❤️',
      'salon': '💇',
      'beauty': '💄',
      'service': '🔧',
      'repair': '🛠️',
      'shop': '🛍️',
      'store': '🏪',
      'food': '🍕',
      'restaurant': '🍴',
      'education': '🎓',
      'school': '🏫',
      'travel': '✈️',
      'hotel': '🏨',
      'car': '🚗',
      'vehicle': '🚙',
      'home': '🏠',
      'electronic': '📱',
      'computer': '💻',
      'phone': '📞',
      'freelancer': '💼',
      'professional': '👔',
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (cleanLabelText.includes(key)) {
        return emoji;
      }
    }

    return '📁';
  };

  // 🔹 Fetch categories
  const fetchCategories = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
///https://allupipay.in/publicsewa/api/main-search.php
      const res = await fetch(API_ENDPOINTS2.AUTH.MAIN_SEARCH);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ API Response:", data);

      let categoriesData: Category[] = [];
      
      // Multiple fallback options for data extraction
      if (Array.isArray(data?.data?.categories)) categoriesData = data.data.categories;
      else if (Array.isArray(data?.data)) categoriesData = data.data;
      else if (Array.isArray(data?.categories)) categoriesData = data.categories;
      else if (Array.isArray(data)) categoriesData = data;
      else {
        console.warn("⚠️ No categories array found in response structure");
      }

      console.log("✅ Categories Array:", categoriesData);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 FIXED: Build proper URL path based on hierarchy
  const buildCategoryPath = (category: Category, subcategory?: Category, childcategory?: Category): string => {
    const parts: string[] = [];
    
    // Always start with parent category
    if (category) {
      const categorySlug = slugify(category.name || category.label || 'doctors');
      parts.push(categorySlug);
    }
    
    // Add subcategory if exists
    if (subcategory) {
      const subcategorySlug = slugify(subcategory.name || subcategory.label || '');
      if (subcategorySlug) parts.push(subcategorySlug);
    }
    
    // Add child category if exists
    if (childcategory) {
      const childSlug = slugify(childcategory.name || childcategory.label || '');
      if (childSlug) parts.push(childSlug);
    }
    
    // Add ID at the end
    const targetId = childcategory?.id || subcategory?.id || category?.id;
    if (targetId) parts.push(targetId.toString());
    
    return `/list/${parts.join('/')}`;
  };

  // 🔹 FIXED: Click Handlers with proper URL structure
  const handleCategoryClick = (category: Category): void => {
    if (category.subcategories && category.subcategories.length > 0) {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    } else {
      // Direct category navigation (no subcategories)
      const url = buildCategoryPath(category);
      console.log("Navigating to:", url);
      router.push(url);
    }
  };

  const handleSubcategoryClick = (subcategory: Category): void => {
    if (!selectedCategory) return;

    if (subcategory.childcategories && subcategory.childcategories.length > 0) {
      setSelectedSubcategory(subcategory);
    } else {
      // Navigate to subcategory with full hierarchy
      const url = buildCategoryPath(selectedCategory, subcategory);
      console.log("Navigating to:", url);
      router.push(url);
    }
  };

  const handleChildCategoryClick = (child: Category): void => {
    if (!selectedCategory || !selectedSubcategory) return;

    // Navigate to child category with full hierarchy
    const url = buildCategoryPath(selectedCategory, selectedSubcategory, child);
    console.log("Navigating to:", url);
    router.push(url);
  };

  // 🔹 Back Navigation
  const handleBackToMain = (): void => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleBackToSubcategories = (): void => {
    setSelectedSubcategory(null);
  };

  // 🔹 Render Loading/Error
  if (loading) {
    return (
      <div className="container margin_120_95 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container margin_120_95 text-center">
        <div className="alert alert-danger">
          {error}
          <div className="mt-2">
            <button className="btn btn-outline-danger btn-sm" onClick={fetchCategories}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Render Child Categories
  if (selectedSubcategory?.childcategories?.length) {
    return (
      <div className="container margin_120_95">
        <div className="main_title text-center mb-4">
          <h2>{cleanLabel(selectedSubcategory.label) || selectedSubcategory.name}</h2>
          <div className="breadcrumb-nav mb-3">
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleBackToMain}>
              🏠 All Categories
            </button>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleBackToSubcategories}>
              ← {cleanLabel(selectedCategory?.label) || selectedCategory?.name}
            </button>
            <span className="btn btn-sm btn-primary">
              {cleanLabel(selectedSubcategory.label) || selectedSubcategory.name}
            </span>
          </div>
          <p className="text-muted">Select a specialty</p>
        </div>

        <div className="row justify-content-center g-2">
          {selectedSubcategory.childcategories.map((child, i) => (
            <div key={child.id || i} className="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-3">
              <div
                className="category-item text-center p-2 shadow-sm rounded h-100 d-flex flex-column"
                style={{ minHeight: '90px', border: '1px solid #e9ecef', cursor: 'pointer' }}
                onClick={() => handleChildCategoryClick(child)}
              >
                <div className="category-icon mb-1" style={{ fontSize: '1.2rem' }}>
                  {getEmojiFromLabel(child.label)}
                </div>
                <h6 className="mb-1 fw-bold" style={{ fontSize: '0.7rem', lineHeight: '1.1' }}>
                  {cleanLabel(child.label) || child.name}
                </h6>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <button className="btn_1 medium me-2" onClick={handleBackToSubcategories}>
            ← Back
          </button>
          <button className="btn_1 medium" onClick={handleBackToMain}>
            🏠 All Categories
          </button>
        </div>
      </div>
    );
  }

  // 🔹 Render Subcategories
  if (selectedCategory?.subcategories?.length) {
    return (
      <div className="container margin_120_95">
        <div className="main_title text-center mb-4">
          <h2>{cleanLabel(selectedCategory.label) || selectedCategory.name}</h2>
          <div className="breadcrumb-nav mb-3">
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleBackToMain}>
              🏠 All Categories
            </button>
            <span className="btn btn-sm btn-primary">
              {cleanLabel(selectedCategory.label) || selectedCategory.name}
            </span>
          </div>
          <p className="text-muted">Select a subcategory</p>
        </div>

        <div className="row justify-content-center g-2">
          {selectedCategory.subcategories.map((sub, i) => (
            <div key={sub.id || i} className="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-3">
              <div
                className="category-item text-center p-2 shadow-sm rounded h-100 d-flex flex-column"
                style={{ minHeight: '90px', border: '1px solid #e9ecef', cursor: 'pointer' }}
                onClick={() => handleSubcategoryClick(sub)}
              >
                <div className="category-icon mb-1" style={{ fontSize: '1.2rem' }}>
                  {getEmojiFromLabel(sub.label)}
                </div>
                <h6 className="mb-1 fw-bold" style={{ fontSize: '0.7rem', lineHeight: '1.1' }}>
                  {cleanLabel(sub.label) || sub.name}
                </h6>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <button className="btn_1 medium" onClick={handleBackToMain}>
            🏠 Back to All Categories
          </button>
        </div>
      </div>
    );
  }

  // 🔹 Render Main Categories
  return (
    <div className="container margin_120_95">
      <div className="main_title text-center mb-4">
        <h2>Publicin - Aapka <strong>all-in-one</strong> platform!</h2>
        <p>Doctor, salon, service center, dukaan, ya freelancer dhundo — humari smart directory se sab kuch milega!</p>
      </div>

      <div className="row justify-content-center g-2">
        {categories.length > 0 ? (
          categories.map((cat, i) => (
            <div key={cat.id || i} className="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-3">
              <div
                className="category-item text-center p-2 shadow-sm rounded h-100 d-flex flex-column"
                style={{ minHeight: '90px', border: '1px solid #e9ecef', cursor: 'pointer' }}
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="category-icon mb-1" style={{ fontSize: '1.2rem' }}>
                  {getEmojiFromLabel(cat.label)}
                </div>
                <h6 className="mb-1 fw-bold" style={{ fontSize: '0.7rem', lineHeight: '1.1' }}>
                  {cleanLabel(cat.label) || cat.name}
                </h6>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info text-center">No categories found.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;