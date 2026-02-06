import { useState, useEffect } from "react";
import { KYCData } from "@/components/kyc/KYCModal";

export interface KYCUser {
  id: string;
  email: string;
  isVerified: boolean;
  kycStatus: "not-started" | "pending" | "in-review" | "approved" | "rejected";
  kycData?: KYCData;
  lastLoginAt?: Date;
}

export const useKYC = () => {
  const [user, setUser] = useState<KYCUser | null>(null);
  const [showKYCAlert, setShowKYCAlert] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  // Simular estado del usuario
  useEffect(() => {
    // Simular login del usuario
    const simulatedUser: KYCUser = {
      id: "user-123",
      email: "usuario@ejemplo.com",
      isVerified: false,
      kycStatus: "not-started",
      lastLoginAt: new Date()
    };
    
    setUser(simulatedUser);
    
    // Mostrar alerta si no está verificado
    if (!simulatedUser.isVerified && simulatedUser.kycStatus === "not-started") {
      // Esperar un poco después del login para mostrar la alerta
      setTimeout(() => {
        setShowKYCAlert(true);
      }, 2000);
    }
  }, []);

  const startKYCProcess = () => {
    setShowKYCAlert(false);
    setShowKYCModal(true);
  };

  const dismissKYCAlert = () => {
    setShowKYCAlert(false);
    // Guardar en localStorage que el usuario desestimó la alerta
    localStorage.setItem("kyc-alert-dismissed", Date.now().toString());
  };

  const completeKYC = (kycData: KYCData) => {
    if (user) {
      const updatedUser: KYCUser = {
        ...user,
        kycStatus: kycData.status as any,
        kycData: kycData
      };
      setUser(updatedUser);
      setShowKYCModal(false);
      
      // Simular guardar en backend
      console.log("KYC Data saved:", kycData);
    }
  };

  const checkKYCStatus = async () => {
    // Simular llamada a la API para verificar el estado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (user) {
      // Simular cambio de estado después de revisión
      const statuses = ["in-review", "approved", "rejected"];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setUser(prev => prev ? {
        ...prev,
        kycStatus: newStatus as any,
        isVerified: newStatus === "approved"
      } : null);
    }
  };

  return {
    user,
    showKYCAlert,
    showKYCModal,
    startKYCProcess,
    dismissKYCAlert,
    completeKYC,
    checkKYCStatus,
    setShowKYCModal
  };
};

export default useKYC;