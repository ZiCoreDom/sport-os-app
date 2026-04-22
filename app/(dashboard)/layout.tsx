'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/',          icon: '🏠', label: 'Panel główny' },
  { href: '/turnieje',  icon: '🏆', label: 'Turnieje' },
  { href: '/zawodnicy', icon: '👥', label: 'Zawodnicy' },
  { href: '/liga',      icon: '📅', label: 'Liga' },
  { href: '/statystyki',icon: '📊', label: 'Statystyki' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('')
  const [clubName, setClubName] = useState('')

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const meta = user.user_metadata
      setUserName(`${meta?.imie || ''} ${meta?.nazwisko || ''}`.trim() || meta?.nick || '')
      const { data: prof } = await supabase.from('profiles').select('imie,nazwisko').eq('id', user.id).single()
      if (prof?.imie) setUserName(`${prof.imie} ${prof.nazwisko}`)
      const { data: clubs } = await supabase.from('clubs').select('nazwa').eq('owner_id', user.id).limit(1)
      if (clubs && clubs.length > 0) setClubName(clubs[0].nazwa)
    }
    check()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{display:'flex',height:'100vh',background:'#080808',color:'white',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',overflow:'hidden'}}>

      {/* SIDEBAR */}
      <aside style={{width:260,background:'#0D0D0D',borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column',flexShrink:0}}>

        {/* Logo */}
        <div style={{padding:'28px 24px 24px',borderBottom:'1px solid #1a1a1a'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,background:'#1DB954',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:13,color:'white',letterSpacing:1}}>SO</div>
            <div>
              <div style={{color:'white',fontWeight:900,fontSize:16,letterSpacing:2,textTransform:'uppercase'}}>Sport OS</div>
              <div style={{color:'#333',fontSize:10,letterSpacing:2,textTransform:'uppercase',marginTop:1}}>Ekosystem klubowy</div>
            </div>
          </div>
          {clubName && (
            <div style={{marginTop:12,background:'#151515',borderRadius:8,padding:'6px 10px',fontSize:12,color:'#1DB954',fontWeight:600}}>
              ● {clubName}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:'16px 12px',overflowY:'auto'}}>
          <div style={{color:'#333',fontSize:10,fontWeight:700,letterSpacing:2,textTransform:'uppercase',padding:'0 12px',marginBottom:8}}>Menu</div>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{textDecoration:'none'}}>
                <div style={{
                  display:'flex',alignItems:'center',gap:10,
                  padding:'10px 12px',borderRadius:10,marginBottom:2,
                  background: active ? 'rgba(29,185,84,0.1)' : 'transparent',
                  borderLeft: active ? '3px solid #1DB954' : '3px solid transparent',
                  color: active ? 'white' : '#555',
                  fontSize:14,fontWeight:500,cursor:'pointer',
                  transition:'all 0.15s'
                }}>
                  <span style={{fontSize:16,width:20,textAlign:'center'}}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{padding:'16px 12px',borderTop:'1px solid #1a1a1a'}}>
          <div style={{padding:'8px 12px',marginBottom:4}}>
            <div style={{color:'#888',fontSize:12,fontWeight:600,marginBottom:2}}>{userName}</div>
            <div style={{color:'#333',fontSize:11}}>Administrator</div>
          </div>
          <button onClick={handleLogout} style={{width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:8,border:'none',background:'transparent',color:'#444',fontSize:13,cursor:'pointer'}}>
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,overflowY:'auto',padding:'40px 48px'}}>
        {children}
      </main>
    </div>
  )
}
