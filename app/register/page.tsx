'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SPORTS = [
  { id: 'darts', name: 'Darts', emoji: '🎯', available: true },
  { id: 'padel', name: 'Padel', emoji: '🎾', available: false },
  { id: 'pool', name: 'Bilard', emoji: '🎱', available: false },
  { id: 'tabletennis', name: 'Tenis stołowy', emoji: '🏓', available: false },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ imie: '', nazwisko: '', nick: '', email: '', password: '', ulubiony_sport: 'darts' })

  function update(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  async function handleRegister() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { imie: form.imie, nazwisko: form.nazwisko, nick: form.nick || null, ulubiony_sport: form.ulubiony_sport } }
    })
    if (error) { setError(error.message); setLoading(false); return }
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
        {step === 1 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">Utwórz konto</h1>
            <p className="text-zinc-500 text-sm mb-8">Imię i nazwisko są wymagane</p>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Imię *</label>
                  <input type="text" value={form.imie} onChange={e => update('imie', e.target.value)} placeholder="Jan" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nazwisko *</label>
                  <input type="text" value={form.nazwisko} onChange={e => update('nazwisko', e.target.value)} placeholder="Kowalski" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Ksywka <span className="text-zinc-600 normal-case font-normal">opcjonalnie</span></label>
                <input type="text" value={form.nick} onChange={e => update('nick', e.target.value)} placeholder="np. Kowal..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Email *</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="jan.kowalski@email.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Hasło *</label>
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Minimum 8 znaków" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
              </div>
              <button onClick={() => { if (!form.imie || !form.nazwisko || !form.email || !form.password) { setError('Uzupełnij wszystkie wymagane pola.'); return } setError(''); setStep(2) }} className="w-full bg-green-500 hover:bg-green-400 text-white font-black text-sm tracking-[2px] uppercase py-3.5 rounded-xl transition">Dalej →</button>
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
            </div>
            <p className="text-center text-zinc-600 text-sm mt-6">Masz konto? <Link href="/login" className="text-green-400 font-semibold">Zaloguj się</Link></p>
          </div>
        )}
        {step === 2 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <button onClick={() => setStep(1)} className="text-zinc-600 hover:text-zinc-400 text-sm mb-6">← Wróć</button>
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">Twój sport</h1>
            <p className="text-zinc-500 text-sm mb-8">Wybierz sport który grasz najczęściej</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {SPORTS.map(sport => (
                <button key={sport.id} onClick={() => sport.available && update('ulubiony_sport', sport.id)} disabled={!sport.available} className={`relative p-5 rounded-xl border-2 text-center transition ${!sport.available ? 'opacity-40 cursor-not-allowed border-zinc-800' : form.ulubiony_sport === sport.id ? 'border-green-500 bg-green-500/10' : 'border-zinc-700 hover:border-zinc-500'}`}>
                  <div className="text-3xl mb-2">{sport.emoji}</div>
                  <div className="text-white font-bold text-sm">{sport.name}</div>
                  {!sport.available && <div className="text-zinc-600 text-xs mt-1">Wkrótce</div>}
                  {sport.available && <div className="text-green-400 text-xs mt-1">● Dostępny</div>}
                  {form.ulubiony_sport === sport.id && sport.available && <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
                </button>
              ))}
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}
            <button onClick={handleRegister} disabled={loading} className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-black text-sm tracking-[2px] uppercase py-3.5 rounded-xl transition">{loading ? 'Tworzenie konta...' : 'Utwórz konto'}</button>
          </div>
        )}
      </div>
    </div>
  )
}
