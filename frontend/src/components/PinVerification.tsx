import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Lock, Fingerprint, AlertCircle, Eye, EyeOff, RefreshCw, X } from 'lucide-react';

interface PinVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PinVerification({ onSuccess, onCancel }: PinVerificationProps) {
  const { verifyPin, pendingUser, logout } = useAuthContext();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 30; // seconds

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Lock timer countdown
    if (isLocked && lockTimer > 0) {
      const timer = setTimeout(() => setLockTimer(lockTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockTimer === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
      setError('');
    }
  }, [isLocked, lockTimer]);

  const handlePinChange = (index: number, value: string) => {
    if (isLocked) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 3 && newPin.every(d => d !== '')) {
      handleVerify(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (pinCode: string) => {
    if (isLocked) return;
    
    setIsLoading(true);
    setError('');

    try {
      const success = await verifyPin(pinCode);
      
      if (success) {
        onSuccess?.();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockTimer(LOCK_DURATION);
          setError(`Demasiados intentos. Espera ${LOCK_DURATION} segundos.`);
        } else {
          setError(`PIN incorrecto. ${MAX_ATTEMPTS - newAttempts} intentos restantes.`);
        }
      }
    } catch {
      setError('Error al verificar PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 bg-[#0d0b14] flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            TORMENTUS
          </h1>
        </div>

        {/* Card */}
        <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 p-6 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold mb-1">Verificación de PIN</h2>
            <p className="text-sm text-gray-500">
              Hola, {pendingUser?.first_name}. Ingresa tu PIN para continuar.
            </p>
          </div>

          {/* PIN Input */}
          <div className="flex justify-center gap-3 mb-4">
            {pin.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={el => inputRefs.current[index] = el}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handlePinChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  disabled={isLocked || isLoading}
                  className={`w-14 h-16 bg-[#1a1625] border-2 rounded-xl text-center text-2xl font-bold transition-all focus:outline-none ${
                    error 
                      ? 'border-red-500/50 text-red-400' 
                      : digit 
                        ? 'border-purple-500/50 text-white' 
                        : 'border-purple-900/30 text-white'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
                />
                {digit && !showPin && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Show/Hide PIN */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowPin(!showPin)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          {/* Lock Timer */}
          {isLocked && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
              <span className="text-sm text-yellow-400">
                Bloqueado por {lockTimer}s
              </span>
            </div>
          )}

          {/* Attempts Indicator */}
          {attempts > 0 && !isLocked && (
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i < attempts ? 'bg-red-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => handleVerify(pin.join(''))}
              disabled={pin.some(d => !d) || isLocked || isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : 'Verificar PIN'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-[#1a1625] text-gray-400 rounded-xl text-sm hover:text-white hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>

          {/* Help */}
          <div className="mt-4 text-center">
            <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              ¿Olvidaste tu PIN?
            </button>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center text-[10px] text-gray-600 mt-4">
          Tu PIN protege el acceso a tu cuenta. Nunca lo compartas con nadie.
        </p>
      </div>
    </div>
  );
}
