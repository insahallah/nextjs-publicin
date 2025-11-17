// app/my-businesses/page.tsx
import MyBusinesses from '@/components/MyBusinesses'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function MyBusinessesPage() {
  return (
    <LayoutWithSidebar>
      <MyBusinesses />
    </LayoutWithSidebar>
  )
}