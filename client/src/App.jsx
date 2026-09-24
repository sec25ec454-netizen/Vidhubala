import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const companies = [
  { name: 'TCS', mark: 'T', tone: 'blue' },
  { name: 'Infosys', mark: 'I', tone: 'orange' },
  { name: 'Wipro', mark: 'W', tone: 'violet' },
  { name: 'HCLTech', mark: 'H', tone: 'green' },
  { name: 'Accenture', mark: 'A', tone: 'purple' },
  { name: 'Cognizant', mark: 'C', tone: 'teal' },
  { name: 'IBM', mark: 'I', tone: 'navy' },
  { name: 'Capgemini', mark: 'C', tone: 'pink' },
  { name: 'Deloitte', mark: 'D', tone: 'lime' },
  { name: 'Tech Mahindra', mark: 'T', tone: 'red' },
]

const initialForm = {
  studentName: '', rollNo: '', dateOfBirth: '', bloodGroup: '', phone: '',
  email: '', address: '', department: '', gender: '', year: '', section: '', backlogs: '0',
}

function App() {
  const [page, setPage] = useState('details')
  const [activeView, setActiveView] = useState('student')
  const [form, setForm] = useState(initialForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const eligible = form.backlogs === '0'

  const groupedRegistrations = useMemo(() => companies.map((company) => ({
    ...company,
    students: registrations.filter((registration) => registration.companies.includes(company.name)),
  })), [registrations])

  useEffect(() => {
    if (activeView !== 'admin') return

    fetch(`${API_URL}/api/registrations`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load registrations')
        return response.json()
      })
      .then(setRegistrations)
      .catch(() => setError('Unable to load saved registrations. Check that the server and MongoDB are running.'))
  }, [activeView])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function continueToCompanies(event) {
    event.preventDefault()
    if (!eligible) {
      setError('Students with active backlogs are not eligible for company selection.')
      return
    }
    setPage('companies')
    setError('')
  }

  function toggleCompany(companyName) {
    setSelectedCompanies((current) => current.includes(companyName)
      ? current.filter((name) => name !== companyName)
      : current.length < 4 ? [...current, companyName] : current)
    setError('')
  }

  async function submitRegistration(event) {
    event.preventDefault()
    if (selectedCompanies.length !== 4) {
      setError('Choose exactly four companies to complete your registration.')
      return
    }
    try {
      const response = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, companies: selectedCompanies }),
      })
      const registration = await response.json()
      if (!response.ok) throw new Error(registration.message)
      setRegistrations((current) => [{ ...registration, id: registration._id }, ...current])
      setSubmitted(true)
      setError('')
    } catch {
      setError('Unable to save registration. Check that the server and MongoDB are running.')
    }
  }

  function startNewRegistration() {
    setForm(initialForm)
    setSelectedCompanies([])
    setPage('details')
    setSubmitted(false)
  }

  const input = (label, name, type = 'text', options = {}) => (
    <label className={`field ${options.className || ''}`}>
      <span>{label}</span>
      {options.select ? <select name={name} value={form[name]} onChange={updateField} required><option value="">Select {label.toLowerCase()}</option>{options.select.map((option) => <option key={option}>{option}</option>)}</select> : <input name={name} type={type} value={form[name]} onChange={updateField} required min={options.min} max={options.max} placeholder={options.placeholder} />}
    </label>
  )

  return (
    <div className="app-shell">
      <header className="topbar"><a className="brand" href="#top" onClick={() => setActiveView('student')}><span className="brand-mark">N</span><span><strong>northstar</strong><small>career cell</small></span></a><nav className="view-switcher" aria-label="Workspace view"><button className={activeView === 'student' ? 'active' : ''} onClick={() => setActiveView('student')}>Student portal</button><button className={activeView === 'admin' ? 'active' : ''} onClick={() => setActiveView('admin')}>Admin view</button></nav><div className="secure-label"><span className="status-dot" /> Registration open</div></header>
      {activeView === 'admin' ? <main className="admin-page" id="top"><div className="page-heading"><div><p className="eyebrow">Placement operations / 2025–26</p><h1>Registration overview</h1><p>Track eligible students by their selected MNC preferences.</p></div><div className="admin-stat"><strong>{registrations.length}</strong><span>total registrations</span></div></div><div className="admin-toolbar"><div className="toolbar-title"><span className="live-dot" /> Company-wise applications</div><span className="muted">{registrations.reduce((count, item) => count + item.companies.length, 0)} preferences recorded</span></div><section className="company-grid">{groupedRegistrations.map((company) => <article className="company-card" key={company.name}><div className="company-card-head"><div className={`company-mark ${company.tone}`}>{company.mark}</div><div><h2>{company.name}</h2><span>{company.students.length} applicant{company.students.length !== 1 ? 's' : ''}</span></div><strong className="applicant-count">{String(company.students.length).padStart(2, '0')}</strong></div>{company.students.length ? <div className="student-list">{company.students.map((student) => <div className="student-row" key={`${company.name}-${student.id}`}><span className="avatar">{student.studentName.slice(0, 1).toUpperCase()}</span><div><strong>{student.studentName}</strong><small>{student.rollNo} · {student.department}</small></div></div>)}</div> : <div className="empty-list">No applications yet</div>}</article>)}</section></main> : <main className="student-page" id="top"><section className="intro"><div><p className="eyebrow">Northstar career cell</p><h1>Build your <em>next chapter.</em></h1><p className="intro-copy">Register once, get discovered by the right teams, and take your first step towards a career that moves.</p></div><div className="intro-note"><span>01</span><strong>Student placement registration</strong><small>Academic year 2025–26</small></div></section><div className="progress"><div className={`progress-step ${page === 'details' ? 'current' : 'complete'}`}><span>01</span><div><strong>Student details</strong><small>Tell us about yourself</small></div></div><div className="progress-line" /><div className={`progress-step ${page === 'companies' ? 'current' : ''}`}><span>02</span><div><strong>Company preferences</strong><small>Choose your top four</small></div></div></div>{submitted ? <section className="success-panel"><div className="success-icon">✓</div><p className="eyebrow">Registration complete</p><h2>You’re on your way, {form.studentName.split(' ')[0]}.</h2><p>Your preferences have been recorded. The career cell will share next steps on your registered email.</p><div className="selected-summary">{selectedCompanies.map((company) => <span key={company}>{company}</span>)}</div><button className="secondary-button" onClick={startNewRegistration}>Register another student <span>↗</span></button></section> : page === 'details' ? <form className="form-panel" onSubmit={continueToCompanies}><div className="section-title"><div><p className="eyebrow">Step one</p><h2>About you</h2></div><span className="required-note">All fields are required</span></div><div className="field-grid">{input('Student name', 'studentName', 'text', { placeholder: 'e.g. Ananya Rao' })}{input('Roll number', 'rollNo', 'text', { placeholder: 'e.g. CSE24A001' })}{input('Date of birth', 'dateOfBirth', 'date')}{input('Blood group', 'bloodGroup', 'text', { select: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] })}{input('Phone number', 'phone', 'tel', { placeholder: '+91 98765 43210' })}{input('Email ID', 'email', 'email', { placeholder: 'you@example.com' })}<label className="field full-field"><span>Address</span><textarea name="address" value={form.address} onChange={updateField} required placeholder="Your current address" /></label>{input('Department of engineering', 'department', 'text', { select: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering'] })}{input('Gender', 'gender', 'text', { select: ['Female', 'Male', 'Non-binary', 'Prefer not to say'] })}{input('Year', 'year', 'text', { select: ['First year', 'Second year', 'Third year', 'Final year'] })}{input('Section', 'section', 'text', { placeholder: 'e.g. A' })}{input('Number of backlogs', 'backlogs', 'number', { min: 0, max: 99, placeholder: '0' })}</div><div className="form-footer"><div className={`eligibility ${eligible ? 'eligible' : 'blocked'}`}><span>{eligible ? '✓' : '!'}</span><div><strong>{eligible ? 'You’re eligible for placements' : 'Company selection is locked'}</strong><small>{eligible ? 'Zero backlogs unlocks company preferences.' : 'Clear all backlogs to continue.'}</small></div></div><div>{error && <p className="error-message">{error}</p>}<button className="primary-button" type="submit">Continue to preferences <span>→</span></button></div></div></form> : <form className="form-panel" onSubmit={submitRegistration}><div className="section-title"><div><p className="eyebrow">Step two</p><h2>Choose your companies</h2><p className="section-description">Select exactly four MNCs you would like to be considered for.</p></div><span className="selection-count"><strong>{selectedCompanies.length}</strong> / 4 selected</span></div><div className="company-picker">{companies.map((company) => <button type="button" className={`company-option ${selectedCompanies.includes(company.name) ? 'selected' : ''}`} key={company.name} onClick={() => toggleCompany(company.name)}><span className={`company-mark ${company.tone}`}>{company.mark}</span><span><strong>{company.name}</strong><small>Global technology partner</small></span><span className="checkmark">{selectedCompanies.includes(company.name) ? '✓' : ''}</span></button>)}</div><div className="form-footer"><button type="button" className="back-button" onClick={() => setPage('details')}>← Back to details</button><div>{error && <p className="error-message">{error}</p>}<button className="primary-button" type="submit">Submit registration <span>↗</span></button></div></div></form>}</main>}
      <footer><span>Northstar career cell</span><span>Built for ambitious beginnings <b>✦</b></span></footer>
    </div>
  )
}

export default App
