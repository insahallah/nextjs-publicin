import type { Metadata } from 'next'
import ListPageClient from './ListPageClient'

// ================= API FETCH =================
async function getBusiness(id: string) {
  console.log('🔍 getBusiness() called with id:', id)

  try {
    const res = await fetch(
      `https://allupipay.in/publicsewa/api/users/matadata.php?id=${id}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          Accept: 'application/json'
        }
      }
    )

    console.log('📡 API status123:', res.status)

    if (!res.ok) return null

    const data = await res.json()
    if (data?.error) return null

    return data
  } catch (err) {
    console.error('🔥 Fetch failed:', err)
    return null
  }
}

// ================= METADATA =================
export async function generateMetadata(
  { params }: { params: { slug: string[] } }
): Promise<Metadata> {

  const slugArr = params.slug
  const lastSegment = slugArr[slugArr.length - 1]
  
  // 🔴 FIXED: बेहतर ID डिटेक्शन
  // ID या तो पूरी तरह नंबर हो सकता है (123) या sub/cat/child prefix के साथ (sub324)
  const isBusinessPage = /^\d+$|^(sub|cat|child)\d+/i.test(lastSegment)

  // 👉 CANONICAL URL (COMMON FOR ALL CASES)
  const canonical = `https://www.publicin.in/list/${slugArr.join('/')}`

  // ================= CATEGORY PAGE =================
  if (!isBusinessPage) {
    const categoryName = lastSegment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())

    return {
      metadataBase: new URL('https://www.publicin.in'),
      title: `${categoryName} Services in India | PublicIn`,
      description: `Find trusted ${categoryName} services near you. Verified businesses, reviews and contact details.`,
      alternates: { canonical },
      robots: { index: true, follow: true }
    }
  }

  // ================= BUSINESS PAGE =================
  // 🔴 FIXED: ID निकालने के लिए regex
  const idMatch = lastSegment.match(/\d+/)
  const businessId = idMatch ? idMatch[0] : lastSegment

  console.log('📡 BDDDDDDD:', isBusinessPage);

  const business = await getBusiness(businessId)

  // 👉 BUSINESS NOT FOUND - SHOW SLUGS IN TITLE
  if (!business) {
    // Format slugs for title
    const formattedSlugs = slugArr
      .map(slug => 
        slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
      )
      .join(' | ')

    return {
      metadataBase: new URL('https://www.publicin.in'),
      title: `${formattedSlugs} | PublicIn`,
      description: 'Find trusted services and businesses on PublicIn.',
      alternates: { canonical },
      robots: { index: false, follow: false }
    }
  }

  // 👉 CATEGORY CHAIN (NULL SAFE)
  const categories = [
    business.mainCategory,
    business.subCategory,
    business.childCategory
  ]
    .filter(Boolean)
    .join(' > ')

  // 👉 LOCATION CHAIN
  const location = [
    business.village,
    business.block,
    business.district
  ]
    .filter(Boolean)
    .join(', ')

  // 👉 SEO TITLE
  const title =
    `${business.businessName}` +
    (categories ? ` | ${categories}` : '') +
    (location ? ` in ${location}` : '')

  // 👉 META DESCRIPTION
  const description =
    `${business.businessName} is a trusted ${categories || 'local service provider'}` +
    (location ? ` in ${location}` : '') +
    `. Call ${business.mobile} for details, directions and services.`

  // 👉 OG IMAGE (FIRST IMAGE SAFE)
  const ogImage =
    business.images?.length > 0
      ? `https://allupipay.in/${business.images[0]}`
      : 'https://www.publicin.in/default-og.jpg'

  return {
    metadataBase: new URL('https://www.publicin.in'),
    title,
    description,
    alternates: { canonical },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'PublicIn',
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630
        }
      ]
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },

    robots: {
      index: true,
      follow: true
    }
  }
}

// ================= PAGE =================
export default function ListPage({
  params
}: {
  params: { slug: string[] }
}) {
  return <ListPageClient params={params} />
}