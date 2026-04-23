import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import ChatWidget from './components/ChatWidget/ChatWidget'

import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ContactusPage } from './pages/ContactusPage'
import { AboutusPage } from './pages/AboutusPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { OrderPage } from './pages/OrderPage'
import { TrackingPage } from './pages/TrackingPage'
import { ProfilePage } from './pages/ProfilePage'
import { CartPage } from './pages/CartPage'
import { FavoritePage } from './pages/FavoritePage'
import { FurniturePage } from './pages/FurniturePage'
import { JournalPage } from './pages/JournalPage'
import { HistoryPage } from './pages/HistoryPage'
import { VerifyCode } from './pages/VerifyCode'
import { SetPassword } from './pages/SetPassword'

import { AdminDashboard } from './dashboards/admin/AdminDashboard'
import AccountsPage from './dashboards/admin/AccountsPage'
import ConfigurationPage from './dashboards/admin/ConfigurationPage'
import EngagementPage from './dashboards/admin/EngagementsPage'
import ComplaintsPage from './dashboards/admin/ComplaintsPage'
import ReportPage from './dashboards/admin/ReportPage'
import ValidationPage from './dashboards/admin/ValidationPage'
import AProfilePage from './dashboards/AProfilePage'

import { OverviewPage } from './dashboards/stockmanager/OverviewPage'
import { DeliveryPage } from './dashboards/stockmanager/DeliveryPage'
import { ReturnsPage } from './dashboards/stockmanager/ReturnsPage'
import { ProductCatalogPage } from './dashboards/stockmanager/ProductCatalogPage'
import ARPage from './dashboards/stockmanager/ArPage'

import MarketingMngrDashboard from './dashboards/marketingmanager/MarketingManagerDashboard'
import BlogsPage from './dashboards/marketingmanager/BlogPage'
import CampaignsPage from './dashboards/marketingmanager/CampaignsPage'
import NewslettersPage from './dashboards/marketingmanager/NewslettersPage'
import PromotionsPage from './dashboards/marketingmanager/PromotionsPage'

import { DeliverymanDashboard } from './dashboards/deliveryman/DeliverymanDashboard'

import { isAuthenticated } from './services/auth'

// ===================== AUTH =====================

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

const RoleProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token")
  const userRole = localStorage.getItem("role")

  if (!token) return <Navigate to="/login" replace />
  if (role && userRole !== role) return <Navigate to="/" replace />

  return children
}

// ===================== LAYOUT =====================

function CustomerChat() {
  const location = useLocation()
  const hiddenPaths = [
    '/admin-dash',
    '/accountant-dash',
    '/marketing-manager-dash',
    '/stock-manager-dash',
    '/deliveryman-dash'
  ]

  const shouldHide = hiddenPaths.some(path =>
    location.pathname.startsWith(path)
  )

  if (shouldHide) return null
  return <ChatWidget />
}

function CustomerLayout({ children }) {
  const location = useLocation()

  const isDash =
    location.pathname.includes('-dash')

  return (
    <div className="flex flex-col min-h-screen">
      {!isDash && <Header />}

      <main className="flex-1">{children}</main>

      {!isDash && <Footer />}

      <CustomerChat />
    </div>
  )
}

// ===================== APP =====================

function App() {
  return (
    <BrowserRouter>
      <CustomerLayout>
        <Routes>

          {/* ===== PUBLIC ROUTES ===== */}
          <Route index element={<HomePage />} />
          <Route path='/furniture' element={<FurniturePage />} />
          <Route path='/journal' element={<JournalPage />} />
          <Route path='/product/:productId' element={<ProductPage />} />
          <Route path='/contactus' element={<ContactusPage />} />
          <Route path='/aboutus' element={<AboutusPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<SignupPage />} />
          <Route path='/verify-code' element={<VerifyCode />} />
          <Route path='/set-password' element={<SetPassword />} />

          {/* ===== PROTECTED USER ROUTES ===== */}
          <Route path='/cart' element={
            <ProtectedRoute><CartPage /></ProtectedRoute>
          } />

          <Route path='/checkout' element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />

          <Route path='/profile' element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          <Route path='/profile/history' element={
            <ProtectedRoute><HistoryPage /></ProtectedRoute>
          } />

          <Route path='/favorite' element={
            <ProtectedRoute><FavoritePage /></ProtectedRoute>
          } />

          <Route path='/order' element={
            <ProtectedRoute><OrderPage /></ProtectedRoute>
          } />

          <Route path='/order/tracking/:orderId/:productId' element={
            <ProtectedRoute><TrackingPage /></ProtectedRoute>
          } />

          {/* ===== ADMIN ===== */}
          <Route path='/admin-dash' element={
            <RoleProtectedRoute role="admin">
              <AdminDashboard />
            </RoleProtectedRoute>
          } />

          <Route path='/admin-dash/accounts' element={<AccountsPage />} />
          <Route path='/admin-dash/complaints' element={<ComplaintsPage />} />
          <Route path='/admin-dash/configuration' element={<ConfigurationPage />} />
          <Route path='/admin-dash/engagement' element={<EngagementPage />} />
          <Route path='/admin-dash/reports' element={<ReportPage />} />
          <Route path='/admin-dash/validation' element={<ValidationPage />} />

          {/* ===== MARKETING ===== */}
          <Route path='/marketing-manager-dash' element={<MarketingMngrDashboard />} />
          <Route path='/marketing-manager-dash/blogs' element={<BlogsPage />} />
          <Route path='/marketing-manager-dash/campaigns' element={<CampaignsPage />} />
          <Route path='/marketing-manager-dash/newsletters' element={<NewslettersPage />} />
          <Route path='/marketing-manager-dash/promotions' element={<PromotionsPage />} />

          {/* ===== STOCK ===== */}
          <Route path='/stock-manager-dash' element={<OverviewPage />} />
          <Route path='/stock-manager-dash/deliveries' element={<DeliveryPage />} />
          <Route path='/stock-manager-dash/returns' element={<ReturnsPage />} />
          <Route path='/stock-manager-dash/inventories' element={<ProductCatalogPage />} />
          <Route path='/stock-manager-dash/ar' element={<ARPage />} />

          {/* ===== DELIVERY ===== */}
          <Route path='/deliveryman-dash' element={<DeliverymanDashboard />} />

          {/* ===== PROFILE (ALL DASHBOARDS) ===== */}
          {[
            "/admin-dash/profile",
            "/marketing-manager-dash/profile",
            "/stock-manager-dash/profile",
            "/deliveryman-dash/profile",
          ].map((path) => (
            <Route key={path} path={path} element={<AProfilePage />} />
          ))}

        </Routes>
      </CustomerLayout>
    </BrowserRouter>
  )
}

export default App