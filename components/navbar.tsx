"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Mock authentication state - in a real app, this would come from your auth context
  const isLoggedIn = false
  const isAdmin = false

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Skip navbar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">IPL Prediction</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Home
            </Link>
            <Link href="/matches" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Matches
            </Link>
            <Link href="/leaderboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Leaderboard
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Admin
                  </Link>
                )}
                <Button variant="outline" className="ml-2">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100" onClick={closeMenu}>
              Home
            </Link>
            <Link
              href="/matches"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={closeMenu}
            >
              Matches
            </Link>
            <Link
              href="/leaderboard"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={closeMenu}
            >
              Leaderboard
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                )}
                <Button variant="outline" className="w-full mt-2" onClick={closeMenu}>
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" onClick={closeMenu}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register" onClick={closeMenu}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

