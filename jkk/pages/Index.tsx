
import { PlusCircle, MinusCircle, Cloud, BarChart3, HelpCircle, User, Trophy, DollarSign, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import TradeSection from "@/components/sections/TradeSection";
import SupportSection from "@/components/sections/SupportSection";
import AccountSection from "@/components/sections/AccountSection";
import TournamentsSection from "@/components/sections/TournamentsSection";
import MarketSection from "@/components/sections/MarketSection";
import MoreSection from "@/components/sections/MoreSection";
import PaymentMethodsModal from "@/components/deposit/PaymentMethodsModal";
import PaymentProcessModal from "@/components/deposit/PaymentProcessModal";
import PaymentSuccessModal from "@/components/deposit/PaymentSuccessModal";
import WithdrawMethodsModal from "@/components/withdraw/WithdrawMethodsModal";
import WithdrawProcessModal from "@/components/withdraw/WithdrawProcessModal";
import WithdrawSuccessModal from "@/components/withdraw/WithdrawSuccessModal";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";
import AccountDropdown from "@/components/account/AccountDropdown";
import { PaymentMethod } from "@/components/deposit/PaymentMethodsModal";
import { WithdrawMethod } from "@/components/withdraw/WithdrawMethodsModal";
import { toast } from "@/hooks/use-toast";
import KYCAlert from "@/components/kyc/KYCAlert";
import KYCModal from "@/components/kyc/KYCModal";
import { useKYC } from "@/hooks/useKYC";

const Index = () => {
  const [balance, setBalance] = useState(10000.00);
  const [accountType, setAccountType] = useState<'live' | 'demo'>('demo');
  const [activeSection, setActiveSection] = useState("trade");
  
  // KYC Integration
  const {
    user,
    showKYCAlert,
    showKYCModal,
    startKYCProcess,
    dismissKYCAlert,
    completeKYC,
    setShowKYCModal
  } = useKYC();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showPaymentProcess, setShowPaymentProcess] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [successAmount, setSuccessAmount] = useState(0);
  const [hasDeposited, setHasDeposited] = useState(false);
  
  // Withdraw states
  const [showWithdrawMethods, setShowWithdrawMethods] = useState(false);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<WithdrawMethod | null>(null);
  const [showWithdrawProcess, setShowWithdrawProcess] = useState(false);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [withdrawSuccessAmount, setWithdrawSuccessAmount] = useState(0);

  const menuItems = [
    { 
      id: "trade", 
      icon: BarChart3, 
      label: "TRADE", 
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    { 
      id: "support", 
      icon: HelpCircle, 
      label: "SUPPORT", 
      color: "from-gray-600 to-gray-700",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    { 
      id: "account", 
      icon: User, 
      label: "ACCOUNT", 
      color: "from-gray-600 to-gray-700",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    { 
      id: "tournaments", 
      icon: Trophy, 
      label: "TOURNAMENTS", 
      color: "from-yellow-600 to-orange-600",
      hoverColor: "hover:from-yellow-700 hover:to-orange-700",
      badge: "9"
    },
    { 
      id: "market", 
      icon: DollarSign, 
      label: "MARKET", 
      color: "from-indigo-600 to-purple-600",
      hoverColor: "hover:from-indigo-700 hover:to-purple-700"
    },
    { 
      id: "more", 
      icon: MoreHorizontal, 
      label: "MORE", 
      color: "from-gray-600 to-gray-700",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    }
  ];

  const handleNavigateToTrading = () => {
    setActiveSection("trade");
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "trade":
        return <TradeSection />;
      case "support":
        return <SupportSection />;
      case "account":
        return <AccountSection />;
      case "tournaments":
        return <TournamentsSection onNavigateToTrading={handleNavigateToTrading} />;
      case "market":
        return <MarketSection />;
      case "more":
        return <MoreSection />;
      default:
        return <TradeSection />;
    }
  };

  const handleDepositClick = () => {
    setShowPaymentMethods(true);
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethods(false);
    setShowPaymentProcess(true);
  };

  const handlePaymentSuccess = (amount: number) => {
    setSuccessAmount(amount);
    setBalance(prevBalance => prevBalance + amount);
    setShowPaymentProcess(false);
    setShowPaymentSuccess(true);
    setHasDeposited(true);
    
    toast({
      title: "Deposit Successful!",
      description: `€${amount.toFixed(2)} has been added to your account`,
    });
  };

  const handleBackToPaymentMethods = () => {
    setShowPaymentProcess(false);
    setShowPaymentMethods(true);
  };

  // Withdraw handlers
  const handleWithdrawClick = () => {
    setShowWithdrawMethods(true);
  };

  const handleSelectWithdrawMethod = (method: WithdrawMethod) => {
    setSelectedWithdrawMethod(method);
    setShowWithdrawMethods(false);
    setShowWithdrawProcess(true);
  };

  const handleWithdrawSuccess = (amount: number) => {
    setWithdrawSuccessAmount(amount);
    setBalance(prevBalance => prevBalance - amount);
    setShowWithdrawProcess(false);
    setShowWithdrawSuccess(true);
    
    toast({
      title: "¡Retiro Procesado!",
      description: `€${amount.toFixed(2)} ha sido enviado a tu wallet.`,
    });
  };

  const handleBackToWithdrawMethods = () => {
    setShowWithdrawProcess(false);
    setShowWithdrawMethods(true);
  };

  const handleAccountTypeChange = (type: 'live' | 'demo') => {
    setAccountType(type);
    setBalance(type === 'demo' ? 10000.00 : 0.35);
    toast({
      title: `Switched to ${type === 'live' ? 'Live' : 'Demo'} Account`,
      description: `You are now using your ${type} account`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      {/* Header Superior sticky bien posicionado */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0a0a1a]/80 via-[#1a1a2e]/80 to-[#0a0a1a]/80 px-4 md:px-6 py-3 flex justify-between items-center border-b border-gray-700/50 shadow-2xl backdrop-blur-xl h-16">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-indigo-900/10 opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        
        {/* Left section - Logo y Marca */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/30">
                <Cloud className="text-white w-6 h-6" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-[#0a0a1a] shadow-lg animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-2xl bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent tracking-tight">
                  TORMENTO
                </span>
                <div className="px-2 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-400/30">
                  <span className="text-orange-400 text-xs font-bold">PRO</span>
                </div>
              </div>
              <div className="text-gray-400 text-xs font-medium tracking-wider">TRADING PLATFORM</div>
            </div>
          </div>
        </div>

        {/* Right section - Acciones y Cuenta */}
        <div className="flex items-center gap-2 md:gap-4 relative z-10 flex-nowrap">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Account Balance Dropdown */}
          <AccountDropdown 
            balance={balance}
            accountType={accountType}
            onAccountTypeChange={handleAccountTypeChange}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleDepositClick}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl transform hover:scale-105 transition-all duration-300 px-4 py-2 rounded-lg border border-purple-400/30 font-bold text-sm"
            >
              <PlusCircle size={16} className="mr-2" />
              Deposit
            </Button>
            
            <Button 
              onClick={handleWithdrawClick}
              className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white shadow-xl transform hover:scale-105 transition-all duration-300 px-4 py-2 rounded-lg border border-orange-400/30 font-bold text-sm"
            >
              <MinusCircle size={16} className="mr-2" />
              Withdraw
            </Button>
            
            <button className="relative p-2 bg-gradient-to-br from-gray-700/40 to-gray-800/40 rounded-lg border border-gray-600/50 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm hover:bg-gradient-to-br hover:from-blue-600/20 hover:to-purple-600/20 group">
              <User className="text-gray-300 group-hover:text-white transition-colors w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content con rebalanceo responsivo */}
      <div className="flex flex-1 pt-16 min-h-0 w-full">
        {/* Sidebar responsivo */}
        <aside className="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-16 md:w-20 bg-gradient-to-b from-[#1a1d2e] to-[#10121a] flex flex-col items-center gap-1 border-r border-gray-700/50 shadow-2xl">
          <div className="flex-1 flex flex-col items-center gap-1 w-full overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <div 
                  key={item.id}
                  className={`relative group w-full py-4 flex justify-center items-center cursor-pointer transition-all duration-300 overflow-hidden ${
                    isActive 
                      ? `text-white` 
                      : `text-gray-400 hover:text-white hover:bg-blue-600/10`
                  }`}
                  onClick={() => setActiveSection(item.id)}
                  title={item.label}
                >
                  <div className={`absolute left-0 top-0 h-full w-1 transition-all duration-300 ${isActive ? 'bg-blue-400' : 'bg-transparent group-hover:bg-blue-500/50'}`}></div>
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20`}></div>
                  )}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'bg-white/20 scale-110' : `bg-gray-800/50 group-hover:scale-110 group-hover:bg-white/10`
                    }`}>
                      <IconComponent className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="text-xs mt-2 font-bold text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg font-bold transition-transform duration-300 group-hover:scale-110">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main dynamic content */}
        <main className="flex-1 min-w-0 flex flex-col bg-gradient-to-br from-[#1a1a24] to-[#12131b] ml-16 md:ml-20">
          {/* Renderiza la sección activa */}
          {renderActiveSection()}
        </main>
      </div>

      {/* Modals de Pago, éxito, etc */}
      <PaymentMethodsModal
        isOpen={showPaymentMethods}
        onClose={() => setShowPaymentMethods(false)}
        onSelectMethod={handleSelectPaymentMethod}
      />
      
      <PaymentProcessModal
        isOpen={showPaymentProcess}
        onClose={() => setShowPaymentProcess(false)}
        onBack={handleBackToPaymentMethods}
        selectedMethod={selectedPaymentMethod}
        onPaymentSuccess={handlePaymentSuccess}
      />
      
      <PaymentSuccessModal
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        amount={successAmount}
      />

      {/* Withdraw Modals */}
      <WithdrawMethodsModal
        isOpen={showWithdrawMethods}
        onClose={() => setShowWithdrawMethods(false)}
        onSelectMethod={handleSelectWithdrawMethod}
      />

      <WithdrawProcessModal
        isOpen={showWithdrawProcess}
        onClose={() => setShowWithdrawProcess(false)}
        onBack={handleBackToWithdrawMethods}
        selectedMethod={selectedWithdrawMethod}
        onWithdrawSuccess={handleWithdrawSuccess}
        currentBalance={balance}
      />

      <WithdrawSuccessModal
        isOpen={showWithdrawSuccess}
        onClose={() => setShowWithdrawSuccess(false)}
        amount={withdrawSuccessAmount}
      />

      {/* KYC Components */}
      <KYCAlert
        isVisible={showKYCAlert}
        onStartKYC={startKYCProcess}
        onDismiss={dismissKYCAlert}
      />
      
      <KYCModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onComplete={completeKYC}
      />
    </div>
  );
};

export default Index;
