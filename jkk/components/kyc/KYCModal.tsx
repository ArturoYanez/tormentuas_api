import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Shield } from "lucide-react";
import DocumentSelection from "./DocumentSelection";
import DocumentCapture from "./DocumentCapture";
import LivenessCheck from "./LivenessCheck";
import KYCReview from "./KYCReview";

export type KYCStep = "document-selection" | "document-capture" | "liveness-check" | "review";

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  regions: string[];
}

export interface KYCData {
  documentType?: DocumentType;
  documentImage?: string;
  livenessVideo?: string;
  status: "pending" | "in-review" | "approved" | "rejected";
}

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: KYCData) => void;
}

const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<KYCStep>("document-selection");
  const [kycData, setKycData] = useState<KYCData>({ status: "pending" });

  const steps = [
    { id: "document-selection", title: "Seleccionar Documento", progress: 25 },
    { id: "document-capture", title: "Capturar Documento", progress: 50 },
    { id: "liveness-check", title: "Prueba de Vida", progress: 75 },
    { id: "review", title: "Revisión", progress: 100 }
  ];

  const currentStepInfo = steps.find(step => step.id === currentStep);

  const handleDocumentSelection = (documentType: DocumentType) => {
    setKycData(prev => ({ ...prev, documentType }));
    setCurrentStep("document-capture");
  };

  const handleDocumentCapture = (imageData: string) => {
    setKycData(prev => ({ ...prev, documentImage: imageData }));
    setCurrentStep("liveness-check");
  };

  const handleLivenessCheck = (videoData: string) => {
    setKycData(prev => ({ ...prev, livenessVideo: videoData, status: "in-review" }));
    setCurrentStep("review");
  };

  const handleComplete = () => {
    onComplete(kycData);
    onClose();
  };

  const handleBack = () => {
    switch (currentStep) {
      case "document-capture":
        setCurrentStep("document-selection");
        break;
      case "liveness-check":
        setCurrentStep("document-capture");
        break;
      case "review":
        setCurrentStep("liveness-check");
        break;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "document-selection":
        return <DocumentSelection onSelect={handleDocumentSelection} />;
      case "document-capture":
        return (
          <DocumentCapture
            documentType={kycData.documentType!}
            onCapture={handleDocumentCapture}
            onBack={handleBack}
          />
        );
      case "liveness-check":
        return (
          <LivenessCheck
            onComplete={handleLivenessCheck}
            onBack={handleBack}
          />
        );
      case "review":
        return (
          <KYCReview
            kycData={kycData}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-4 border-b border-gray-700">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Verificación de Identidad
              </h2>
              <p className="text-gray-400 text-sm">
                {currentStepInfo?.title} • Paso {steps.findIndex(s => s.id === currentStep) + 1} de {steps.length}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Progreso</span>
              <span>{currentStepInfo?.progress}%</span>
            </div>
            <Progress 
              value={currentStepInfo?.progress} 
              className="h-2 bg-gray-700"
            />
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KYCModal;