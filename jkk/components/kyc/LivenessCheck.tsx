import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CheckCircle, RotateCcw, User, Eye, RotateCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LivenessCheckProps {
  onComplete: (videoData: string) => void;
  onBack: () => void;
}

type LivenessStep = "instructions" | "recording" | "review";
type LivenessAction = "look-center" | "turn-left" | "turn-right" | "blink" | "complete";

const LivenessCheck: React.FC<LivenessCheckProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState<LivenessStep>("instructions");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<LivenessAction>("look-center");
  const [actionProgress, setActionProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const actions: { id: LivenessAction; title: string; instruction: string; icon: React.ReactNode }[] = [
    {
      id: "look-center",
      title: "Mirar al Centro",
      instruction: "Mira directamente a la cámara",
      icon: <Eye className="w-6 h-6" />
    },
    {
      id: "turn-left",
      title: "Girar Izquierda",
      instruction: "Gira lentamente la cabeza hacia la izquierda",
      icon: <RotateCcw className="w-6 h-6" />
    },
    {
      id: "turn-right",
      title: "Girar Derecha",
      instruction: "Gira lentamente la cabeza hacia la derecha",
      icon: <RotateCw className="w-6 h-6" />
    },
    {
      id: "blink",
      title: "Parpadear",
      instruction: "Parpadea varias veces de forma natural",
      icon: <Eye className="w-6 h-6" />
    },
    {
      id: "complete",
      title: "Completado",
      instruction: "¡Perfecto! Prueba de vida completada",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Cámara frontal
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toast({
        title: "Error de Cámara",
        description: "No se pudo acceder a la cámara frontal.",
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

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideo(videoURL);
      setCurrentStep("review");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setCurrentAction("look-center");
    setActionProgress(0);

    // Simulate liveness detection progress
    simulateLivenessDetection();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
    }
  };

  const simulateLivenessDetection = () => {
    const actionSequence: LivenessAction[] = ["look-center", "turn-left", "turn-right", "blink", "complete"];
    let actionIndex = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 2;
      setActionProgress(progress);

      if (progress >= 100) {
        actionIndex++;
        if (actionIndex < actionSequence.length) {
          setCurrentAction(actionSequence[actionIndex]);
          progress = 0;
          setActionProgress(0);
        } else {
          clearInterval(interval);
          setTimeout(() => {
            stopRecording();
          }, 1000);
        }
      }
    }, 100);
  };

  const handleStartLiveness = () => {
    setCurrentStep("recording");
    startCamera();
  };

  const handleRetry = () => {
    setRecordedVideo(null);
    setCurrentStep("instructions");
    setCurrentAction("look-center");
    setActionProgress(0);
  };

  const handleSubmit = async () => {
    if (!recordedVideo) return;
    
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "¡Verificación Completada!",
      description: "Tu prueba de vida ha sido procesada exitosamente.",
    });
    
    onComplete(recordedVideo);
    setIsProcessing(false);
  };

  useEffect(() => {
    if (currentStep === "recording" && showCamera) {
      setTimeout(() => {
        startRecording();
      }, 2000);
    }
  }, [currentStep, showCamera]);

  const currentActionData = actions.find(action => action.id === currentAction);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">Prueba de Vida</h3>
        <p className="text-gray-400">
          Sigue las instrucciones para verificar que eres una persona real
        </p>
      </div>

      {currentStep === "instructions" && (
        <div className="space-y-6">
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <h4 className="font-semibold text-purple-300 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Instrucciones de la Prueba de Vida:
              </h4>
              <div className="grid gap-4">
                {actions.slice(0, -1).map((action, index) => (
                  <div key={action.id} className="flex items-center gap-3 text-purple-200">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {action.icon}
                      <span>{action.instruction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h4 className="font-semibold text-white mb-2">Consejos importantes:</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Asegúrate de tener buena iluminación en tu rostro</p>
              <p>• Mantén la cámara a la altura de tus ojos</p>
              <p>• Sigue las instrucciones que aparezcan en pantalla</p>
              <p>• El proceso tomará aproximadamente 10-15 segundos</p>
            </div>
          </div>

          <Button
            onClick={handleStartLiveness}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Camera className="w-5 h-5 mr-2" />
            Iniciar Prueba de Vida
          </Button>
        </div>
      )}

      {currentStep === "recording" && (
        <div className="space-y-4">
          {showCamera && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-cover rounded-xl bg-gray-800 transform scale-x-[-1]"
              />
              
              {/* Overlay with instructions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 rounded-xl">
                {currentActionData && (
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-center gap-3 text-white">
                        {currentActionData.icon}
                        <span className="font-bold text-lg">{currentActionData.title}</span>
                      </div>
                      <p className="text-gray-300">{currentActionData.instruction}</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                          style={{ width: `${actionProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Face detection circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-60 border-4 border-white/50 rounded-full border-dashed animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === "review" && recordedVideo && (
        <div className="space-y-4">
          <video
            src={recordedVideo}
            controls
            className="w-full h-64 object-cover rounded-xl bg-gray-800"
          />
          
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1 border-gray-600 hover:bg-gray-700/50 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Repetir
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl"
            >
              {isProcessing ? (
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
      {currentStep === "instructions" && (
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-600 hover:bg-gray-700/50 rounded-xl"
        >
          Atrás
        </Button>
      )}
    </div>
  );
};

export default LivenessCheck;