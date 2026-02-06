import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RotateCcw, CheckCircle, AlertTriangle, Upload, Lightbulb, Eye } from "lucide-react";
import { DocumentType } from "./KYCModal";
import { toast } from "@/hooks/use-toast";

interface DocumentCaptureProps {
  documentType: DocumentType;
  onCapture: (imageData: string) => void;
  onBack: () => void;
}

const DocumentCapture: React.FC<DocumentCaptureProps> = ({ documentType, onCapture, onBack }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [imageQuality, setImageQuality] = useState<"good" | "poor" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Cámara trasera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toast({
        title: "Error de Cámara",
        description: "No se pudo acceder a la cámara. Usa la opción de subir archivo.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (context) {
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
      
      // Simular análisis de calidad de imagen
      setTimeout(() => {
        const quality = Math.random() > 0.3 ? "good" : "poor";
        setImageQuality(quality);
        setIsCapturing(false);
        
        if (quality === "poor") {
          toast({
            title: "Calidad de Imagen Baja",
            description: "La imagen no es clara. Intenta con mejor iluminación.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "¡Excelente!",
            description: "Imagen capturada con buena calidad.",
          });
        }
      }, 1500);
    }
    
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Archivo muy grande",
          description: "El archivo debe ser menor a 10MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        
        // Simular análisis de calidad
        setTimeout(() => {
          const quality = Math.random() > 0.2 ? "good" : "poor";
          setImageQuality(quality);
          
          if (quality === "poor") {
            toast({
              title: "Calidad de Imagen Baja",
              description: "La imagen no es clara. Intenta con otra foto.",
              variant: "destructive",
            });
          }
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!capturedImage) return;
    
    setIsUploading(true);
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Documento Enviado",
      description: "Tu documento ha sido procesado exitosamente.",
    });
    
    onCapture(capturedImage);
    setIsUploading(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setImageQuality(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">Captura tu {documentType.name}</h3>
        <p className="text-gray-400">
          Asegúrate de que el documento esté completo y legible
        </p>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Consejos para una buena captura:
          </h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-200">
            <div className="space-y-2">
              <p>✓ Buena iluminación uniforme</p>
              <p>✓ Sin reflejos o sombras</p>
              <p>✓ Documento completo visible</p>
            </div>
            <div className="space-y-2">
              <p>✓ Texto completamente legible</p>
              <p>✓ Imagen enfocada y nítida</p>
              <p>✓ Sin objetos que tapen el documento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera/Upload Section */}
      {!capturedImage && (
        <div className="space-y-4">
          {showCamera ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-xl bg-gray-800"
              />
              <div className="absolute inset-0 border-4 border-dashed border-white/30 rounded-xl pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-2 left-2 right-2 text-center">
                    <p className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                      Posiciona tu {documentType.name} dentro del marco
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black hover:bg-gray-200 w-16 h-16 rounded-full p-0"
              >
                <Camera className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={startCamera}
                className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex flex-col items-center justify-center space-y-2 rounded-xl"
              >
                <Camera className="w-8 h-8" />
                <span className="font-semibold">Usar Cámara</span>
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-32 border-gray-600 hover:bg-gray-700/50 flex flex-col items-center justify-center space-y-2 rounded-xl"
              >
                <Upload className="w-8 h-8" />
                <span className="font-semibold">Subir Archivo</span>
              </Button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Documento capturado"
              className="w-full h-64 object-cover rounded-xl border-2 border-gray-600"
            />
            {imageQuality && (
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg flex items-center gap-2 ${
                imageQuality === "good"
                  ? "bg-green-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}>
                {imageQuality === "good" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {imageQuality === "good" ? "Buena Calidad" : "Calidad Baja"}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={retakePhoto}
              variant="outline"
              className="flex-1 border-gray-600 hover:bg-gray-700/50 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Repetir
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={imageQuality === "poor" || isUploading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Continuar
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-600 hover:bg-gray-700/50 rounded-xl"
        >
          Atrás
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DocumentCapture;