import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function TenantLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/tenant/login`, form)
      localStorage.setItem('tenantToken', res.data.token)
      localStorage.setItem('tenantData', JSON.stringify(res.data.tenant))
      navigate('/tenant/dashboard')
    } catch (err) {
      setError('Username atau password salah')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">Teras LA</h1>
          <p className="text-gray-500 mt-1">Login Tenant</p>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Masukkan username"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Masukkan password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Admin? <a href="/admin/login" className="text-green-600 hover:underline">Login disini</a>
        </p>
      </div>
    </div>
  )
}

export default TenantLogin