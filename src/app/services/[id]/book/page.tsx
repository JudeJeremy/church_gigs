'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BookService({ params }: { params: { id: string } }) {
  const [service, setService] = useState<any>(null)
  const [bookingDate, setBookingDate] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserAndService()
  }, [])

  async function fetchUserAndService() {
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      setUser(user)

      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', params.id)
        .single()
      if (serviceError) throw serviceError
      setService(service)
    } catch (err) {
      console.error('Error fetching user and service:', err)
      setError('Failed to fetch service details. Please try again later.')
    }
    setLoading(false)
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      alert('You must be logged in to book a service')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{ 
          service_id: params.id, 
          user_id: user.id,
          booking_date: bookingDate
        }])
      if (error) throw error
      alert('Booking successful!')
      router.push('/dashboard')
    } catch (err) {
      console.error('Error creating booking:', err)
      setError('Failed to create booking. Please try again.')
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  }

  if (!service) {
    return <div className="container mx-auto px-4 py-8">Service not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book Service: {service.title}</h1>
      <p className="mb-4">{service.description}</p>
      
      <form onSubmit={handleBooking} className="mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Select Booking Date</h2>
        <input
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" disabled={loading}>
          {loading ? 'Booking...' : 'Book Now'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}