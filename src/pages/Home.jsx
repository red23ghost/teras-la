import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [tableCode, setTableCode] = useState('')
  const navigate = useNavigate()

  const handleScan = () => {
    if (tableCode.trim()) {
      navigate(`/menu/${tableCode.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-green-800 mb-2">Teras LA</h1>
        <p className="text-green-600 text-lg">Food Court Digital</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-semibold text-gray-800">Scan QR Meja Anda</h2>
          <p className="text-gray-500 text-sm mt-1">Atau masukkan kode meja secara manual</p>
        </div>

        <input
          type="text"
          placeholder="Contoh: MEJA-01"
          className="w-full border rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
          value={tableCode}
          onChange={e => setTableCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleScan()}
        />

        <button
          onClick={handleScan}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition"
        >
          Lihat Menu
        </button>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Tenant? <a href="/tenant/login" className="text-green-600 hover:underline">Login disini</a></p>
      </div>
    </div>
  )
}

export default Home