'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Services() {
  const [services, setServices] = useState<any[]>([])
  const [newService, setNewService] = useState({ title: '', description: '' })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserAndServices()
  }, [])

  async function fetchUserAndServices() {
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      setUser(user)
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
      if (servicesError) throw servicesError
      setServices(services || [])
    } catch (err) {
      console.error('Error fetching user and services:', err)
      setError('Failed to fetch services. Please try again later.')
    }
    setLoading(false)
  }

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      alert('You must be logged in to create a service')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{ ...newService, user_id: user.id }])
      if (error) throw error
      setNewService({ title: '', description: '' })
      fetchUserAndServices()
    } catch (err) {
      console.error('Error creating service:', err)
      setError('Failed to create service. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Services</h1>
      
      {user && (
        <form onSubmit={handleCreateService} className="mb-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Offer a New Service</h2>
          <input
            type="text"
            placeholder="Service Title"
            value={newService.title}
            onChange={(e) => setNewService({ ...newService, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <textarea
            placeholder="Service Description"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" disabled={loading}>
            {loading ? 'Creating...' : 'Offer Service'}
          </button>
        </form>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading services...</p>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-2">{service.title}</h2>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Link href={`/services/${service.id}/book`} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-block">
                Book Now
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No services available at the moment.</p>
      )}
    </div>
  )
}