'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DashboardHome() {
  const [imie, setImie] = useState('')
  const [nazwisko, setNazwisko] = useState('')
  const [nick, setNick] = useState('')
  const [tournaments, setTournaments] = useState<any[]>([])
  const [clubId, setClubId] = useState<string | null>(null)
  const [clubNazwa, setClubNazwa] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const meta = user.user_metadata
      setImie(meta?.imie || '')
      setNazwisko(meta?.nazwisko || '')
      setNick(meta?.nick || '')
      const { data: prof } = await supabase.from('profiles').select('imie,nazwisko,nick').eq('id', user.id).single()
      if (prof?.imie) setImie(prof.imie)
      if (prof?.nazwisko) setNazwisko(prof.nazwisko)
      if (prof?.nick) setNick(prof.nick)
      const { data: clubs } = await supabase.from('clubs').select('id,nazwa').eq('owner_id', user.id).limit(1)
      if (clubs && clubs.length > 0) {
        setClubId(clubs[0].id)
        setClubNazwa(clubs[0].nazwa)
        const { data: t } = await supabase.from('tournaments').select('*').eq('club_id', clubs[0].id).order('data_turnieju', { ascending: true }).limit(5)
        setTournaments(t || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{color:'#1DB954',fontSize:14}}>Ładowanie...</div>
    </div>
  )

  return (
    <div style={{maxWidth:900}}>
      <div style={{marginBottom:40}}>
        <div style={{color:'#666',fontSize:13,marginBottom:4}}>Witaj ponownie,</div>
        <div style={{color:'white',fontSize:32,fontWeight:900,letterSpacing:-1}}>
          {imie} {nazwisko}
          {nick && <span style={{color:'#555',fontWeight:400,fontSize:20,marginLeft:8}}>({nick})</span>}
        </div>
        {clubNazwa && <div style={{color:'#1DB954',fontSize:13,marginTop:6}}>● {clubNazwa}</div>}
      </div>

      {!clubId && (
        <div style={{background:'#111',border:'2px dashed #222',borderRadius:20,padding:48,textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:16}}>🏟️</div>
          <div style={{color:'white',fontWeight:700,fontSize:20,marginBottom:8}}>Nie masz jeszcze klubu</div>
          <div style={{color:'#555',fontSize:14,marginBottom:24}}>Utwórz klub żeby zacząć organizować turnieje.</div>
          <Link href="/klub/nowy" style={{background:'#1DB954',color:'white',fontWeight:900,fontSize:13,letterSpacing:2,textTransform:'uppercase',padding:'12px 28px',borderRadius:12,textDecoration:'none',display:'inline-block'}}>+ Utwórz klub</Link>
        </div>
      )}

      {clubId && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:40}}>
          <Link href="/turnieje/nowy" style={{textDecoration:'none'}}>
            <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:16,padding:24,cursor:'pointer'}}>
              <div style={{fontSize:32,marginBottom:12}}>🏆</div>
              <div style={{color:'white',fontWeight:700,fontSize:15,marginBottom:4}}>Nowy turniej</div>
              <div style={{color:'#444',fontSize:12}}>Utwórz i skonfiguruj</div>
            </div>
          </Link>
          <Link href="/turnieje" style={{textDecoration:'none'}}>
            <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:16,padding:24,cursor:'pointer'}}>
              <div style={{fontSize:32,marginBottom:12}}>📋</div>
              <div style={{color:'white',fontWeight:700,fontSize:15,marginBottom:4}}>Turnieje</div>
              <div style={{color:'#444',fontSize:12}}>{tournaments.length} w systemie</div>
            </div>
          </Link>
          <Link href="/zawodnicy" style={{textDecoration:'none'}}>
            <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:16,padding:24,cursor:'pointer'}}>
              <div style={{fontSize:32,marginBottom:12}}>👥</div>
              <div style={{color:'white',fontWeight:700,fontSize:15,marginBottom:4}}>Zawodnicy</div>
              <div style={{color:'#444',fontSize:12}}>Zarządzaj listą</div>
            </div>
          </Link>
        </div>
      )}

      {tournaments.length > 0 && (
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{color:'white',fontWeight:700,fontSize:16}}>Nadchodzące turnieje</div>
            <Link href="/turnieje" style={{color:'#444',fontSize:13,textDecoration:'none'}}>Zobacz wszystkie →</Link>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {tournaments.map(t => {
              const sm: Record<string,{label:string,color:string}> = {
                draft:{label:'Szkic',color:'#444'},
                open:{label:'Zapisy otwarte',color:'#3B82F6'},
                confirmed:{label:'Gotowy',color:'#F59E0B'},
                running:{label:'Na żywo',color:'#1DB954'},
                closed:{label:'Zakończony',color:'#333'},
                cancelled:{label:'Odwołany',color:'#EF4444'},
              }
              const s = sm[t.status] || sm.draft
              return (
                <Link key={t.id} href={`/turnieje/${t.id}`} style={{textDecoration:'none'}}>
                  <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',gap:16}}>
                    <div style={{background:'#1a1a1a',borderRadius:10,padding:'8px 12px',textAlign:'center',minWidth:52}}>
                      <div style={{color:'white',fontWeight:900,fontSize:20,lineHeight:1}}>{t.data_turnieju ? new Date(t.data_turnieju).getDate() : '—'}</div>
                      <div style={{color:'#444',fontSize:10,textTransform:'uppercase'}}>{t.data_turnieju ? new Date(t.data_turnieju).toLocaleString('pl',{month:'short'}) : ''}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{color:'white',fontWeight:600,fontSize:14}}>{t.nazwa}</div>
                      <div style={{color:'#444',fontSize:12,marginTop:2}}>{t.wpisowe > 0 ? `${t.wpisowe} zł` : 'Bez wpisowego'} · {t.format}</div>
                    </div>
                    <div style={{color:s.color,fontSize:11,fontWeight:700,background:'rgba(255,255,255,0.04)',padding:'4px 10px',borderRadius:8}}>{s.label}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}