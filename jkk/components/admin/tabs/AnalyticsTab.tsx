
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, TrendingUp, Users, Wallet } from 'lucide-react';

export const AnalyticsTab = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Analíticas Avanzadas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-900/20 border border-blue-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Operaciones Diarias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">1,247</div>
            <p className="text-sm text-gray-400">Trades ejecutados hoy</p>
            <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-3/4 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-900/20 border border-green-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">94.2%</div>
            <p className="text-sm text-gray-400">Uptime del sistema</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Satisfacción</span>
                <span className="text-green-400">97.8%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tiempo respuesta</span>
                <span className="text-blue-400">1.2s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-900/20 border border-purple-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">12.4%</div>
            <p className="text-sm text-gray-400">Registro a primer depósito</p>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Esta semana</span>
                <span className="text-purple-400">+2.1%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-900/20 border border-orange-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-400" />
              Balance Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">€2.4M</div>
            <p className="text-sm text-gray-400">Fondos en plataforma</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Depósitos</span>
                <span className="text-green-400">€189K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Retiros</span>
                <span className="text-orange-400">€67K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
