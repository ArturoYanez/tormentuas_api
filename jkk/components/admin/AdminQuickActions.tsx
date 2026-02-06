
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, Trophy, DollarSign, Mail, Shield, Zap,
  Activity, Database, Globe, MessageSquare, FileText, Calendar,
  Star, AlertTriangle, Plus, Download, Upload, Settings
} from "lucide-react";

export const AdminQuickActions = () => {
  const quickActions = [
    { 
      title: "Crear Usuario", 
      icon: UserPlus, 
      color: "from-blue-500 to-cyan-500",
      description: "Añadir nuevo usuario",
      action: () => console.log("Create user")
    },
    { 
      title: "Nuevo Torneo", 
      icon: Trophy, 
      color: "from-purple-500 to-pink-500",
      description: "Crear torneo",
      action: () => console.log("Create tournament")
    },
    { 
      title: "Procesar Pagos", 
      icon: DollarSign, 
      color: "from-green-500 to-emerald-500",
      description: "Gestionar transacciones",
      action: () => console.log("Process payments")
    },
    { 
      title: "Enviar Mensaje", 
      icon: Mail, 
      color: "from-orange-500 to-red-500",
      description: "Comunicación masiva",
      action: () => console.log("Send message")
    },
    { 
      title: "Backup Sistema", 
      icon: Database, 
      color: "from-indigo-500 to-purple-500",
      description: "Respaldo de datos",
      action: () => console.log("Backup system")
    },
    { 
      title: "Configurar API", 
      icon: Settings, 
      color: "from-pink-500 to-rose-500",
      description: "Ajustes de sistema",
      action: () => console.log("Configure API")
    }
  ];

  return (
    <Card className="bg-gray-900/20 border border-gray-700/30 backdrop-blur-md mb-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-xl">
          <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
          Acciones Rápidas
          <div className="ml-auto flex items-center gap-2">
            <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
              <span className="text-sm text-green-400 font-medium">Todo Operativo</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <div 
              key={action.title} 
              className={`relative p-4 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-10 border border-white/10 hover:scale-105 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-purple-500/20`}
              onClick={action.action}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full bg-gradient-to-br ${action.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6 text-white group-hover:animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{action.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{action.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
