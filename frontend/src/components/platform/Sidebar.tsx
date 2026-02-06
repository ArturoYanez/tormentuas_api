import { BarChart3, HelpCircle, Trophy, DollarSign, Wallet, User, History, Gift, Bell, GraduationCap, Users } from 'lucide-react';

type ViewType = 'trade' | 'tournaments' | 'market' | 'support' | 'wallet' | 'profile' | 'history' | 'bonuses' | 'notifications' | 'academy' | 'referrals';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  unreadNotifications?: number;
}

export default function Sidebar({ currentView, onChangeView, unreadNotifications = 3 }: SidebarProps) {
  const mainMenuItems = [
    { id: 'trade' as ViewType, icon: BarChart3, label: 'Trade' },
    { id: 'tournaments' as ViewType, icon: Trophy, label: 'Torneos', badge: 9 },
    { id: 'market' as ViewType, icon: DollarSign, label: 'Market' },
    { id: 'wallet' as ViewType, icon: Wallet, label: 'Billetera' },
    { id: 'history' as ViewType, icon: History, label: 'Historial' },
  ];

  const secondaryMenuItems = [
    { id: 'bonuses' as ViewType, icon: Gift, label: 'Bonos' },
    { id: 'referrals' as ViewType, icon: Users, label: 'Referidos' },
    { id: 'academy' as ViewType, icon: GraduationCap, label: 'Academia' },
  ];

  const bottomMenuItems = [
    { id: 'notifications' as ViewType, icon: Bell, label: 'Alertas', badge: unreadNotifications },
    { id: 'profile' as ViewType, icon: User, label: 'Mi Cuenta' },
    { id: 'support' as ViewType, icon: HelpCircle, label: 'Soporte' },
  ];

  const mobileMenuItems = [
    { id: 'trade' as ViewType, icon: BarChart3, label: 'Trade' },
    { id: 'wallet' as ViewType, icon: Wallet, label: 'Billetera' },
    { id: 'tournaments' as ViewType, icon: Trophy, label: 'Torneos', badge: 9 },
    { id: 'profile' as ViewType, icon: User, label: 'Cuenta' },
    { id: 'support' as ViewType, icon: HelpCircle, label: 'Soporte' },
  ];

  const renderMenuItem = (item: typeof mainMenuItems[0], compact = false) => {
    const isActive = currentView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onChangeView(item.id)}
        className={`w-full py-2 flex flex-col items-center gap-0.5 transition-all relative ${
          isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-500 rounded-r" />
        )}
        <div className={`relative p-1.5 rounded-lg transition-all ${
          isActive ? 'bg-purple-600' : 'bg-[#1a1625] hover:bg-[#1f1a2e]'
        }`}>
          <item.icon className="w-4 h-4" />
          {item.badge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] min-w-[12px] h-[12px] px-0.5 rounded-full flex items-center justify-center font-bold">
              {item.badge > 9 ? '9+' : item.badge}
            </span>
          )}
        </div>
        {!compact && (
          <span className={`text-[7px] font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
            {item.label.toUpperCase()}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-[44px] bottom-0 w-16 bg-[#13111c] border-r border-purple-900/20 flex-col items-center py-1 z-40">
        {/* Main Menu */}
        <div className="flex-1 w-full space-y-0.5">
          {mainMenuItems.map(item => renderMenuItem(item))}
          
          {/* Divider */}
          <div className="mx-3 my-2 border-t border-purple-900/30" />
          
          {secondaryMenuItems.map(item => renderMenuItem(item))}
        </div>

        {/* Bottom Menu */}
        <div className="w-full border-t border-purple-900/30 pt-1 space-y-0.5">
          {bottomMenuItems.map(item => renderMenuItem(item))}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#13111c] border-t border-purple-900/30 z-50 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {mobileMenuItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl transition-all relative ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-purple-500 rounded-full" />
                )}
                <div className={`relative p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-purple-600 shadow-lg shadow-purple-500/30 scale-105' : 'bg-transparent'
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center font-bold border border-[#13111c]">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[8px] font-medium ${isActive ? 'text-purple-400' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center pb-1">
          <div className="w-28 h-0.5 bg-gray-700 rounded-full" />
        </div>
      </nav>
    </>
  );
}
