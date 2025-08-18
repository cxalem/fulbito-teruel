'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function checkAdminTable() {
  try {
    const supabase = createServiceClient()
    
    // Get all admins using service role
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
    
    if (error) {
      console.error('Error fetching admins:', error)
      return { success: false, error: error.message }
    }
    
    console.log('All admins in database:', admins)
    
    // Also check current user
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    
    const debugInfo = {
      admins,
      currentUser: user ? { id: user.id, email: user.email } : null,
      userIdMatch: user ? admins?.some(admin => admin.user_id === user.id) : false,
      adminEmails: process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()).filter(email => email.length > 0) || []
    }
    
    console.log('=== USER ID MATCH DEBUG ===')
    console.log('Current User ID:', user?.id)
    console.log('Current User Email:', user?.email)
    console.log('Admin Emails Config:', debugInfo.adminEmails)
    console.log('User ID matches any admin record?', debugInfo.userIdMatch)
    if (admins) {
      admins.forEach((admin, index) => {
        console.log(`Admin ${index + 1}: user_id=${admin.user_id}, matches=${admin.user_id === user?.id}`)
      })
    }
    console.log('========================')
    
    return {
      success: true,
      data: debugInfo
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error' }
  }
}
