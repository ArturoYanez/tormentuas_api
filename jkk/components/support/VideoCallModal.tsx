
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video } from "lucide-react";

interface VideoCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VideoCallModal = ({ open, onOpenChange }: VideoCallModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md bg-gradient-to-br from-[#1e2139] to-[#2a2d47] border-gray-600/50 text-white">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3 text-xl">
          <Video className="w-6 h-6 text-purple-400" />
          Videollamada VIP
        </DialogTitle>
      </DialogHeader>
      <div className="text-center space-y-6 pt-4">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-2xl p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Conectando...</h3>
          <p className="text-gray-300 mb-4">Preparando tu sesión VIP con pantalla compartida</p>
          <div className="animate-spin w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full mx-auto"></div>
        </div>
        <p className="text-gray-400 text-sm">Te conectaremos con un especialista en unos segundos</p>
      </div>
    </DialogContent>
  </Dialog>
);

export default VideoCallModal;
