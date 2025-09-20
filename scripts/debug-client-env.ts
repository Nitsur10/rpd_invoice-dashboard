import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

console.log('🔍 Environment Variables Debug Report\n')

// Check all Supabase-related environment variables
const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
}

console.log('Server Environment Variables:')
for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    if (key.includes('KEY')) {
      console.log(`✅ ${key}: [${value.length} chars] ${value.substring(0, 20)}...`)
    } else {
      console.log(`✅ ${key}: ${value}`)
    }
  } else {
    console.log(`❌ ${key}: NOT SET`)
  }
}

console.log('\n🌐 What the browser should see:')
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}`)
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : 'NOT SET'}`)

// Test if we can create a client
console.log('\n🧪 Testing client creation...')
try {
  const { createBrowserClient } = require('@supabase/ssr')
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  console.log('✅ Browser client created successfully')
  
  // Test a simple operation
  console.log('🔗 Testing client connection...')
  client.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.log('⚠️  Auth session error (expected for unauthenticated):', error.message)
    } else {
      console.log('✅ Auth session check successful')
    }
  }).catch(err => {
    console.error('❌ Auth session failed:', err.message)
  })
  
} catch (error) {
  console.error('❌ Failed to create client:', error.message)
}