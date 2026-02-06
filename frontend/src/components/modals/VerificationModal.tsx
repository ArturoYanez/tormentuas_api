import { useState, useRef } from 'react';
import { verificationAPI } from '../../lib/api';
import { X, Upload, Camera, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';

interface VerificationModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'intro' | 'document' | 'selfie' | 'review' | 'success';

interface FilePreview {
  file: File;
  preview: string;
  base64: string;
}

export default function VerificationModal({ onClose, onSuccess }: VerificationModalProps) {
  const [step, setStep] = useState<Step>('intro');
  const [documentType, setDocumentType] = useState('id');
  const [documentFront, setDocumentFront] = useState<FilePreview | null>(null);
  const [documentBack, setDocumentBack] = useState<FilePreview | null>(null);
  const [selfie, setSelfie] = useState<FilePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: FilePreview | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (JPG, PNG)');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB');
      return;
    }

    setError('');

    try {
      const base64 = await convertToBase64(file);
      const preview = URL.createObjectURL(file);
      setter({ file, preview, base64 });
    } catch (err) {
      setError('Error al procesar la imagen');
    }
  };

  const removeFile = (setter: (value: FilePreview | null) => void, preview: FilePreview | null) => {
    if (preview?.preview) {
      URL.revokeObjectURL(preview.preview);
    }
    setter(null);
  };

  const handleSubmit = async () => {
    if (!documentFront || !selfie) {
      setError('Debes subir el documento y la selfie');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verificationAPI.submit({
        document_type: documentType,
        document_front: documentFront.base64,
        document_back: documentBack?.base64,
        selfie_with_doc: selfie.base64
      });
      setStep('success');
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar verificación');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToSelfie = documentFront !== null;
  const canProceedToReview = selfie !== null;

  const FileUploadBox = ({ 
    label, 
    file, 
    inputRef, 
    onRemove,
    required = false 
  }: { 
    label: string; 
    file: FilePreview | null; 
    inputRef: React.RefObject<HTMLInputElement>;
    onRemove: () => void;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm text-gray-400 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {file ? (
        <div className="relative border-2 border-purple-500 rounded-lg overflow-hidden">
          <img src={file.preview} alt={label} className="w-full h-32 object-cover" />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
            <p className="text-xs text-white truncate">{file.file.name}</p>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition cursor-pointer bg-[#1a1625]"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
          <span className="text-sm text-gray-500">Click para subir</span>
          <p className="text-xs text-gray-600 mt-1">JPG, PNG (max 5MB)</p>
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Verificación Requerida</h2>
            <p className="text-gray-400 mb-6">
              Para poder operar con dinero real, necesitas verificar tu identidad. 
              Este proceso es rápido y seguro.
            </p>
            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Documento de identidad válido (frente y reverso)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Selfie sosteniendo el documento</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Revisión en menos de 24 horas</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-[#1a1625] text-gray-300 rounded-lg hover:bg-[#252040] transition-colors">
                Más Tarde
              </button>
              <button onClick={() => setStep('document')} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Comenzar
              </button>
            </div>
          </div>
        );

      case 'document':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Sube tu Documento</h2>
            
            <div className="space-y-3 mb-6">
              <label className="block text-sm text-gray-400 mb-2">Tipo de documento</label>
              {[
                { id: 'id', label: 'Cédula de Identidad / DNI' },
                { id: 'passport', label: 'Pasaporte' },
                { id: 'license', label: 'Licencia de Conducir' }
              ].map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setDocumentType(doc.id)}
                  className={`w-full p-3 rounded-lg border text-left transition text-sm ${
                    documentType === doc.id 
                      ? 'border-purple-500 bg-purple-500/10 text-white' 
                      : 'border-gray-700 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  {doc.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <FileUploadBox
                label="Frente del documento"
                file={documentFront}
                inputRef={frontInputRef}
                onRemove={() => removeFile(setDocumentFront, documentFront)}
                required
              />
              <FileUploadBox
                label="Reverso del documento"
                file={documentBack}
                inputRef={backInputRef}
                onRemove={() => removeFile(setDocumentBack, documentBack)}
              />
            </div>

            {/* Hidden file inputs */}
            <input
              ref={frontInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, setDocumentFront)}
            />
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, setDocumentBack)}
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('intro')} className="flex-1 px-4 py-2.5 bg-[#1a1625] text-gray-300 rounded-lg hover:bg-[#252040] transition-colors">
                Atrás
              </button>
              <button 
                onClick={() => setStep('selfie')} 
                disabled={!canProceedToSelfie}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 'selfie':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Selfie con Documento</h2>
            <p className="text-gray-400 mb-6">
              Toma una foto sosteniendo tu documento junto a tu rostro. Asegúrate de que ambos sean claramente visibles.
            </p>

            <div className="mb-6">
              {selfie ? (
                <div className="relative border-2 border-purple-500 rounded-lg overflow-hidden">
                  <img src={selfie.preview} alt="Selfie" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => removeFile(setSelfie, selfie)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => selfieInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-purple-500 transition cursor-pointer bg-[#1a1625]"
                >
                  <Camera className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  <span className="text-gray-400">Click para tomar foto o subir imagen</span>
                  <p className="text-xs text-gray-600 mt-2">JPG, PNG (max 5MB)</p>
                </div>
              )}
            </div>

            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => handleFileSelect(e, setSelfie)}
            />

            <div className="bg-[#1a1625] rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2 text-white text-sm">Consejos:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Asegúrate de que tu rostro y el documento sean visibles</li>
                <li>• Usa buena iluminación natural</li>
                <li>• Evita reflejos y sombras en el documento</li>
                <li>• No uses filtros ni edites la imagen</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('document')} className="flex-1 px-4 py-2.5 bg-[#1a1625] text-gray-300 rounded-lg hover:bg-[#252040] transition-colors">
                Atrás
              </button>
              <button 
                onClick={() => setStep('review')} 
                disabled={!canProceedToReview}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Revisar y Enviar</h2>
            <p className="text-gray-400 mb-6">
              Verifica que toda la información sea correcta antes de enviar.
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-[#1a1625] rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Tipo de documento</div>
                <div className="font-medium capitalize text-white">
                  {documentType === 'id' ? 'Cédula de Identidad' : documentType === 'passport' ? 'Pasaporte' : 'Licencia de Conducir'}
                </div>
              </div>
              
              <div className="bg-[#1a1625] rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">Documentos subidos</div>
                <div className="grid grid-cols-3 gap-2">
                  {documentFront && (
                    <div className="relative">
                      <img src={documentFront.preview} alt="Frente" className="w-full h-16 object-cover rounded" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white text-center py-0.5">Frente</span>
                    </div>
                  )}
                  {documentBack && (
                    <div className="relative">
                      <img src={documentBack.preview} alt="Reverso" className="w-full h-16 object-cover rounded" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white text-center py-0.5">Reverso</span>
                    </div>
                  )}
                  {selfie && (
                    <div className="relative">
                      <img src={selfie.preview} alt="Selfie" className="w-full h-16 object-cover rounded" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white text-center py-0.5">Selfie</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setStep('selfie')} 
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-[#1a1625] text-gray-300 rounded-lg hover:bg-[#252040] transition-colors disabled:opacity-50"
              >
                Atrás
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Verificación'
                )}
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">¡Verificación Enviada!</h2>
            <p className="text-gray-400 mb-6">
              Tu solicitud ha sido recibida. Te notificaremos cuando sea aprobada.
              Esto suele tomar menos de 24 horas.
            </p>
            <button onClick={onClose} className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Entendido
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#13111c] rounded-xl max-w-md w-full p-6 relative border border-purple-900/30">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {renderStep()}
      </div>
    </div>
  );
}
