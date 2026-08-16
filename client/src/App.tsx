import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import Home from "./pages/Home";
import CustomerServiceWidget from "./components/CustomerServiceWidget";
import RoleSwitcher from "./components/RoleSwitcher";
import { useAppContext } from "./_core/hooks/useAppContext";

import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Tracking from "./pages/Tracking";
import MerchantApply from "./pages/merchant/MerchantApply";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrdersMassShip from "./pages/admin/AdminOrdersMassShip";
import AdminOrdersHandover from "./pages/admin/AdminOrdersHandover";
import AdminOrdersRefunds from "./pages/admin/AdminOrdersRefunds";
import AdminLogisticsSettings from "./pages/admin/AdminLogisticsSettings";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductsAdd from "./pages/admin/AdminProductsAdd";
import AdminProductsStandard from "./pages/admin/AdminProductsStandard";
import AdminProductsAI from "./pages/admin/AdminProductsAI";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminMarketingBidding from "./pages/admin/AdminMarketingBidding";
import AdminMarketingAds from "./pages/admin/AdminMarketingAds";
import AdminMarketingAffiliate from "./pages/admin/AdminMarketingAffiliate";
import AdminMarketingLiveData from "./pages/admin/AdminMarketingLiveData";
import AdminMarketingDiscounts from "./pages/admin/AdminMarketingDiscounts";
import AdminMarketingFlashSale from "./pages/admin/AdminMarketingFlashSale";
import AdminMarketingCoupons from "./pages/admin/AdminMarketingCoupons";
import AdminMarketingCampaigns from "./pages/admin/AdminMarketingCampaigns";
import AdminFinanceIncome from "./pages/admin/AdminFinanceIncome";
import AdminFinanceBalance from "./pages/admin/AdminFinanceBalance";
import AdminFinanceBank from "./pages/admin/AdminFinanceBank";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProcurement from "./pages/admin/AdminProcurement";
import AdminChat from "./pages/admin/AdminChat";
import AdminStoreSettings from "./pages/admin/AdminStoreSettings";
import AdminStoreIntro from "./pages/admin/AdminStoreIntro";
import AdminStoreDecoration from "./pages/admin/AdminStoreDecoration";
import AdminExchangeRates from "./pages/admin/AdminExchangeRates";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminFinance from "./pages/admin/AdminFinance";

// CS Pages
import CSOrders from "./pages/cs/CSOrders";
import CSUsers from "./pages/cs/CSUsers";
import CSChatMonitor from "./pages/cs/CSChatMonitor";
import CSProfile from "./pages/cs/CSProfile";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerFinance from "./pages/manager/ManagerFinance";
import ManagerVendors from "./pages/manager/ManagerVendors";
import ManagerSettings from "./pages/manager/ManagerSettings";
import ManagerUsers from "./pages/manager/ManagerUsers";
import ManagerCampaigns from "./pages/manager/ManagerCampaigns";
import ManagerStaff from "./pages/manager/ManagerStaff";
import ManagerProfile from "./pages/manager/ManagerProfile";
import ManagerAudit from "./pages/manager/ManagerAudit";
import ManagerProducts from "./pages/manager/ManagerProducts";

// Auth Pages
import Auth from "./pages/auth/Auth";
import Redirect from "./pages/auth/Redirect";

function ScrollToTop() {
  const [pathname] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const { currentUser } = useAppContext();
  const [location] = useLocation();

  // Redirect to RoleSwitcher logic...
  const isBuyerRoute = ["/", "/cart", "/checkout", "/account", "/orders", "/product/"].some(p => location === p || location.startsWith("/product/") || location.startsWith("/tracking/")) || location === "/auth" || location === "/redirect";

  return (
    <>
      <ScrollToTop />
      <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/redirect" component={Redirect} />
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/account" component={Account} />
      <Route path="/orders" component={Orders} />
      <Route path="/tracking/:id" component={Tracking} />
      <Route path="/merchant-apply" component={MerchantApply} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/orders/mass-ship" component={AdminOrdersMassShip} />
      <Route path="/admin/orders/handover" component={AdminOrdersHandover} />
      <Route path="/admin/orders/refunds" component={AdminOrdersRefunds} />
      <Route path="/admin/orders/logistics" component={AdminLogisticsSettings} />
      <Route path="/admin/procurement" component={AdminProcurement} />
      <Route path="/admin/finance" component={AdminFinance} />
      <Route path="/admin/finance/income" component={AdminFinanceIncome} />
      <Route path="/admin/finance/balance" component={AdminFinanceBalance} />
      <Route path="/admin/finance/bank" component={AdminFinanceBank} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/add" component={AdminProductsAdd} />
      <Route path="/admin/products/standard" component={AdminProductsStandard} />
      <Route path="/admin/products/ai" component={AdminProductsAI} />
      <Route path="/admin/marketing" component={AdminMarketing} />
      <Route path="/admin/marketing/bidding" component={AdminMarketingBidding} />
      <Route path="/admin/marketing/ads" component={AdminMarketingAds} />
      <Route path="/admin/marketing/affiliate" component={AdminMarketingAffiliate} />
      <Route path="/admin/marketing/live-data" component={AdminMarketingLiveData} />
      <Route path="/admin/marketing/discounts" component={AdminMarketingDiscounts} />
      <Route path="/admin/marketing/flash-sale" component={AdminMarketingFlashSale} />
      <Route path="/admin/marketing/coupons" component={AdminMarketingCoupons} />
      <Route path="/admin/marketing/campaigns" component={AdminMarketingCampaigns} />
      <Route path="/admin/chat" component={AdminChat} />
      <Route path="/admin/store/settings" component={AdminStoreSettings} />
      <Route path="/admin/store/intro" component={AdminStoreIntro} />
      <Route path="/admin/store/decoration" component={AdminStoreDecoration} />
      <Route path="/admin/exchange-rates" component={AdminExchangeRates} />
      <Route path="/admin/campaigns" component={AdminCampaigns} />
      <Route path="/admin" component={() => {
        const [, setLocation] = useLocation();
        useEffect(() => {
          setLocation("/admin/orders");
        }, [setLocation]);
        return null;
      }} />

      {/* Manager Routes */}
      <Route path="/manager/dashboard" component={ManagerDashboard} />
      <Route path="/manager/products" component={ManagerProducts} />
      <Route path="/manager/finance" component={ManagerFinance} />
      <Route path="/manager/vendors" component={ManagerVendors} />
      <Route path="/manager/settings" component={ManagerSettings} />
      <Route path="/manager/users" component={ManagerUsers} />
      <Route path="/manager/campaigns" component={ManagerCampaigns} />
      <Route path="/manager/staff" component={ManagerStaff} />
      <Route path="/manager/profile" component={ManagerProfile} />
      <Route path="/manager/audit" component={ManagerAudit} />
      <Route path="/manager" component={() => {
        const [, setLocation] = useLocation();
        useEffect(() => {
          setLocation("/manager/dashboard");
        }, [setLocation]);
        return null;
      }} />

      {/* Customer Service Routes */}
      <Route path="/cs/orders" component={CSOrders} />
      <Route path="/cs/users" component={CSUsers} />
      <Route path="/cs/chat" component={CSChatMonitor} />
      <Route path="/cs/profile" component={CSProfile} />
      <Route path="/cs" component={() => {
        const [, setLocation] = useLocation();
        useEffect(() => {
          setLocation("/cs/orders");
        }, [setLocation]);
        return null;
      }} />

      <Route>
        <div className="flex h-screen items-center justify-center">
          <h1 className="text-2xl font-bold">404 - 页面未找到</h1>
        </div>
      </Route>
      </Switch>
      {isBuyerRoute && <CustomerServiceWidget />}
      <RoleSwitcher />
    </>
  );
}

export default App;
