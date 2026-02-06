
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, User, Trophy, DollarSign, Database, Eye, 
  CheckCircle, AlertTriangle, Clock, ArrowRight, Sparkles
} from "lucide-react";

export const AdminActivityFeed = () => {
  const recentActivities = [
    { 
      type: "user", 
      message: "Nuevo usuario registrado", 
      user: "Juan Pérez",
      time: "Hace 2 min", 
      icon: User,
      status: "success",
      color: "from-green-500 to-emerald-500"
    },
    { 
      type: "tournament", 
      message: "Torneo finalizado", 
      user: "Sistema",
      time: "Hace 5 min", 
      icon: Trophy,
      status: "completed",
      color: "from-purple-500 to-pink-500"
    },
    { 
      type: "transaction", 
      message: "Depósito procesado", 
      user: "María López",
      time: "Hace 8 min", 
      icon: DollarSign,
      status: "success",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      type: "system", 
      message: "Backup completado", 
      user: "Sistema",
      time: "Hace 15 min", 
      icon: Database,
      status: "completed",
      color: "from-orange-500 to-red-500"
    },
    { 
      type: "alert", 
      message: "Límite de trading alcanzado", 
      user: "Carlos Rivera",
      time: "Hace 18 min", 
      icon: AlertTriangle,
      status: "warning",
      color: "from-yellow-500 to-orange-500"
    },
    { 
      type: "user", 
      message: "Verificación completada", 
      user: "Ana García",
      time: "Hace 22 min", 
      icon: CheckCircle,
      status: "success",
      color: "from-green-500 to-teal-500"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Exitoso</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Completado</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Alerta</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Info</Badge>;
    }
  };

  return (
    <Card className="bg-gray-900/20 border border-gray-700/30 backdrop-blur-md mb-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-xl">
            <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
            Actividad en Tiempo Real
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span className="text-sm text-green-400 font-medium">En Vivo</span>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
              <Eye className="w-4 h-4 mr-2" />
              Ver Todo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {recentActivities.map((activity, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group border border-gray-700/30 hover:border-gray-600/50"
            >
              <div className={`p-3 rounded-full bg-gradient-to-br ${activity.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                <activity.icon className="w-5 h-5 text-white group-hover:animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium truncate">{activity.message}</p>
                  {getStatusBadge(activity.status)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Por: {activity.user}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
