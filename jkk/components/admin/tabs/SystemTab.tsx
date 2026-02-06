
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Activity } from "lucide-react";

export const SystemTab = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Monitor del Sistema</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Servidores y Servicios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white">API Principal</span>
              </div>
              <Badge className="bg-green-600/30 text-green-400">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white">Base de Datos</span>
              </div>
              <Badge className="bg-green-600/30 text-green-400">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-white">Servicio de Email</span>
              </div>
              <Badge className="bg-yellow-600/30 text-yellow-400">Degradado</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white">CDN</span>
              </div>
              <Badge className="bg-green-600/30 text-green-400">Online</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Base de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Conexiones activas</span>
                <span className="text-white font-semibold">247/500</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '49%' }}></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Espacio utilizado</span>
                <span className="text-white font-semibold">1.2TB/2TB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-xs text-gray-400">Disponibilidad</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">15ms</div>
                <div className="text-xs text-gray-400">Latencia</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Logs del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <span className="text-gray-400">[2024-06-15 10:30:15]</span>
              <span>INFO: Sistema iniciado correctamente</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <span className="text-gray-400">[2024-06-15 10:45:22]</span>
              <span>DEBUG: Cache actualizado - usuarios activos</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-gray-400">[2024-06-15 11:12:08]</span>
              <span>WARN: Uso de memoria alto en servidor-02</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <span className="text-gray-400">[2024-06-15 11:30:45]</span>
              <span>INFO: Backup diario completado exitosamente</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <span className="text-gray-400">[2024-06-15 11:45:12]</span>
              <span>INFO: 1,247 transacciones procesadas en la última hora</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
