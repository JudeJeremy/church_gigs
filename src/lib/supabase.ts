import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
  }
}

export async function fetchGigs(limit = 10) {
  const { data, error } = await supabase
    .from('gigs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching gigs:', error)
    return []
  }

  return data
}

export async function fetchServices(limit = 10) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data
}

export async function createGig(gig: { title: string; description: string; user_id: string }) {
  const { data, error } = await supabase
    .from('gigs')
    .insert([gig])

  if (error) {
    console.error('Error creating gig:', error)
    throw error
  }

  return data
}

export async function createService(service: { title: string; description: string; user_id: string }) {
  const { data, error } = await supabase
    .from('services')
    .insert([service])

  if (error) {
    console.error('Error creating service:', error)
    throw error
  }

  return data
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

export function subscribeToNotifications(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

export async function fetchMessages(bookingId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data
}

export async function sendMessage(message: { booking_id: string; sender_id: string; receiver_id: string; content: string }) {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])

  if (error) {
    console.error('Error sending message:', error)
    throw error
  }

  return data
}

export function subscribeToMessages(bookingId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`public:messages:booking_id=eq.${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`,
      },
      callback
    )
    .subscribe()
}