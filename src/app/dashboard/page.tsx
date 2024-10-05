'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Notifications from '@/components/Notifications'
import MessageSystem from '@/components/MessageSystem'
import ReviewForm from '@/components/ReviewForm'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userGigs, setUserGigs] = useState<any[]>([])
  const [userOffers, setUserOffers] = useState<any[]>([])
  const [userServices, setUserServices] = useState<any[]>([])
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  async function fetchUserData() {
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      setUser(user)
      if (user) {
        const [gigs, offers, services, bookings] = await Promise.all([
          fetchUserGigs(user.id),
          fetchUserOffers(user.id),
          fetchUserServices(user.id),
          fetchUserBookings(user.id)
        ])
        setUserGigs(gigs)
        setUserOffers(offers)
        setUserServices(services)
        setUserBookings(bookings)
      } else {
        router.push('/auth/login')
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('Failed to fetch your data. Please try again later.')
    }
    setLoading(false)
  }

  async function fetchUserGigs(userId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .select('*, offers(*), reviews(*)')
      .eq('user_id', userId)
      .order('gig_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching user gigs:', error)
      return []
    }
    return data
  }

  async function fetchUserOffers(userId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select('*, gigs(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user offers:', error)
      return []
    }
    return data
  }

  async function fetchUserServices(userId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user services:', error)
      return []
    }
    return data
  }

  async function fetchUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(*)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching user bookings:', error)
      return []
    }
    return data
  }

  async function handleAcceptOffer(offerId: string, gigId: string) {
    try {
      await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId)
      await supabase.from('gigs').update({ status: 'assigned' }).eq('id', gigId)
      fetchUserData()
    } catch (err) {
      console.error('Error accepting offer:', err)
      setError('Failed to accept offer. Please try again.')
    }
  }

  async function handleCompleteGig(gigId: string) {
    try {
      await supabase.from('gigs').update({ status: 'completed' }).eq('id', gigId)
      fetchUserData()
    } catch (err) {
      console.error('Error completing gig:', err)
      setError('Failed to complete gig. Please try again.')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Please log in to view your dashboard.</p>
        <Link href="/auth/login" className="text-blue-500 hover:text-blue-600">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">Welcome, {user.email}!</p>

      <div className="mb-8">
        <Notifications userId={user.id} />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Gigs</h2>
        {userGigs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGigs.map((gig) => (
              <div key={gig.id} className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-2">{gig.title}</h3>
                <p className="text-gray-600 mb-2">{gig.description}</p>
                <p className="text-gray-600">Date: {new Date(gig.gig_date).toLocaleDateString()}</p>
                <p className="text-gray-600">Time: {gig.start_time} - {gig.end_time}</p>
                <p className="text-gray-600 font-bold">Budget: ${gig.budget.toFixed(2)}</p>
                <p className="text-gray-600">Status: {gig.status}</p>
                <h4 className="font-bold mt-4">Offers:</h4>
                {gig.offers.length > 0 ? (
                  <ul>
                    {gig.offers.map((offer: any) => (
                      <li key={offer.id} className="mb-2">
                        ${offer.price.toFixed(2)} - {offer.status}
                        {offer.status === 'pending' && gig.status === 'open' && (
                          <button
                            onClick={() => handleAcceptOffer(offer.id, gig.id)}
                            className="ml-2 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
                          >
                            Accept
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No offers yet</p>
                )}
                {gig.status === 'assigned' && (
                  <button
                    onClick={() => handleCompleteGig(gig.id)}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Mark as Completed
                  </button>
                )}
                {gig.status === 'completed' && gig.reviews.length === 0 && (
                  <ReviewForm
                    gigId={gig.id}
                    revieweeId={gig.offers.find((o: any) => o.status === 'accepted').user_id}
                    onReviewSubmitted={fetchUserData}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't created any gigs yet.</p>
        )}
        <Link href="/gigs" className="mt-4 text-blue-500 hover:text-blue-600 inline-block">
          Create a new gig
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Offers</h2>
        {userOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userOffers.map((offer) => (
              <div key={offer.id} className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-2">{offer.gigs.title}</h3>
                <p className="text-gray-600 mb-2">Your offer: ${offer.price.toFixed(2)}</p>
                <p className="text-gray-600">Status: {offer.status}</p>
                {offer.status === 'accepted' && offer.gigs.status === 'completed' && (
                  <ReviewForm
                    gigId={offer.gigs.id}
                    revieweeId={offer.gigs.user_id}
                    onReviewSubmitted={fetchUserData}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't made any offers yet.</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Services</h2>
        {userServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userServices.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't offered any services yet.</p>
        )}
        <Link href="/services" className="mt-4 text-blue-500 hover:text-blue-600 inline-block">
          Offer a new service
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
        {userBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-2">{booking.services.title}</h3>
                <p className="text-gray-600 mb-2">Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4">Status: {booking.status}</p>
                <MessageSystem
                  bookingId={booking.id}
                  currentUserId={user.id}
                  otherUserId={booking.services.user_id}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't made any bookings yet.</p>
        )}
        <Link href="/services" className="mt-4 text-blue-500 hover:text-blue-600 inline-block">
          Book a service
        </Link>
      </div>
    </div>
  )
}