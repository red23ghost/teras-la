import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function AdminDashboard() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [newTenant, setNewTenant] = useState({ name: '', phone: '', username: '', password: '', description: '' })
  const [newTable, setNewTable] = useState({ tableCode: '', tableNumber: '' })
  const [showAddTenant, setShowAddTenant] = useState(false)
  const [showAddTable, setShowAddTable] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { navigate('/admin/login'); return }
    fetchData(token)
  }, [])

  const fetchData = async (token) => {
    try {
      const [tenantsRes, ordersRes, tablesRes] = await Promise.all([
        axios.get(`${API}/api/tenants`),
        axios.get(`${API}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/tables`)
      ])
      setTenants(tenantsRes.data)
      setOrders(ordersRes.data)
      setTables(tablesRes.data)
      setLoading(false)
    } catch (error) {
      navigate('/admin/login')
    }
  }

  const handleAddTenant = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      await axios.post(`${API}/api/tenants`, newTenant, { headers: { Authorization: `Bearer ${token}` } })
      setNewTenant({ name: '', phone: '', username: '', password: '', description: '' })
      setShowAddTenant(false)
      fetchData(token)
    } catch (error) {
      alert('Gagal menambah tenant')
    }
  }

  const handleDeleteTenant = async (id) => {
    if (!confirm('Hapus tenant ini?')) return
    const token = localStorage.getItem('adminToken')
    try {
      await axios.delete(`${API}/api/tenants/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchData(token)
    } catch (error) {
      alert('Gagal menghapus tenant')
    }
  }

  const handleAddTable = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      await axios.post(`${API}/api/tables`, newTable, { headers: { Authorization: `Bearer ${token}` } })
      setNewTable({ tableCode: '', tableNumber: '' })
      setShowAddTable(false)
      fetchData(token)
    } catch (error) {
      alert('Gagal menambah meja')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  if (loading) return <div className="text-center py-20">Loading...</div>

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Teras LA Admin</h1>
          <p className="text-green-300 text-sm">Dashboard Pengelola</p>
        </div>
        <button onClick={handleLogout} className="bg-green-900 px-3 py-2 rounded-lg text-sm">Logout</button>
      </nav>

      {/* Tabs */}
      <div className="flex px-6 py-4 gap-2 overflow-x-auto">
        {['overview', 'tenants', 'orders', 'tables'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            {tab === 'overview' ? 'Ringkasan' : tab === 'tenants' ? 'Tenant' : tab === 'orders' ? 'Order' : 'Meja'}
          </button>
        ))}
      </div>

      <div className="px-6 pb-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{tenants.length}</div>
              <div className="text-gray-500">Total Tenant</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{orders.length}</div>
              <div className="text-gray-500">Total Order</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{tables.length}</div>
              <div className="text-gray-500">Total Meja</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-lg font-bold text-purple-600">Rp {totalRevenue.toLocaleString()}</div>
              <div className="text-gray-500">Total Revenue</div>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div>
            <button onClick={() => setShowAddTenant(!showAddTenant)} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold mb-4">
              + Tambah Tenant
            </button>
            {showAddTenant && (
              <div className="bg-white rounded-xl shadow p-4 mb-4 space-y-3">
                <input type="text" placeholder="Nama tenant" className="w-full border rounded-lg px-3 py-2" value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} />
                <input type="text" placeholder="No. HP" className="w-full border rounded-lg px-3 py-2" value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} />
                <input type="text" placeholder="Username" className="w-full border rounded-lg px-3 py-2" value={newTenant.username} onChange={e => setNewTenant({...newTenant, username: e.target.value})} />
                <input type="password" placeholder="Password" className="w-full border rounded-lg px-3 py-2" value={newTenant.password} onChange={e => setNewTenant({...newTenant, password: e.target.value})} />
                <input type="text" placeholder="Deskripsi" className="w-full border rounded-lg px-3 py-2" value={newTenant.description} onChange={e => setNewTenant({...newTenant, description: e.target.value})} />
                <button onClick={handleAddTenant} className="w-full bg-green-600 text-white py-2 rounded-lg">Simpan</button>
              </div>
            )}
            <div className="space-y-3">
              {tenants.map(t => (
                <div key={t._id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.phone}</p>
                    <p className="text-gray-400 text-xs">@{t.username}</p>
                  </div>
                  <button onClick={() => handleDeleteTenant(t._id)} className="text-red-500 text-sm hover:underline">Hapus</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{order.customerName}</p>
                    <p className="text-gray-500 text-sm">Meja {order.tableCode}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-600' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>{order.status}</span>
                </div>
                <p className="text-green-600 font-bold">Rp {order.total.toLocaleString()}</p>
                <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tables' && (
          <div>
            <button onClick={() => setShowAddTable(!showAddTable)} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold mb-4">
              + Tambah Meja
            </button>
            {showAddTable && (
              <div className="bg-white rounded-xl shadow p-4 mb-4 space-y-3">
                <input type="number" placeholder="Nomor meja" className="w-full border rounded-lg px-3 py-2" value={newTable.tableNumber} onChange={e => setNewTable({...newTable, tableNumber: e.target.value, tableCode: `MEJA-${String(e.target.value).padStart(2, '0')}`})} />
                <input type="text" placeholder="Kode meja (otomatis)" className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={newTable.tableCode} readOnly />
                <button onClick={handleAddTable} className="w-full bg-green-600 text-white py-2 rounded-lg">Simpan</button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {tables.map(t => (
                <div key={t._id} className="bg-white rounded-xl shadow p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{t.tableNumber}</div>
                  <div className="text-gray-500 text-xs">{t.tableCode}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
