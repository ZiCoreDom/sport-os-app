import type { Metadata } from `"next`"
import `"./globals.css`"

export const metadata: Metadata = {
  title: `"Sport OS`",
  description: `"Ekosystem dla klubow sportowych`",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang=`"pl`">
      <body style={{margin:0,padding:0,background:`"#080808`",minHeight:`"100vh`",color:`"white`",fontFamily:`"-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif`"}}>
        {children}
      </body>
    </html>
  )
}
