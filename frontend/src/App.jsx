// App.jsx
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { BrowserRouter, Route, Routes, Navigate, useLocation, Outlet } from 'react-router-dom'
import ChatWidget from './components/ChatWidget/ChatWidget'
import AuthProvider from './components/AuthProvider'
import { FAQPage } from './pages/FAQPage'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ContactusPage } from './pages/ContactusPage'
import { AboutusPage } from './pages/AboutusPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { OrderPage } from './pages/OrderPage'
import { InvoicePage } from './pages/InvoicePage'     
import { TrackingPage } from './pages/TrackingPage'
import { ProfilePage } from './pages/ProfilePage'
import { CartPage } from './pages/CartPage'
import { FavoritePage } from './pages/FavoritePage'
import { FurniturePage } from './pages/FurniturePage'
import { JournalPage } from './pages/JournalPage'
import { HistoryPage } from './pages/HistoryPage'
import { VerifyCode } from './pages/VerifyCode'
import { SetPassword } from './pages/SetPassword'
import SearchPage from './pages/SearchPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
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

import TodayOrdersPage from './dashboards/deliveryman/TodayOrdersPage'
import SchedulePage from './dashboards/deliveryman/SchedulePage'
import DlvProfilePage from './dashboards/deliveryman/DlvProfilePage'
import DlvHistoryPage from './dashboards/deliveryman/DlvHistoryPage'
import ProblemsPage from './dashboards/stockmanager/ProblemsPage'

import FurnitureConfigPage from './pages/FurnitureConfigPage' 


// ===================== AUTH GUARDS =====================

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleProtectedRoute = ({ role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return <Outlet />;
};

// ===================== LAYOUT =====================

function CustomerChat() {
  const location = useLocation();
  const hiddenPaths = [
    '/admin-dash',
    '/accountant-dash',
    '/marketing-manager-dash',
    '/stock-manager-dash',
    '/deliveryman-dash',
  ];

  const shouldHide = hiddenPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  if (shouldHide) return null;
  return <ChatWidget />;
}

function CustomerLayout() {
  const location = useLocation();
  const isDash = location.pathname.includes('-dash') || location.pathname === '/furniture/customize';

  return (
    <div className="flex flex-col min-h-screen">
      {!isDash && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isDash && <Footer />}
      <CustomerChat />
    </div>
  );
}

// ===================== APP =====================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<CustomerLayout />}>

           {/* ===== PUBLIC ROUTES ===== */}
            <Route index element={<HomePage />} />
            <Route path='/furniture' element={<FurniturePage />} />
            <Route path='/furniture/customize' element={<FurnitureConfigPage />} />   
            <Route path='/journal' element={<JournalPage />} />
            <Route path='/search' element={<SearchPage />} />
            <Route path='/product/:productId' element={<ProductPage />} />
            <Route path='/contactus' element={<ContactusPage />} />
            <Route path='/aboutus' element={<AboutusPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<SignupPage />} />
            <Route path='/verify-code' element={<VerifyCode />} />
            <Route path='/set-password' element={<SetPassword />} />
            <Route path='/privacy' element={<PrivacyPolicy />} />
            <Route path='/terms' element={<TermsOfService />} />
            <Route path='/faq' element={<FAQPage />} />
            

            {/* ===== PROTECTED USER ROUTES ===== */}
            <Route path='/cart' element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path='/checkout' element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path='/profile/history' element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path='/favorite' element={<ProtectedRoute><FavoritePage /></ProtectedRoute>} />

            {/* Order flow: checkout → invoice → orders list → tracking */}
            <Route path='/order/confirmation' element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />   {/* ← NEW: post-checkout invoice */}
            <Route path='/order' element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
            <Route path='/order/tracking/:orderId/:productId' element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />

            {/* ===== ADMIN ===== */}
            <Route path='/admin-dash' element={<RoleProtectedRoute role="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path='accounts' element={<AccountsPage />} />
              <Route path='complaints' element={<ComplaintsPage />} />
              <Route path='configuration' element={<ConfigurationPage />} />
              <Route path='engagement' element={<EngagementPage />} />
              <Route path='reports' element={<ReportPage />} />
              <Route path='validation' element={<ValidationPage />} />
              <Route path='profile' element={<AProfilePage />} />
            </Route>

            {/* ===== MARKETING ===== */}
            <Route path='/marketing-manager-dash' element={<RoleProtectedRoute role="marketing_manager" />}>
              <Route index element={<MarketingMngrDashboard />} />
              <Route path='blogs' element={<BlogsPage />} />
              <Route path='campaigns' element={<CampaignsPage />} />
              <Route path='newsletters' element={<NewslettersPage />} />
              <Route path='profile' element={<AProfilePage />} />
            </Route>

            {/* ===== STOCK ===== */}
            <Route path='/stock-manager-dash' element={<RoleProtectedRoute role="stock_manager" />}>
              <Route index element={<OverviewPage />} />
              <Route path='deliveries' element={<DeliveryPage />} />
              <Route path='returns' element={<ReturnsPage />} />
              <Route path='inventories' element={<ProductCatalogPage />} />
              <Route path='ar' element={<ARPage />} />
              <Route path='problems' element={<ProblemsPage/>}/>
              <Route path='profile' element={<AProfilePage />} />
            </Route>

            {/* ===== DELIVERY ===== */}
            <Route path='/deliveryman-dash' element={<RoleProtectedRoute role="deliveryman" />}>
              <Route index element={<TodayOrdersPage />} />
              <Route path='schedule' element={<SchedulePage />} />
              <Route path='history' element={<DlvHistoryPage />} />
              <Route path='profile' element={<DlvProfilePage />} />
            </Route>         
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;