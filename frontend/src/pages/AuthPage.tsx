import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { 
  Eye, EyeOff, Mail, Lock, User, ArrowLeft, Shield, Headphones, 
  Calculator, Settings, Sparkles, CheckCircle, TrendingUp, Trophy
} from 'lucide-react';

// Usuarios de prueba para mostrar en el login
const TEST_USERS = [
  { 
    email: 'admin@tormentus.com', 
    role: 'Admin', 
    desc: 'Panel de administración completo',
    icon: Shield, 
    color: 'from-red-500 to-red-600',
    textColor: 'text-red-400',
    route: '/admin' 
  },
  { 
    email: 'operator@tormentus.com', 
    role: 'Operador', 
    desc: 'Gestión de operaciones y mercados',
    icon: Settings, 
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-400',
    route: '/operator' 
  },
  { 
    email: 'accountant@tormentus.com', 
    role: 'Contador', 
    desc: 'Finanzas y reportes contables',
    icon: Calculator, 
    color: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-400',
    route: '/accountant' 
  },
  { 
    email: 'support@tormentus.com', 
    role: 'Soporte', 
    desc: 'Atención al cliente y tickets',
    icon: Headphones, 
    color: 'from-cyan-500 to-cyan-600',
    textColor: 'text-cyan-400',
    route: '/support' 
  },
  { 
    email: 'user@tormentus.com', 
    role: 'Usuario', 
    desc: 'Plataforma de trading completa',
    icon: TrendingUp, 
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-400',
    route: '/platform' 
  },
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const { login, register } = useAuthContext();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSelectUser = (email: string) => {
    setSelectedUser(email);
    setFormData(prev => ({ ...prev, email, password: 'password123' }));
  };

  const handleQuickLogin = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await login(selectedUser, 'password123');
      const testUser = TEST_USERS.find(u => u.email === selectedUser);
      navigate(testUser?.route || '/platform');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        if (formData.password.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres');
          setLoading(false);
          return;
        }
        await register({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName
        });
        navigate('/platform');
      } else {
        const user = await login(formData.email, formData.password);
        // Redirigir según el rol
        const testUser = TEST_USERS.find(u => u.email === formData.email);
        if (testUser) {
          navigate(testUser.route);
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'operator') {
          navigate('/operator');
        } else if (user.role === 'accountant') {
          navigate('/accountant');
        } else if (user.role === 'support') {
          navigate('/support');
        } else {
          navigate('/platform');
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-purple-500', 'bg-emerald-500'];
  const strengthLabels = ['Débil', 'Regular', 'Buena', 'Fuerte'];

  return (
    <div className="min-h-screen bg-[#0d0b14] flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-violet-900/20" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />

      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">TORMENTUS</span>
              <span className="ml-2 text-[10px] px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded font-bold">PRO</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">
            La plataforma de trading más <span className="text-purple-400">avanzada</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Opera en Forex, Criptomonedas, Materias Primas y Acciones con payouts de hasta 95%.
          </p>

          <div className="space-y-4">
            {[
              { icon: TrendingUp, text: 'Payouts de hasta 95%' },
              { icon: Trophy, text: 'Torneos con premios de $50,000+' },
              { icon: Shield, text: 'Seguridad de grado bancario' },
              { icon: Headphones, text: 'Soporte 24/7 en español' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 mb-6 transition text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Card */}
          <div className="bg-[#13111c] border border-purple-900/20 rounded-2xl p-6 md:p-8">
            {/* Logo Mobile */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">TORMENTUS</span>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {mode === 'login' ? 'Ingresa tus credenciales para continuar' : 'Comienza a operar en minutos'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 bg-[#0d0b14] rounded-xl p-1">
              <button
                onClick={() => { setMode('login'); setSelectedUser(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'login' 
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setMode('register'); setSelectedUser(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'register' 
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Nombre</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-xl px-3 py-2.5 pl-10 text-sm focus:border-purple-500/50 focus:outline-none transition-all"
                        placeholder="Juan"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Apellido</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-xl px-3 py-2.5 text-sm focus:border-purple-500/50 focus:outline-none transition-all"
                      placeholder="Pérez"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-xl px-3 py-2.5 pl-10 text-sm focus:border-purple-500/50 focus:outline-none transition-all"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-xl px-3 py-2.5 pl-10 pr-10 text-sm focus:border-purple-500/50 focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password strength */}
                {mode === 'register' && formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Fortaleza: {strengthLabels[passwordStrength - 1] || 'Muy débil'}
                    </p>
                  </div>
                )}
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-xl px-3 py-2.5 pl-10 text-sm focus:border-purple-500/50 focus:outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : mode === 'login' ? (
                  'Iniciar Sesión'
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            {mode === 'login' && (
              <p className="text-center mt-4">
                <a href="#" className="text-purple-400 hover:text-purple-300 text-sm transition">
                  ¿Olvidaste tu contraseña?
                </a>
              </p>
            )}

            {mode === 'register' && (
              <p className="text-center mt-4 text-[11px] text-gray-500">
                Al registrarte, aceptas nuestros{' '}
                <a href="#" className="text-purple-400 hover:underline">Términos</a> y{' '}
                <a href="#" className="text-purple-400 hover:underline">Política de Privacidad</a>
              </p>
            )}
          </div>

          {/* Demo Account Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Contraseña de prueba: <code className="bg-[#1a1625] px-2 py-0.5 rounded text-purple-400">password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
