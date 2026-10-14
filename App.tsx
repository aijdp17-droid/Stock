import { useMemo, useState } from 'react'
import { ArrowUpRight, CalendarDays, ChevronDown, CircleHelp, Info, Landmark, Menu, Minus, Plus, RotateCcw, Sparkles, WalletCards } from 'lucide-react'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const compactCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })

function Field({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (value: number) => void; prefix?: string; suffix?: string }) {
  return <label className="field"><span>{label}</span><div className="input-wrap">{prefix && <b>{prefix}</b>}<input type="number" value={value} min="0" onChange={(event) => onChange(Number(event.target.value))} />{suffix && <b>{suffix}</b>}</div></label>
}

export default function App() {
  const [initial, setInitial] = useState(10000)
  const [monthly, setMonthly] = useState(500)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(20)
  const [frequency, setFrequency] = useState('Monthly')

  const growth = useMemo(() => {
    const periods = frequency === 'Annually' ? 1 : frequency === 'Quarterly' ? 4 : 12
    const points = Array.from({ length: years + 1 }, (_, year) => {
      const n = year * periods
      const r = rate / 100 / periods
      const contribution = monthly * (frequency === 'Monthly' ? 12 : frequency === 'Quarterly' ? 4 : 1)
      const balance = initial * Math.pow(1 + r, n) + (contribution * (Math.pow(1 + r, n) - 1)) / (r || 1)
      const invested = initial + contribution * year
      return { year, balance: Math.round(balance), invested: Math.round(invested) }
    })
    return points
  }, [initial, monthly, rate, years, frequency])

  const final = growth[growth.length - 1]
  const interest = final.balance - final.invested
  const max = Math.max(...growth.map((point) => point.balance), 1)
  const chartPoints = growth.map((point, index) => `${(index / years) * 100},${100 - (point.balance / max) * 84}`).join(' ')
  const investedPoints = growth.map((point, index) => `${(index / years) * 100},${100 - (point.invested / max) * 84}`).join(' ')

  const reset = () => { setInitial(10000); setMonthly(500); setRate(7); setYears(20); setFrequency('Monthly') }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><Sparkles /></div><div><strong>Compoundly</strong><small>Build your future</small></div></div><nav><a className="active">Calculator</a><a>Learn</a><a>About</a></nav><button className="menu-button" aria-label="Open menu"><Menu /></button><button className="top-action"><CircleHelp /> Help center</button></header>
    <main>
      <section className="hero"><div><p className="eyebrow"><span></span> FINANCIAL PLANNING</p><h1>Make your money<br /><em>work harder.</em></h1><p className="hero-copy">See how your savings can grow over time with the power of compound interest.</p></div><div className="hero-note"><div className="note-icon"><Landmark /></div><p><strong>Small steps, big impact</strong><br />Consistency is the key to long-term wealth.</p></div></section>
      <section className="workspace">
        <aside className="controls card"><div className="card-heading"><div><p className="section-label">YOUR PLAN</p><h2>Set your goals</h2></div><button className="icon-button" onClick={reset} aria-label="Reset calculator"><RotateCcw /></button></div>
          <div className="fields"><Field label="Initial investment" prefix="$" value={initial} onChange={setInitial} /><Field label="Monthly contribution" prefix="$" value={monthly} onChange={setMonthly} /><Field label="Expected annual return" value={rate} suffix="%" onChange={setRate} /><Field label="Investment period" value={years} suffix="years" onChange={setYears} /></div>
          <div className="frequency"><span>Compounding frequency</span><div className="segmented">{['Monthly', 'Quarterly', 'Annually'].map((item) => <button key={item} className={frequency === item ? 'selected' : ''} onClick={() => setFrequency(item)}>{item}</button>)}</div></div>
          <div className="assumption"><Info /><span>Returns are estimates and not guaranteed. Past performance does not indicate future results.</span></div>
        </aside>
        <section className="results"><div className="result-top"><div><p className="section-label">PROJECTED VALUE</p><div className="big-number">{currency.format(final.balance)}</div><p className="positive"><ArrowUpRight /> {currency.format(interest)} earned in interest</p></div><div className="date-pill"><CalendarDays /> In {years} years <ChevronDown /></div></div>
          <div className="chart-card card"><div className="chart-header"><div><h2>Your growth over time</h2><p>See how your contributions and interest add up.</p></div><div className="legend"><span><i className="dot purple"></i>Total value</span><span><i className="dot gray"></i>Contributions</span></div></div><div className="chart-wrap"><div className="y-labels"><span>{compactCurrency.format(max)}</span><span>{compactCurrency.format(max * .66)}</span><span>{compactCurrency.format(max * .33)}</span><span>$0</span></div><div className="chart"><div className="grid-lines"><i></i><i></i><i></i><i></i></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Investment growth chart"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7c5cff" stopOpacity=".24"/><stop offset="1" stopColor="#7c5cff" stopOpacity="0"/></linearGradient></defs><polygon points={`0,100 ${chartPoints} 100,100`} fill="url(#fill)"/><polyline points={investedPoints} fill="none" stroke="#a7a0b8" strokeWidth=".8" strokeDasharray="1.8 1.8" vectorEffect="non-scaling-stroke"/><polyline points={chartPoints} fill="none" stroke="#7156e8" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg><div className="x-labels"><span>Today</span><span>Year {Math.round(years / 4)}</span><span>Year {Math.round(years / 2)}</span><span>Year {Math.round(years * .75)}</span><span>Year {years}</span></div></div></div></div>
          <div className="summary-grid"><div className="summary-item"><span><WalletCards /> Total contributions</span><strong>{currency.format(final.invested)}</strong></div><div className="summary-item"><span><Sparkles /> Interest earned</span><strong className="purple-text">{currency.format(interest)}</strong></div><div className="summary-item"><span><ArrowUpRight /> Total growth</span><strong>{Math.round((final.balance / final.invested - 1) * 100)}%</strong></div></div>
          <div className="tip"><div className="tip-icon"><Plus /></div><div><strong>Want to grow faster?</strong><p>Increasing your monthly contribution by just $100 could add <b>{currency.format(Math.round(final.balance * 0.08))}</b> to your final balance.</p></div></div>
        </section>
      </section>
    </main><footer><span>© 2025 Compoundly</span><span>For illustrative purposes only <Info /></span></footer>
  </div>
}

export { Minus }
