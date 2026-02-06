
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const SettingsTab = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white">Configuración del Sistema</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Configuración General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Mantenimiento</Label>
                <p className="text-sm text-gray-400">Activar modo mantenimiento</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Nuevos Registros</Label>
                <p className="text-sm text-gray-400">Permitir nuevos usuarios</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Notificaciones</Label>
                <p className="text-sm text-gray-400">Enviar notificaciones push</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Límites y Comisiones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Depósito Mínimo (€)</Label>
              <Input className="bg-gray-900/50 border-gray-700 text-white" defaultValue="10" />
            </div>
            <div>
              <Label className="text-gray-300">Retiro Mínimo (€)</Label>
              <Input className="bg-gray-900/50 border-gray-700 text-white" defaultValue="20" />
            </div>
            <div>
              <Label className="text-gray-300">Comisión Depósito (%)</Label>
              <Input className="bg-gray-900/50 border-gray-700 text-white" defaultValue="1.5" />
            </div>
            <div>
              <Label className="text-gray-300">Comisión Retiro (%)</Label>
              <Input className="bg-gray-900/50 border-gray-700 text-white" defaultValue="2.0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Configuración de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Tiempo de Sesión (min)</Label>
              <Input className="bg-gray-900/50 border-gray-700 text-white" defaultValue="30" />
            </div>
            <div>
              <Label className="text-gray-300">Intentos de Login</Label>
              <Input className="bg-gray-900/50 border-gray-700 text-white" defaultValue="5" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Verificación 2FA</Label>
              <p className="text-sm text-gray-400">Requerir autenticación de dos factores</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Verificación KYC</Label>
              <p className="text-sm text-gray-400">Verificación obligatoria de identidad</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
