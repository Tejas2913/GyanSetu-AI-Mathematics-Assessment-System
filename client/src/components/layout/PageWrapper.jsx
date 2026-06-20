// PageWrapper — Root layout shell wrapping all pages
// Includes Navbar, MobileNav, and main content area with proper spacing

import Navbar from './Navbar'
import MobileNav from './MobileNav'

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:pb-6 pb-20">
        {children}
      </main>
      <div className="h-16 md:hidden" />
      <MobileNav />
    </div>
  )
}
