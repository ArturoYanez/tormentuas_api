
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Shield, RefreshCw, Bell, ChevronRight, User, Settings, LogOut,
  Activity, ArrowUp, ArrowDown, Users, DollarSign, Trophy, Crown, Sparkles
} from "lucide-react";

interface AdminHeaderProps {
  notifications: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ notifications }) => {
  const quickStats = [
    { label: "Usuarios Activos", value: "2,847", change: "+12%", trend: "up", icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Ingresos Hoy", value: "€45,230", change: "+8.2%", trend: "up", icon: DollarSign, color: "from-green-500 to-emerald-500" },
    { label: "Torneos Activos", value: "12", change: "+3", trend: "up", icon: Trophy, color: "from-purple-500 to-pink-500" },
    { label: "Sistema", value: "99.9%", change: "Óptimo", trend: "stable", icon: Activity, color: "from-orange-500 to-red-500" }
  ];

  return (
    <header className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-700/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl border border-purple-500/30 backdrop-blur-md overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 animate-pulse"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping"></div>
            <Crown className="w-10 h-10 text-purple-400 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="font-black text-4xl md:text-5xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Admin Central
            </h1>
            <div className="text-sm text-gray-400 mt-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sistema Operativo</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span>Control Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats in header */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
          {quickStats.map((stat, index) => (
            <Card 
              key={stat.label} 
              className={`bg-gradient-to-br ${stat.color} bg-opacity-10 border-0 backdrop-blur-md hover:scale-105 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:shadow-purple-500/20`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === "up" && <ArrowUp className="w-3 h-3 text-green-400" />}
                      {stat.trend === "down" && <ArrowDown className="w-3 h-3 text-red-400" />}
                      <span className={`text-xs ${stat.trend === "up" ? "text-green-400" : stat.trend === "down" ? "text-red-400" : "text-gray-400"}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <stat.icon className="w-8 h-8 text-white/70 group-hover:text-white transition-colors group-hover:scale-110 duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced action buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 backdrop-blur-sm group hover:shadow-lg hover:shadow-purple-500/25">
            <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Actualizar
          </Button>
          
          <div className="relative">
            <Button variant="outline" size="icon" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
              <Bell className="w-5 h-5" />
            </Button>
            {notifications > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse shadow-lg">
                {notifications}
              </div>
            )}
          </div>

          <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25" onClick={() => window.location.href='/platform'}>
            <ChevronRight className="w-4 h-4 mr-2" />
            Ir a Plataforma
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-12 w-12 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-500/25">
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-gray-900/95 border-gray-700 text-white backdrop-blur-md shadow-2xl" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2 p-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Super Admin</p>
                      <p className="text-xs text-gray-400">admin@tradingplatform.com</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="hover:bg-gray-800/50 cursor-pointer group">
                <User className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-800/50 cursor-pointer group">
                <Settings className="mr-3 h-4 w-4 group-hover:rotate-90 transition-transform" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-800/50 cursor-pointer group">
                <Bell className="mr-3 h-4 w-4 group-hover:animate-pulse" />
                <span>Notificaciones</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="hover:!bg-red-500/20 hover:!text-red-400 cursor-pointer group">
                <LogOut className="mr-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
