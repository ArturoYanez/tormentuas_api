
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { 
  Trophy, UserCheck, DollarSign, Settings, BarChart3, Users, 
  Shield, Bell, AlertCircle, CheckCircle, XCircle, 
  Clock, Wallet, TrendingUp, Activity,
  RefreshCw, Server,
  Database, ArrowUpRight, Globe, LogOut
} from "lucide-react";

// Chart data
const userGrowthData = [
  { month: "Ene", users: 120, active: 98 },
  { month: "Feb", users: 180, active: 145 },
  { month: "Mar", users: 240, active: 198 },
  { month: "Abr", users: 320, active: 267 },
  { month: "May", users: 450, active: 389 },
  { month: "Jun", users: 620, active: 534 }
];

const revenueData = [
  { month: "Ene", revenue: 12000, profit: 8400 },
  { month: "Feb", revenue: 18000, profit: 12600 },
  { month: "Mar", revenue: 24000, profit: 16800 },
  { month: "Abr", revenue: 32000, profit: 22400 },
  { month: "May", revenue: 45000, profit: 31500 },
  { month: "Jun", revenue: 62000, profit: 43400 }
];

const deviceData = [
  { name: "Desktop", value: 65, color: "#8b5cf6" },
  { name: "Mobile", value: 30, color: "#06b6d4" },
  { name: "Tablet", value: 5, color: "#10b981" }
];


export const DashboardTab = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/30 border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Usuarios Activos</CardTitle>
            <Users className="w-5 h-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">2,847</div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400">+12%</span>
              <span className="text-gray-400">desde el mes pasado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/30 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Torneos Activos</CardTitle>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">12</div>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400">3 finalizando hoy</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/30 border border-gray-700/50 hover:border-green-400/50 transition-all duration-300 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ingresos Diarios</CardTitle>
            <DollarSign className="w-5 h-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">€145,230</div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400">+8.5%</span>
              <span className="text-gray-400">desde ayer</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/30 border border-gray-700/50 hover:border-red-400/50 transition-all duration-300 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Alertas Críticas</CardTitle>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">3</div>
            <div className="flex items-center gap-1 text-xs">
              <Bell className="w-3 h-3 text-red-400" />
              <span className="text-red-400">Requieren atención inmediata</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Crecimiento de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ users: { label: "Usuarios", color: "#8b5cf6" }, active: { label: "Activos", color: "#06b6d4" } }} className="h-[300px]">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="active" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Ingresos y Ganancias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: "Ingresos", color: "#10b981" }, profit: { label: "Ganancias", color: "#059669" } }} className="h-[300px]">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Real-time monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Actividad en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <UserCheck className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Nuevo registro</p>
                <p className="text-xs text-gray-400">Carlos M. - hace 30s</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Depósito €500</p>
                <p className="text-xs text-gray-400">Ana G. - hace 1min</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Torneo iniciado</p>
                <p className="text-xs text-gray-400">EUR/USD Daily - hace 2min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Dispositivos de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ desktop: { label: "Desktop", color: "#8b5cf6" }, mobile: { label: "Mobile", color: "#06b6d4" }, tablet: { label: "Tablet", color: "#10b981" } }} className="h-[200px]">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-green-400" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">CPU</span>
              <span className="text-green-400 font-semibold">23%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Memoria</span>
              <span className="text-blue-400 font-semibold">45%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Base de Datos</span>
              <span className="text-green-400 font-semibold">Online</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">API Response</span>
              <span className="text-green-400 font-semibold">145ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
