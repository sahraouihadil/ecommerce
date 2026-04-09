
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
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
import { AdminDashboard } from './dashbords/admin/AdminDashbord'
import { AccountantDashboard } from './dashbords/AccountantDashbord'
import { MarketingMngrDashboard } from './dashbords/MarketingMngrDashbord'
import { StockMngrDashboard } from './dashbords/StockMngrDashbord'
import { DeliverymanDashboard } from './dashbords/DeliverymanDashbord'
import AccountsPage from './dashbords/admin/AccountsPage'
import ConfigrationPage from './dashbords/admin/ConfigrationPage'
import EngagementPage from './dashbords/admin/EngagementsPage'
import ComplaintsPage from './dashbords/admin/ComplaintsPage'
import ReportPage from './dashbords/admin/ReportPage'
import ValidationPage from './dashbords/admin/ValidationPage'
import AProfilePage from './dashbords/AProfilePage'
import AuditLogPage from './dashbords/admin/AuditLogPage'

function App() {
  return (
    <BrowserRouter>
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
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/profile/history' element={<HistoryPage/>}></Route>

        {/* Fixed nested routes */}
        <Route path='/order' element={<OrderPage />} />
        <Route path='/checkout/order' element={<OrderPage />} />

        <Route path='/order/tracking/:orderId/:productId' element={<TrackingPage />} />
        <Route path='/favorite' element={<FavoritePage />} />

        {/* Dashbords routes */}
        {/* Admin */}
        <Route path='/admin-dash' element={<AdminDashboard/>}/>
         <Route path='/admin-dash/audit-log' element={<AuditLogPage/>}/>
        <Route path='/admin-dash/accounts' element={<AccountsPage/>}></Route>
        <Route path='/admin-dash/complaints' element={<ComplaintsPage/>}></Route>
        <Route path='/admin-dash/configration' element={<ConfigrationPage/>}></Route>
        <Route path='/admin-dash/engagment' element={<EngagementPage/>}></Route>
        <Route path='/admin-dash/reports' element={<ReportPage/>}></Route>
        <Route path='/admin-dash/validation' element={<ValidationPage/>}></Route>
        <Route path='/admin-dash/profile' element={<AProfilePage/>}></Route>

        <Route path='/accountant-dash' element={<AccountantDashboard/>}/>
        <Route path='/marketing-manager-dash' element={<MarketingMngrDashboard/>}/>
        <Route path='/stock-manager-dash' element={<StockMngrDashboard/>}/>
        <Route path='/deliveryman-dash' element={<DeliverymanDashboard/>}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App
