'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const ROUTES = [
  {
    orig: 'NZNE',
    dest: 'YSSY',
    origName: 'Dairy Flat',
    destName: 'Sydney',
    image: '/images/sydney.jpg',
    freq: 'Every Friday',
    price: 'from $1,200',
    aircraft: 'SyberJet SJ30i',
    tag: 'Prestige',
  },
  {
    orig: 'NZNE',
    dest: 'NZRO',
    origName: 'Dairy Flat',
    destName: 'Rotorua',
    image: '/images/rotorua.jpg',
    freq: 'Mon–Fri, twice daily',
    price: 'from $280',
    aircraft: 'Cirrus SF50',
    tag: 'Shuttle',
  },
  {
    orig: 'NZNE',
    dest: 'NZGB',
    origName: 'Dairy Flat',
    destName: 'Great Barrier Island',
    image: '/images/barrier.jpg',
    freq: 'Mon / Wed / Fri',
    price: 'from $320',
    aircraft: 'Cirrus SF50',
    tag: 'Island',
  },
  {
    orig: 'NZNE',
    dest: 'NZCI',
    origName: 'Dairy Flat',
    destName: 'Chatham Islands',
    image: '/images/chatham.jpg',
    freq: 'Tue & Fri',
    price: 'from $890',
    aircraft: 'HondaJet Elite',
    tag: 'Remote',
  },
  {
    orig: 'NZNE',
    dest: 'NZTL',
    origName: 'Dairy Flat',
    destName: 'Lake Tekapo',
    image: '/images/tekapo.jpg',
    freq: 'Every Monday',
    price: 'from $540',
    aircraft: 'HondaJet Elite',
    tag: 'Scenic',
  },
]

const AIRPORTS = [
  { code: 'NZNE', name: 'Dairy Flat' },
  { code: 'YSSY', name: 'Sydney' },
  { code: 'NZRO', name: 'Rotorua' },
  { code: 'NZGB', name: 'Great Barrier Island' },
  { code: 'NZCI', name: 'Chatham Islands' },
  { code: 'NZTL', name: 'Lake Tekapo' },
]

const WEATHER_LOCATIONS = [
  { name: 'Dairy Flat', lat: -36.63, lon: 174.65, code: 'NZNE' },
  { name: 'Sydney', lat: -33.87, lon: 151.21, code: 'YSSY' },
  { name: 'Rotorua', lat: -38.14, lon: 176.25, code: 'NZRO' },
  { name: 'Chatham Islands', lat: -43.95, lon: -176.56, code: 'NZCI' },
  { name: 'Lake Tekapo', lat: -44.00, lon: 170.48, code: 'NZTL' },
]

function weatherIcon(code: number) {
  if (code === 0) return '☀️'
  if (code <= 2) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

function weatherDesc(code: number) {
  if (code === 0) return 'Clear'
  if (code <= 2) return 'Partly cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 67) return 'Rainy'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

export default function Home() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const [orig, setOrig] = useState('NZNE')
  const [dest, setDest] = useState('YSSY')
  const [date1, setDate1] = useState(today)
  const [date2, setDate2] = useState(nextMonth)
  const [weather, setWeather] = useState<any[]>([])
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const results = await Promise.all(
          WEATHER_LOCATIONS.map(async (loc) => {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
            )
            const data = await res.json()

            return {
              ...loc,
              temp: Math.round(data.current.temperature_2m),
              wcode: data.current.weather_code,
              wind: Math.round(data.current.wind_speed_10m),
            }
          })
        )

        setWeather(results)
      } catch {
        setWeather([])
      } finally {
        setWeatherLoading(false)
      }
    }

    fetchWeather()
  }, [])

  function search() {
    if (orig === dest) {
      alert('Origin and destination must be different')
      return
    }

    router.push(`/search?orig=${orig}&dest=${dest}&date1=${date1}&date2=${date2}`)
  }

  function quickSearch(o: string, d: string) {
    router.push(`/search?orig=${o}&dest=${d}&date1=${today}&date2=${nextMonth}`)
  }

  return (
    <>
      {/* HERO */}
      <div className="hero">
        <div className="hero-media">
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          >
            <source src="/hero-flight.mp4" type="video/mp4" />
          </video>

          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="hero-eyebrow">Private aviation, reimagined</div>

            <h1 className="hero-title">
              New Zealand&apos;s
              <br />
              most <em>intimate</em>
              <br />
              airline
            </h1>

            <p className="hero-sub">
              Six destinations. Light jets. No queues.
              <br />
              Departing from Dairy Flat Airport, north of Auckland.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH BOX */}
      <div className="search-box">
        <div className="search-grid">
          <div className="field">
            <label>From</label>
            <select value={orig} onChange={(e) => setOrig(e.target.value)}>
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>To</label>
            <select value={dest} onChange={(e) => setDest(e.target.value)}>
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Depart after</label>
            <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
          </div>

          <div className="field">
            <label>Depart before</label>
            <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
          </div>

          <button className="btn-gold" onClick={search}>
            Search Flights
          </button>
        </div>
      </div>

      {/* WEATHER */}
      <div
        style={{
          background: '#0a1628',
          borderBottom: '1px solid rgba(181,132,26,0.2)',
          padding: '0 2.5rem',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#B5841A',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              paddingRight: '1.5rem',
              borderRight: '1px solid rgba(181,132,26,0.2)',
              marginRight: '1rem',
            }}
          >
            Live weather
          </div>

          {weatherLoading ? (
            <div style={{ fontSize: 13, color: 'rgba(245,237,216,0.4)', padding: '1rem 0' }}>
              Loading...
            </div>
          ) : (
            weather.map((w, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0.9rem 1.2rem',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
                onClick={() => quickSearch('NZNE', w.code === 'NZNE' ? 'YSSY' : w.code)}
              >
                <span style={{ fontSize: 16 }}>{weatherIcon(w.wcode)}</span>
                <span style={{ fontSize: 13, color: 'rgba(245,237,216,0.6)' }}>{w.name}</span>
                <span
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#F5EDD8',
                  }}
                >
                  {w.temp}°C
                </span>
                <span style={{ fontSize: 11, color: 'rgba(245,237,216,0.35)' }}>
                  {weatherDesc(w.wcode)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ROUTES */}
      <div className="section">
        <div className="section-label">Our routes</div>

        <div className="route-grid">
          {ROUTES.map((r) => (
            <div key={r.dest} className="route-card" onClick={() => quickSearch(r.orig, r.dest)}>
              <img src={r.image} alt={r.destName} className="route-image" />

              <div className="route-codes">
                {r.orig} <span className="route-arrow">→</span> {r.dest}
              </div>

              <div className="route-name">
                {r.origName} → {r.destName}
              </div>

              <div className="route-meta">
                <span>{r.aircraft}</span>
                <span className="route-price">{r.price}</span>
              </div>

              <div className="route-meta" style={{ marginTop: 4 }}>
                <span>{r.freq}</span>
                <span>{r.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY SECTION */}
      <div style={{ background: '#0B1E35', padding: '4rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#B5841A',
                marginBottom: 12,
                fontWeight: 700,
              }}
            >
              Why DairyFlat Air
            </div>

            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 38,
                fontWeight: 300,
                color: '#F5EDD8',
              }}
            >
              A different way to fly
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {[
              {
                icon: '🔐',
                title: 'Secure Payments',
                desc: 'Protected booking and encrypted checkout for every reservation.',
              },
              {
                icon: '⚡',
                title: 'Instant Confirmation',
                desc: 'Receive your booking reference immediately after booking.',
              },
              {
                icon: '🛩️',
                title: 'Premium Experience',
                desc: 'Luxury private aviation with fast boarding and personalized service.',
              },
              {
                icon: '🌍',
                title: 'Exclusive Destinations',
                desc: 'Fly directly to unique locations across New Zealand and beyond.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-card-dark">
                <div className="feature-icon-dark">{f.icon}</div>
                <div className="feature-title-dark">{f.title}</div>
                <div className="feature-text-dark">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}