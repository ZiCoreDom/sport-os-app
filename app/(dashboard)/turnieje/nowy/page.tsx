'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FORMATS = [
  { id: 'groups_knockout', label: 'Grupy + Playoff', desc: 'Faza grupowa, potem drabinka' },
  { id: 'knockout', label: 'Knockout', desc: 'Eliminacje od razu' },
  { id: 'league', label: 'Liga', desc: 'Każdy z każdym' },
  { id: 'swiss', label: 'System Szwajcarski', desc: 'Dobieranie po wynikach' },
  { id: 'king_of_hill', label: 'King of the Hill', desc: 'Obrońca tronu' },
]

export default function NowyTurniejPage() {
  const router = useRouter()
  const [clubId, setClubId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nazwa: '', opis: '', format: 'groups_knockout', data_turnieju: '', godzina_start: '18:00', wpisowe: '0', maks_zawodnikow: '32' })

  useEffect(() => {
    async function getClub() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('club_admins').select('club_id').eq('user_id', user.id).limit(1).single()
      if (data) setClubId(data.club_id)
    }
    getClub()
  }, [])

  function update(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  async function handleCreate() {
    if (!clubId) { setError('Nie masz przypisanego klubu.'); return }
    if (!form.nazwa) { setError('Podaj nazwę turnieju.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error: err } = await supabase.from('tournaments').insert({
      club_id: clubId, nazwa: form.nazwa, opis: form.opis || null,
      format: form.format, data_turnieju: form.data_turnieju || null,
      godzina_start: form.godzina_start || null, wpisowe: parseFloat(form.wpisowe) || 0,
      maks_zawodnikow: parseInt(form.maks_zawodnikow) || 32,
      sport: 'darts', status: 'draft', created_by: user.id,
    }).select().single()
    if (err) { setError('Błąd podczas tworzenia turnieju.'); setLoading(false); return }
    router.push(`/turnieje/${data.id}`)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Nowy turniej</h1>
        <p className="text-zinc-500 text-sm mt-1">Skonfiguruj turniej przed startem</p>
      </div>
      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Podstawowe informacje</h2>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nazwa turnieju *</label>
            <input type="text" value={form.nazwa} onChange={e => update('nazwa', e.target.value)} placeholder="np. Turniej Weekendowy #12" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Opis <span className="text-zinc-600 normal-case font-normal">opcjonalnie</span></label>
            <textarea value={form.opis} onChange={e => update('opis', e.target.value)} placeholder="Dodatkowe informacje..." rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Data</label>
              <input type="date" value={form.data_turnieju} onChange={e => update('data_turnieju', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Godzina</label>
              <input type="time" value={form.godzina_start} onChange={e => update('godzina_start', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Wpisowe (zł)</label>
              <input type="number" value={form.wpisowe} onChange={e => update('wpisowe', e.target.value)} min="0" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Maks. zawodników</label>
              <input type="number" value={form.maks_zawodnikow} onChange={e => update('maks_zawodnikow', e.target.value)} min="4" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition" />
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Format rozgrywek</h2>
          <div className="space-y-2">
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => update('format', f.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition text-left ${form.format === f.id ? 'border-green-500 bg-green-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
                <div>
                  <div className="text-white font-semibold text-sm">{f.label}</div>
                  <div className="text-zinc-500 text-xs">{f.desc}</div>
                </div>
                {form.format === f.id && <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-6 py-3.5 border border-zinc-700 hover:border-zinc-500 rounded-xl text-zinc-400 hover:text-white text-sm font-semibold transition">Anuluj</button>
          <button onClick={handleCreate} disabled={loading} className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-black text-sm tracking-[2px] uppercase py-3.5 rounded-xl transition">{loading ? 'Tworzenie...' : 'Utwórz turniej →'}</button>
        </div>
      </div>
    </div>
  )
}
