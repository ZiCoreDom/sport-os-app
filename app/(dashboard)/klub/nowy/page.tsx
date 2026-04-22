'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NowyKlubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nazwa: '', opis: '', miasto: '', typ: 'community' })

  function update(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  async function handleCreate() {
    if (!form.nazwa) { setError('Podaj nazwę klubu.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Nie jesteś zalogowany.'); setLoading(false); return }
    
    const { data: club, error: clubErr } = await supabase
      .from('clubs')
      .insert({ nazwa: form.nazwa, opis: form.opis || null, miasto: form.miasto || null, typ: form.typ, sport: 'darts', owner_id: user.id })
      .select()
      .single()
    
    if (clubErr) { setError('Błąd klubu: ' + clubErr.message); setLoading(false); return }
    
    const { error: adminErr } = await supabase
      .from('club_admins')
      .insert({ club_id: club.id, user_id: user.id, rola: 'owner' })
    
    if (adminErr) { setError('Błąd admina: ' + adminErr.message); setLoading(false); return }
    
    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Utwórz klub</h1>
        <p className="text-zinc-500 text-sm mt-1">Skonfiguruj swój klub sportowy</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nazwa klubu *</label>
          <input type="text" value={form.nazwa} onChange={e => update('nazwa', e.target.value)} placeholder="np. Klub Darts Warszawa" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Miasto</label>
          <input type="text" value={form.miasto} onChange={e => update('miasto', e.target.value)} placeholder="np. Warszawa" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Opis <span className="text-zinc-600 normal-case font-normal">opcjonalnie</span></label>
          <textarea value={form.opis} onChange={e => update('opis', e.target.value)} placeholder="Kilka słów o klubie..." rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition resize-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Typ klubu</label>
          <div className="space-y-2">
            {[
              { id: 'official', label: 'Oficjalne stowarzyszenie', desc: 'Zarejestrowane stowarzyszenie sportowe' },
              { id: 'community', label: 'Klub społecznościowy', desc: 'Nieformalna grupa graczy' },
              { id: 'trial', label: 'Klub testowy', desc: 'Tryb próbny — rankingi nieoficjalne' }
            ].map(t => (
              <button key={t.id} onClick={() => update('typ', t.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition text-left ${form.typ === t.id ? 'border-green-500 bg-green-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
                <div>
                  <div className="text-white font-semibold text-sm">{t.label}</div>
                  <div className="text-zinc-500 text-xs">{t.desc}</div>
                </div>
                {form.typ === t.id && <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-6 py-3.5 border border-zinc-700 hover:border-zinc-500 rounded-xl text-zinc-400 hover:text-white text-sm font-semibold transition">Anuluj</button>
          <button onClick={handleCreate} disabled={loading} className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-black text-sm tracking-[2px] uppercase py-3.5 rounded-xl transition">{loading ? 'Tworzenie...' : 'Utwórz klub →'}</button>
        </div>
      </div>
    </div>
  )
}
