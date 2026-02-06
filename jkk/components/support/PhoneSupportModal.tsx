
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Copy, Clock, User } from "lucide-react";

interface PhoneSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyPhoneNumber: () => void;
}

const PhoneSupportModal = ({ open, onOpenChange, onCopyPhoneNumber }: PhoneSupportModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md bg-gradient-to-br from-[#1e2139] to-[#2a2d47] border-gray-600/50 text-white">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3 text-xl">
          <Phone className="w-6 h-6 text-orange-400" />
          Línea Directa VIP
        </DialogTitle>
        <DialogDescription className="text-center text-sm text-gray-400 pt-1">
          Conecta directamente con nuestros especialistas
        </DialogDescription>
      </DialogHeader>
      <div className="text-center space-y-6 pt-4">
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-400/30 rounded-2xl p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Línea VIP 24/7</h3>
          <p className="text-gray-300 mb-4">Atención inmediata sin esperas</p>
          <div className="text-3xl font-bold text-orange-400 mb-2 font-mono">+1 (555) 123-4567</div>
          <div className="flex items-center justify-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>5 especialistas disponibles ahora</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-3">
            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-blue-400 font-semibold">Sin esperas</div>
            <div className="text-gray-400 text-xs">Conexión inmediata</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-xl p-3">
            <User className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <div className="text-green-400 font-semibold">Especialistas</div>
            <div className="text-gray-400 text-xs">Certificados</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={onCopyPhoneNumber} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex items-center gap-2 font-semibold">
            <Copy className="w-4 h-4"/> 📞 Copiar Número
          </Button>
          <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/30">
            📱 Solicitar Llamada
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default PhoneSupportModal;
