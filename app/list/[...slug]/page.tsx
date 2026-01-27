import type { Metadata } from 'next'
import ListPageClient from './ListPageClient'
import { API_ENDPOINTS2 } from '@/configs/api';
// ================= API FETCH =================
async function getBusiness(id: string) {
  try {
    const res = await fetch(
      `${API_ENDPOINTS2.AUTH.MATADATA}?id=${id}`,
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

    if (!res.ok) return null
    const data = await res.json()
    if (data?.error) return null

    return data
  } catch (err) {
    console.error('Fetch error:', err)
    return null
  }
}

// ================= METADATA =================
export async function generateMetadata(
  { params }: { params: { slug: string[] } }
): Promise<Metadata> {

  const slugArr = params.slug
  const lastSegment = slugArr[slugArr.length - 1]

  // ID detect (123 | sub123 | cat123 | child123)
  const isBusinessPage = /^\d+$|^(sub|cat|child)\d+/i.test(lastSegment)

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
  const idMatch = lastSegment.match(/\d+/)
  const businessId = idMatch ? idMatch[0] : lastSegment

  const business = await getBusiness(businessId)

  if (!business) {
    const formattedSlugs = slugArr
      .map(slug =>
        slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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

  const categories = [
    business.mainCategory,
    business.subCategory,
    business.childCategory
  ].filter(Boolean).join(' > ')

  const location = [
    business.village,
    business.block,
    business.district
  ].filter(Boolean).join(', ')

  const title =
    `${business.businessName}` +
    (categories ? ` | ${categories}` : '') +
    (location ? ` in ${location}` : '')

  const description =
    `${business.businessName} is a trusted ${categories || 'local service provider'}` +
    (location ? ` in ${location}` : '') +
    `. Call ${business.mobile} for details, directions and services.`

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
      images: [{ url: ogImage, width: 1200, height: 630 }]
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },

    robots: { index: true, follow: true }
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
