import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for admin operations')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function createTables() {
  const { error: gigsError } = await supabaseAdmin
    .from('gigs')
    .select()
    .limit(1)

  if (gigsError) {
    console.log('Creating gigs table...')
    const { error } = await supabaseAdmin.rpc('create_gigs_table')
    if (error) console.error('Error creating gigs table:', error)
  }

  const { error: servicesError } = await supabaseAdmin
    .from('services')
    .select()
    .limit(1)

  if (servicesError) {
    console.log('Creating services table...')
    const { error } = await supabaseAdmin.rpc('create_services_table')
    if (error) console.error('Error creating services table:', error)
  }
}

// Admin functions for managing users, if needed
export async function getAllUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  return data.users
}

export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Call this function to create tables when setting up the project
// createTables()