import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import OrderTracking from './pages/OrderTracking'
import TenantLogin from './pages/TenantLogin'
import TenantDashboard from './pages/TenantDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu/:tableCode" element={<Menu />} />
          <Route path="/cart/:tableCode" element={<Cart />} />
          <Route path="/order/:orderId" element={<OrderTracking />} />
          <Route path="/tenant/login" element={<TenantLogin />} />
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App