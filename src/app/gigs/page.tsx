'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Gigs() {
  const [gigs, setGigs] = useState<any[]>([])
  const [newGig, setNewGig] = useState({ title: '', description: '', gig_date: '', start_time: '', end_time: '', budget: '' })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offerPrice, setOfferPrice] = useState<string>('')

  useEffect(() => {
    fetchUserAndGigs()
  }, [])

  async function fetchUserAndGigs() {
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      setUser(user)
      const { data: gigs, error: gigsError } = await supabase
        .from('gigs')
        .select(`
          *,
          user:user_id (
            id,
            email,
            reviews:reviews!reviewee_id(rating)
          )
        `)
        .order('gig_date', { ascending: true })
      if (gigsError) throw gigsError
      
      // Calculate average rating for each gig creator
      const gigsWithRating = gigs?.map(gig => ({
        ...gig,
        averageRating: gig.user.reviews.length > 0
          ? gig.user.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / gig.user.reviews.length
          : null
      })) || []
      
      setGigs(gigsWithRating)
    } catch (err) {
      console.error('Error fetching user and gigs:', err)
      setError('Failed to fetch gigs. Please try again later.')
    }
    setLoading(false)
  }

  async function handleCreateGig(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      alert('You must be logged in to create a gig')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('gigs')
        .insert([{ ...newGig, user_id: user.id, budget: parseFloat(newGig.budget) }])
      if (error) throw error
      setNewGig({ title: '', description: '', gig_date: '', start_time: '', end_time: '', budget: '' })
      fetchUserAndGigs()
    } catch (err) {
      console.error('Error creating gig:', err)
      setError('Failed to create gig. Please try again.')
    }
    setLoading(false)
  }

  async function handleMakeOffer(gigId: string) {
    if (!user) {
      alert('You must be logged in to make an offer')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('offers')
        .insert([{ gig_id: gigId, user_id: user.id, price: parseFloat(offerPrice) }])
      if (error) throw error
      setOfferPrice('')
      alert('Offer submitted successfully!')
    } catch (err) {
      console.error('Error making offer:', err)
      setError('Failed to submit offer. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Gigs</h1>
      
      {user && (
        <form onSubmit={handleCreateGig} className="mb-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Create a New Gig</h2>
          <input
            type="text"
            placeholder="Gig Title"
            value={newGig.title}
            onChange={(e) => setNewGig({ ...newGig, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <textarea
            placeholder="Gig Description"
            value={newGig.description}
            onChange={(e) => setNewGig({ ...newGig, description: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="date"
            value={newGig.gig_date}
            onChange={(e) => setNewGig({ ...newGig, gig_date: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <div className="flex space-x-4 mb-4">
            <input
              type="time"
              value={newGig.start_time}
              onChange={(e) => setNewGig({ ...newGig, start_time: e.target.value })}
              className="w-1/2 p-2 border rounded"
              required
            />
            <input
              type="time"
              value={newGig.end_time}
              onChange={(e) => setNewGig({ ...newGig, end_time: e.target.value })}
              className="w-1/2 p-2 border rounded"
              required
            />
          </div>
          <input
            type="number"
            step="0.01"
            placeholder="Budget"
            value={newGig.budget}
            onChange={(e) => setNewGig({ ...newGig, budget: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" disabled={loading}>
            {loading ? 'Creating...' : 'Create Gig'}
          </button>
        </form>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading gigs...</p>
      ) : gigs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div key={gig.id} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-2">{gig.title}</h2>
              <p className="text-gray-600 mb-2">{gig.description}</p>
              <p className="text-gray-600">Date: {new Date(gig.gig_date).toLocaleDateString()}</p>
              <p className="text-gray-600">Time: {gig.start_time} - {gig.end_time}</p>
              <p className="text-gray-600 font-bold">Budget: ${gig.budget.toFixed(2)}</p>
              <p className="text-gray-600">
                Creator Rating: {gig.averageRating ? gig.averageRating.toFixed(1) + ' / 5' : 'No ratings yet'}
              </p>
              {user && user.id !== gig.user_id && (
                <div className="mt-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Your offer"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <button
                    onClick={() => handleMakeOffer(gig.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
                  >
                    Make Offer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No gigs available at the moment.</p>
      )}
    </div>
  )
}