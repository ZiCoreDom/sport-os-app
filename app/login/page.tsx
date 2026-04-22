'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Nieprawidłowy email lub hasło.'); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
            <span className="text-green-400 font-black text-sm tracking-wider">SO</span>
          </div>
          <span className="text-white font-black text-xl tracking-[3px] uppercase">Sport OS</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Zaloguj się</h1>
          <p className="text-zinc-500 text-sm mb-8">Witaj z powrotem w systemie</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Adres email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan.kowalski@email.com" required className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Hasło</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-black text-sm tracking-[2px] uppercase py-3.5 rounded-xl transition">
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>
          <p className="text-center text-zinc-600 text-sm mt-6">Nie masz konta? <Link href="/register" className="text-green-400 font-semibold">Zarejestruj się</Link></p>
        </div>
      </div>
    </div>
  )
}
