import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Mail, Phone, MessageSquare, Shield, FileText, Camera } from "lucide-react";
import { KYCData } from "./KYCModal";

interface KYCReviewProps {
  kycData: KYCData;
  onComplete: () => void;
  onBack: () => void;
}

const KYCReview: React.FC<KYCReviewProps> = ({ kycData, onComplete, onBack }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "in-review":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "rejected":
        return "Rechazado";
      case "in-review":
        return "En Revisión";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">¡Verificación Enviada!</h3>
        <p className="text-gray-400">
          Hemos recibido todos tus documentos correctamente
        </p>
      </div>

      {/* Status Card */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Estado de Verificación
            </h4>
            <Badge className={getStatusColor(kycData.status)}>
              <Clock className="w-3 h-3 mr-1" />
              {getStatusText(kycData.status)}
            </Badge>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Documento enviado:</span>
              <div className="flex items-center gap-2 text-green-300">
                <FileText className="w-4 h-4" />
                <span>{kycData.documentType?.name}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Prueba de vida:</span>
              <div className="flex items-center gap-2 text-green-300">
                <Camera className="w-4 h-4" />
                <span>Completada</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tiempo estimado:</span>
              <span className="text-yellow-300 font-semibold">1-3 días hábiles</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <h4 className="font-bold text-blue-300 mb-4">¿Qué pasa ahora?</h4>
          <div className="space-y-4 text-sm text-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-semibold">Revisión de Documentos</p>
                <p className="text-blue-300/80">Nuestro equipo verificará la autenticidad de tus documentos</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-semibold">Análisis de Prueba de Vida</p>
                <p className="text-blue-300/80">Validaremos que la verificación biométrica sea auténtica</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-semibold">Notificación de Resultado</p>
                <p className="text-blue-300/80">Te contactaremos por correo con el resultado de la verificación</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Options */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <h4 className="font-bold text-white mb-4">¿Necesitas ayuda?</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="border-gray-600 hover:bg-gray-700/50 h-16 flex flex-col items-center justify-center space-y-1"
            >
              <Mail className="w-5 h-5" />
              <span className="text-xs">Email</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-600 hover:bg-gray-700/50 h-16 flex flex-col items-center justify-center space-y-1"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Chat</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-600 hover:bg-gray-700/50 h-16 flex flex-col items-center justify-center space-y-1"
            >
              <Phone className="w-5 h-5" />
              <span className="text-xs">Teléfono</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Messages */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h4 className="font-semibold text-white mb-2">Mensajes importantes:</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p><strong>Éxito de Envío:</strong> Documentos enviados con éxito para revisión.</p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p><strong>En Proceso:</strong> Tu verificación está siendo revisada por nuestro equipo.</p>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p><strong>Notificación:</strong> Te notificaremos por correo cuando la revisión esté completa.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-600 hover:bg-gray-700/50 rounded-xl"
        >
          Atrás
        </Button>
        
        <Button
          onClick={onComplete}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default KYCReview;