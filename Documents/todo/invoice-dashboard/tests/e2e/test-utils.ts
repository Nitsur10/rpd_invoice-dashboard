import { createClient } from '@supabase/supabase-js'
import type { Page } from '@playwright/test'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase environment variables are not configured for tests')
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export const TEST_USER_EMAIL = process.env.E2E_USER_EMAIL || 'client@rpd-invoice.com'
export const TEST_USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'RpdSecure123!'

export async function ensureTestUser() {
  const { data } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1,
    email: TEST_USER_EMAIL,
  })

  const existing = data.users?.[0]

  if (!existing) {
    await adminClient.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
    })
  }
}

export async function loginViaUI(page: Page, redirectTo = '/') {
  await page.goto(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Sign in to Dashboard', { timeout: 5000 })
  await page.getByLabel('Email address').fill(TEST_USER_EMAIL)
  await page.getByLabel('Password').fill(TEST_USER_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**' + redirectTo, { timeout: 10_000 })
}
