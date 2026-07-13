import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function Menu() {
  const { tableCode } = useParams()
  const navigate = useNavigate()
  const { cart, addToCart, total } = useCart()
  const [products, setProducts] = useState([])
  const [tenants, setTenants] = useState([])
  const [selectedTenant, setSelectedTenant] = useState('all')
  const [loading, setLoading] = useState(true)
  const [table, setTable] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, tenantsRes, tableRes] = await Promise.all([
          axios.get(`${API}/api/products`),
          axios.get(`${API}/api/tenants`),
          axios.get(`${API}/api/tables/code/${tableCode}`)
        ])
        setProducts(productsRes.data)
        setTenants(tenantsRes.data)
        setTable(tableRes.data)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }
    fetchData()
  }, [tableCode])

  const filteredProducts = selectedTenant === 'all'
    ? products
    : products.filter(p => p.tenant._id === selectedTenant)

  if (loading) return <div className="text-center py-20">Loading menu...</div>
  if (!table) return <div className="text-center py-20">Meja tidak ditemukan</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white px-6 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Teras LA</h1>
            <p className="text-green-200 text-sm">Meja {table.tableNumber} - {tableCode}</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => navigate(`/cart/${tableCode}`)}
              className="bg-white text-green-700 px-4 py-2 rounded-full font-semibold text-sm"
            >
              🛒 {cart.length} item • Rp {total.toLocaleString()}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tenant */}
      <div className="px-6 py-4 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTenant('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedTenant === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Semua
          </button>
          {tenants.map(t => (
            <button
              key={t._id}
              onClick={() => setSelectedTenant(t._id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedTenant === t._id ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow overflow-hidden">
              <img
                src={product.photo}
                alt={product.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-2">{product.tenant?.name}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold text-sm">Rp {product.price.toLocaleString()}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-green-600 text-white w-7 h-7 rounded-full text-lg font-bold hover:bg-green-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Float Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6">
          <button
            onClick={() => navigate(`/cart/${tableCode}`)}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-green-700 transition"
          >
            Lihat Keranjang ({cart.length} item) • Rp {total.toLocaleString()}
          </button>
        </div>
      )}
    </div>
  )
}

export default Menu
