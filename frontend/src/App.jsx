/**
 * App.jsx - Main Application Router
 * ===================================
 * This is the root component that defines ALL the pages (routes) in the app.
 *
 * HOW ROUTING WORKS:
 *   React Router maps URL paths to page components:
 *     /              -> HomePage
 *     /login         -> LoginPage
 *     /admin-dash    -> AdminDashboard
 *     ... and so on
 *
 * STRUCTURE:
 *   - Customer pages: home, products, cart, checkout, etc.
 *   - Auth pages: login, register, verify-code, set-password
 *   - Dashboard pages: admin, accountant, marketing, stock, delivery
 *   - ChatWidget: AI assistant shown on customer pages only (hidden on dashboards)
 */

import { Header } from './components/Header'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
import { AdminDashboard } from './dashboards/admin/AdminDashboard'
import { AccountantDashboard } from './dashboards/AccountantDashboard'
import { MarketingMngrDashboard } from './dashboards/MarketingManagerDashboard'
import { StockMngrDashboard } from './dashboards/StockManagerDashboard'
import { DeliverymanDashboard } from './dashboards/DeliverymanDashboard'
import AccountsPage from './dashboards/admin/AccountsPage'
import ConfigurationPage from './dashboards/admin/ConfigurationPage'
import EngagementPage from './dashboards/admin/EngagementsPage'
import ComplaintsPage from './dashboards/admin/ComplaintsPage'
import ReportPage from './dashboards/admin/ReportPage'
import ValidationPage from './dashboards/admin/ValidationPage'
import AProfilePage from './dashboards/AProfilePage'
import { VerifyCode } from './pages/VerifyCode'
import { SetPassword } from './pages/SetPassword'

import { useLocation } from 'react-router-dom';

// Only show chatbot on customer-facing pages
function CustomerChat() {
  const location = useLocation();
  const hiddenPaths = ['/admin-dash', '/accountant-dash', '/marketing-manager-dash', '/stock-manager-dash', '/deliveryman-dash'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
  if (shouldHide) return null;
  return <ChatWidget />;
}

function CustomerLayout({ children }) {
  const location = useLocation();
  const isDash = location.pathname.startsWith('/admin') ||
                 location.pathname.includes('-dash');
  return (
    <>
      {!isDash && <Header />}
      {children}
    </>
  );
}
function App() {
  return (
    <BrowserRouter>
    <CustomerLayout>
      <Routes>
        <Route index element={<HomePage/>} />
        <Route path='/furniture' element={<FurniturePage />} />
        <Route path='/journal' element={<JournalPage />} />
        <Route path='/product/:productId' element={<ProductPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/contactus' element={<ContactusPage />} />
        <Route path='/aboutus' element={<AboutusPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<SignupPage />} />
        <Route path='/verify-code' element={<VerifyCode />} />
        <Route path='/set-password' element={<SetPassword />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/profile/history' element={<HistoryPage/>} />

        <Route index element={<HomePage/>} />
          <Route path='/furniture' element={<FurniturePage />} />
        <Route path='/order' element={<OrderPage />} />
        <Route path='/checkout/order' element={<OrderPage />} />

        <Route path='/order/tracking/:orderId/:productId' element={<TrackingPage />} />
        <Route path='/favorite' element={<FavoritePage />} />

        {/* Dashboard routes */}
        {/* Admin */}
        <Route path='/admin-dash' element={<AdminDashboard/>}/>
        <Route path='/admin-dash/accounts' element={<AccountsPage/>} />
        <Route path='/admin-dash/complaints' element={<ComplaintsPage/>} />
        <Route path='/admin-dash/configuration' element={<ConfigurationPage/>} />
        <Route path='/admin-dash/engagement' element={<EngagementPage/>} />
        <Route path='/admin-dash/reports' element={<ReportPage/>} />
        <Route path='/admin-dash/validation' element={<ValidationPage/>} />
        <Route path='/admin-dash/profile' element={<AProfilePage/>} />

        <Route path='/accountant-dash' element={<AccountantDashboard/>}/>
        <Route path='/marketing-manager-dash' element={<MarketingMngrDashboard/>}/>
        <Route path='/stock-manager-dash' element={<StockMngrDashboard/>}/>
        <Route path='/deliveryman-dash' element={<DeliverymanDashboard/>}/>

      </Routes>
      </CustomerLayout> 
    <CustomerChat />
    </BrowserRouter>
  )
}

export default App
