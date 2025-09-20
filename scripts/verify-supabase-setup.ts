import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Verifying Supabase Configuration...\n')

// Check environment variables
console.log('Environment Variables:')
console.log('✅ SUPABASE_URL:', supabaseUrl ? 'SET' : '❌ MISSING')
console.log('✅ SERVICE_ROLE_KEY:', serviceRoleKey ? 'SET' : '❌ MISSING')
console.log('✅ ANON_KEY:', anonKey ? 'SET' : '❌ MISSING')
console.log('')

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required Supabase environment variables')
  process.exit(1)
}

// Create admin client
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verifySupabaseConnection() {
  try {
    console.log('🔗 Testing Supabase connection...')
    
    // Test admin client connection
    const { data, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    })
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    console.log(`📊 Found ${data.users.length} users in database`)
    return true
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}

async function ensureTestUser() {
  const TEST_USER_EMAIL = 'client@rpd-invoice.com'
  const TEST_USER_PASSWORD = 'RpdSecure123!'
  
  try {
    console.log(`\n👤 Checking for test user: ${TEST_USER_EMAIL}`)
    
    // Check if user exists
    const { data } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 100, // Get more users to search through
    })
    
    const existingUser = data.users.find(user => user.email === TEST_USER_EMAIL)
    
    if (existingUser) {
      console.log('✅ Test user already exists')
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Email confirmed: ${existingUser.email_confirmed_at ? '✅' : '❌'}`)
      return true
    }
    
    console.log('🔄 Creating test user...')
    const { data: newUser, error } = await adminClient.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true, // Auto-confirm email
    })
    
    if (error) {
      console.error('❌ Failed to create test user:', error.message)
      return false
    }
    
    console.log('✅ Test user created successfully')
    console.log(`   ID: ${newUser.user?.id}`)
    console.log(`   Email: ${newUser.user?.email}`)
    return true
    
  } catch (error) {
    console.error('❌ Error managing test user:', error)
    return false
  }
}

async function main() {
  const connectionOk = await verifySupabaseConnection()
  if (!connectionOk) {
    process.exit(1)
  }
  
  const userOk = await ensureTestUser()
  if (!userOk) {
    process.exit(1)
  }
  
  console.log('\n🎉 Supabase setup verification complete!')
  console.log('\nYou can now use these credentials to log in:')
  console.log('📧 Email: client@rpd-invoice.com')
  console.log('🔑 Password: RpdSecure123!')
  console.log('\n🌐 Login URL: http://localhost:3000/auth/login')
}

main().catch(console.error)