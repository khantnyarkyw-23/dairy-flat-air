import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DairyFlat Air — Private Aviation from Dairy Flat',
  description: 'Luxury light jet services from Dairy Flat Airport to Sydney, Rotorua, Great Barrier Island, Chatham Islands and Lake Tekapo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav className="nav">
          <a href="/" className="nav-logo">
            Dairy<span>Flat</span> Air
        </a>

        <ul className="nav-links">
          <li><a href="/my-bookings">Manage Booking</a></li>
          <li><a href="/flight-status">Flight Status</a></li>
        </ul>
      </nav>

      {children}

      <footer className="footer">
        <div className="footer-logo">
          Dairy<span>Flat</span> Air · NZNE
        </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/my-bookings">Manage Booking</a>
          <a href="/flight-status">Flight Status</a>
          </div>
      </footer>
      </body>
    </html>
  )
}