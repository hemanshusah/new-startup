import { createClient } from "@supabase/supabase-js"
import type { Adapter } from "next-auth/adapters"

function isDate(val: any): boolean {
  if (val instanceof Date) return true
  if (typeof val === "string") {
    const d = new Date(val)
    return !isNaN(d.getTime()) && (val.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(val))
  }
  return false
}

export function format<T>(obj: T): T {
  if (!obj) return obj
  const newObj = { ...obj } as any
  for (const [key, value] of Object.entries(newObj)) {
    if (value === null) {
      delete newObj[key]
    }
    if (isDate(value)) {
      newObj[key] = new Date(value as any)
    }
  }
  return newObj
}

export function SupabaseAdapter(options: { url: string; secret: string }): Adapter {
  const { url, secret } = options
  const supabase = createClient(url, secret, {
    db: { schema: "next_auth" },
    global: { headers: { "X-Client-Info": "@auth/supabase-adapter" } },
    auth: { persistSession: false },
  })

  return {
    async createUser(user) {
      const { data, error } = await supabase
        .from("users")
        .insert({
          ...user,
          emailVerified: user.emailVerified?.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return format(data) as any
    },
    async getUser(id) {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("id", id)
        .maybeSingle()

      if (error) throw error
      if (!data) return null
      return format(data) as any
    },
    async getUserByEmail(email) {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email)
        .maybeSingle()

      if (error) throw error
      if (!data) return null
      return format(data) as any
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const { data, error } = await supabase
        .from("accounts")
        .select("users (*)")
        .match({ provider, providerAccountId })
        .maybeSingle()

      if (error) throw error
      if (!data || !data.users) return null
      return format(data.users) as any
    },
    async updateUser(user) {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...user,
          emailVerified: user.emailVerified?.toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error
      return format(data) as any
    },
    async deleteUser(userId) {
      const { error } = await supabase.from("users").delete().eq("id", userId)
      if (error) throw error
    },
    async linkAccount(account) {
      const { error } = await supabase.from("accounts").insert(account)
      if (error) throw error
      return format(account) as any
    },
    async unlinkAccount({ providerAccountId, provider }) {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .match({ provider, providerAccountId })
      if (error) throw error
    },
    async createSession({ sessionToken, userId, expires }) {
      const { data, error } = await supabase
        .from("sessions")
        .insert({ sessionToken, userId, expires: expires.toISOString() })
        .select()
        .single()

      if (error) throw error
      return format(data) as any
    },
    async getSessionAndUser(sessionToken) {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, users(*)")
        .eq("sessionToken", sessionToken)
        .maybeSingle()

      if (error) throw error
      if (!data) return null
      const { users: user, ...session } = data as any
      return {
        user: format(user),
        session: format(session),
      } as any
    },
    async updateSession(session) {
      const { data, error } = await supabase
        .from("sessions")
        .update({
          ...session,
          expires: session.expires?.toISOString(),
        })
        .eq("sessionToken", session.sessionToken)
        .select()
        .single()

      if (error) throw error
      return format(data) as any
    },
    async deleteSession(sessionToken) {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("sessionToken", sessionToken)
      if (error) throw error
    },
    async createVerificationToken(token) {
      const { data, error } = await supabase
        .from("verification_tokens")
        .insert({
          ...token,
          expires: token.expires.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      const { id, ...verificationToken } = data as any
      return format(verificationToken) as any
    },
    async useVerificationToken({ identifier, token }) {
      const { data, error } = await supabase
        .from("verification_tokens")
        .delete()
        .match({ identifier, token })
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) return null
      const { id, ...verificationToken } = data as any
      return format(verificationToken) as any
    },
  }
}
