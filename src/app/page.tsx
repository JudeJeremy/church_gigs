'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [featuredGigs, setFeaturedGigs] = useState<any[]>([])
  const [featuredServices, setFeaturedServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
    fetchFeaturedGigs()
    fetchFeaturedServices()
  }, [])

  async function fetchUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function fetchFeaturedGigs() {
    const { data, error } = await supabase
      .from('gigs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) {
      console.error('Error fetching featured gigs:', error)
    } else {
      setFeaturedGigs(data || [])
    }
  }

  async function fetchFeaturedServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) {
      console.error('Error fetching featured services:', error)
    } else {
      setFeaturedServices(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Church Gigs Marketplace</h1>
      <p className="mb-4">Find and offer church-related services like piano playing, worship leading, event planning, and more.</p>
      
      {user ? (
        <div className="space-y-4">
          <p className="text-lg">Welcome back, {user.email}!</p>
          <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-x-4">
          <Link href="/auth/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block">
            Sign Up
          </Link>
          <Link href="/auth/login" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-block">
            Log In
          </Link>
        </div>
      )}

      {loading ? (
        <p className="mt-8">Loading featured gigs and services...</p>
      ) : (
        <>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Featured Gigs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredGigs.map((gig) => (
                <div key={gig.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">{gig.title}</h3>
                  <p>{gig.description}</p>
                </div>
              ))}
            </div>
            <Link href="/gigs" className="mt-4 text-blue-500 hover:text-blue-600 inline-block">View all gigs</Link>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Featured Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredServices.map((service) => (
                <div key={service.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>
            <Link href="/services" className="mt-4 text-blue-500 hover:text-blue-600 inline-block">View all services</Link>
          </div>
        </>
      )}
    </div>
  )
}
