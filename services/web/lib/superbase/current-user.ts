import type { SupabaseClient } from '@supabase/supabase-js'

export type CurrentDbUser = {
  id: number
  personid: number
  username: string
  email: string
  role: string
  avatarimage: string | null
}

export class CurrentUserError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'CurrentUserError'
    this.status = status
  }
}

export async function getCurrentDbUser(supabase: SupabaseClient): Promise<CurrentDbUser> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    throw new CurrentUserError('Unauthorized', 401)
  }

  const { data: dbUser, error: dbUserError } = await supabase
    .from('user')
    .select('id, personid, username, email, role, avatarimage')
    .eq('email', user.email)
    .single()

  if (dbUserError || !dbUser) {
    throw new CurrentUserError('User not found in database', 404)
  }

  return dbUser
}