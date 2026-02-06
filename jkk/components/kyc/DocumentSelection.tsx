import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, BookOpen, MapPin, Check, Globe } from "lucide-react";
import { DocumentType } from "./KYCModal";

interface DocumentSelectionProps {
  onSelect: (documentType: DocumentType) => void;
}

const DocumentSelection: React.FC<DocumentSelectionProps> = ({ onSelect }) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);

  const documentTypes: DocumentType[] = [
    {
      id: "passport",
      name: "Pasaporte",
      description: "Válido para todos los países",
      regions: ["Global"]
    },
    {
      id: "national-id",
      name: "Cédula de Identidad",
      description: "Solo para Panamá y Venezuela",
      regions: ["Panamá", "Venezuela"]
    }
  ];

  const getDocumentIcon = (id: string) => {
    switch (id) {
      case "passport":
        return BookOpen;
      case "national-id":
        return CreditCard;
      default:
        return CreditCard;
    }
  };

  const getDocumentColor = (id: string) => {
    switch (id) {
      case "passport":
        return "from-blue-600 to-indigo-600";
      case "national-id":
        return "from-green-600 to-emerald-600";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">Selecciona tu Documento</h3>
        <p className="text-gray-400">
          Elige el tipo de documento que utilizarás para verificar tu identidad
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {documentTypes.map((docType) => {
          const IconComponent = getDocumentIcon(docType.id);
          const isSelected = selectedDocument?.id === docType.id;
          
          return (
            <Card
              key={docType.id}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                isSelected
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-105"
                  : "border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
              }`}
              onClick={() => setSelectedDocument(docType)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getDocumentColor(docType.id)} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-scale-in">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-bold text-white text-lg">{docType.name}</h4>
                  <p className="text-gray-400 text-sm mt-1">{docType.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {docType.regions.map((region) => (
                    <Badge
                      key={region}
                      variant="secondary"
                      className={`text-xs ${
                        region === "Global"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-green-500/20 text-green-300 border-green-500/30"
                      }`}
                    >
                      {region === "Global" ? (
                        <Globe className="w-3 h-3 mr-1" />
                      ) : (
                        <MapPin className="w-3 h-3 mr-1" />
                      )}
                      {region}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          Requisitos por Región
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>• <strong>Pasaporte:</strong> Aceptado en todos los países</p>
          <p>• <strong>Cédula:</strong> Solo válida para residentes de Panamá y Venezuela</p>
          <p>• El documento debe estar vigente y en buen estado</p>
        </div>
      </div>

      <Button
        onClick={() => selectedDocument && onSelect(selectedDocument)}
        disabled={!selectedDocument}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {selectedDocument ? "Continuar con " + selectedDocument.name : "Selecciona un Documento"}
      </Button>
    </div>
  );
};

export default DocumentSelection;