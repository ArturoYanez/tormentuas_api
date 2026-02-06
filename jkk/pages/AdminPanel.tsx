
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, DollarSign, Settings, BarChart3, Users, 
  Server, TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as UserType, Tournament, Transaction } from "@/components/admin/types";
import { UsersTab } from "@/components/admin/UsersTab";
import { TournamentFormValues } from "@/components/admin/TournamentForm";
import { DashboardTab } from "@/components/admin/tabs/DashboardTab";
import { TournamentsTab } from "@/components/admin/tabs/TournamentsTab";
import { TransactionsTab } from "@/components/admin/tabs/TransactionsTab";
import { AnalyticsTab } from "@/components/admin/tabs/AnalyticsTab";
import { SystemTab } from "@/components/admin/tabs/SystemTab";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminData } from "@/hooks/useAdminData";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState(3);
  const { toast } = useToast();
  
  const {
    users,
    setUsers,
    tournaments,
    setTournaments,
    transactions,
    setTransactions,
    handleUserSubmit,
    handleSuspendUser,
    handleTournamentAction,
    handleTournamentCreate
  } = useAdminData();

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: BarChart3 },
    { value: "users", label: "Usuarios", icon: Users },
    { value: "tournaments", label: "Torneos", icon: Trophy },
    { value: "transactions", label: "Transacciones", icon: DollarSign },
    { value: "analytics", label: "Analíticas", icon: TrendingUp },
    { value: "system", label: "Sistema", icon: Server },
    { value: "settings", label: "Configuración", icon: Settings }
  ];

  return (
    <AdminLayout>
      <AdminHeader notifications={notifications} />
      <AdminQuickActions />
      <AdminActivityFeed />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-7 bg-gray-900/30 mb-8 p-2 rounded-2xl border border-gray-700/30 backdrop-blur-md shadow-2xl">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/70 data-[state=active]:to-blue-600/70 data-[state=active]:text-white text-gray-400 transition-all duration-300 rounded-xl group hover:bg-gray-800/50 hover:shadow-lg"
            >
              <tab.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="animate-fade-in">
          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="users" className="animate-fade-in">
            <UsersTab users={users} handleUserSubmit={handleUserSubmit} handleSuspendUser={handleSuspendUser} />
          </TabsContent>

          <TabsContent value="tournaments" className="animate-fade-in">
            <TournamentsTab
              tournaments={tournaments}
              onTournamentCreate={handleTournamentCreate}
              onTournamentAction={handleTournamentAction}
            />
          </TabsContent>

          <TabsContent value="transactions" className="animate-fade-in">
            <TransactionsTab transactions={transactions} />
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="system" className="animate-fade-in">
            <SystemTab />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <SettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminPanel;
