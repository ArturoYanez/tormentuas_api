import { Link } from 'react-router-dom';
import { 
  Zap, Shield, BarChart3, Trophy, Users,
  ArrowRight, Sparkles, TrendingUp, Clock, DollarSign,
  Headphones, CheckCircle, Star, Play, Award, Target
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0d0b14]">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[#13111c]/90 backdrop-blur-xl border-b border-purple-900/20 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">TORMENTUS</span>
            <span className="hidden sm:inline text-[8px] px-1.5 py-0.5 bg-purple-600/20 text-purple-400 rounded font-bold">PRO</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-400 hover:text-purple-400 transition text-sm">Características</a>
            <a href="#markets" className="text-gray-400 hover:text-purple-400 transition text-sm">Mercados</a>
            <a href="#tournaments" className="text-gray-400 hover:text-purple-400 transition text-sm">Torneos</a>
            <a href="#support" className="text-gray-400 hover:text-purple-400 transition text-sm">Soporte</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-gray-300 hover:text-white transition text-sm">
              Iniciar Sesión
            </Link>
            <Link to="/auth?mode=register" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-sm text-purple-400">Plataforma de Trading de Opciones Binarias #1</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Opera con <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Confianza</span>
            <br />y <span className="text-emerald-400">Gana</span> en Segundos
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            La plataforma más avanzada para trading de opciones binarias. Opera en Forex, Criptomonedas, 
            Materias Primas y Acciones con payouts de hasta 95% y ejecución instantánea.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth?mode=register" className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-lg font-medium hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
              Comenzar Ahora <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/auth" className="px-8 py-3.5 bg-[#1a1625] border border-purple-900/30 rounded-xl text-lg font-medium hover:border-purple-500/50 transition-all flex items-center justify-center gap-2">
              <Play className="w-5 h-5 text-purple-400" /> Cuenta Demo Gratis
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {[
              { value: '95%', label: 'Payout Máximo', icon: TrendingUp, color: 'text-emerald-400' },
              { value: '38+', label: 'Activos Disponibles', icon: BarChart3, color: 'text-purple-400' },
              { value: '30s', label: 'Operaciones Rápidas', icon: Clock, color: 'text-violet-400' },
              { value: '24/7', label: 'Soporte en Vivo', icon: Headphones, color: 'text-purple-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-[#13111c]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-medium">¿Por qué elegirnos?</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Características Principales</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitas para operar como un profesional en una sola plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Ejecución Instantánea', desc: 'Operaciones ejecutadas en menos de 1ms. Sin retrasos, sin recotizaciones.', color: 'from-purple-500 to-violet-600' },
              { icon: Shield, title: 'Seguridad Avanzada', desc: 'PIN de seguridad, 2FA y encriptación de grado bancario para proteger tus fondos.', color: 'from-emerald-500 to-emerald-600' },
              { icon: BarChart3, title: 'Gráficos Profesionales', desc: 'Velas japonesas en tiempo real, indicadores técnicos y múltiples timeframes.', color: 'from-purple-500 to-violet-600' },
              { icon: Trophy, title: 'Torneos Competitivos', desc: 'Compite con traders de todo el mundo y gana premios de hasta $50,000.', color: 'from-purple-500 to-violet-600' },
              { icon: DollarSign, title: 'Depósitos Cripto', desc: 'Deposita con USDT, BTC, ETH, SOL y más. Retiros rápidos y seguros.', color: 'from-purple-500 to-violet-600' },
              { icon: Headphones, title: 'Soporte 24/7', desc: 'Chat en vivo, videollamadas y sistema de tickets. Siempre estamos para ayudarte.', color: 'from-purple-500 to-violet-600' }
            ].map((feature, i) => (
              <div key={i} className="bg-[#0d0b14] rounded-xl p-6 border border-purple-900/20 hover:border-purple-500/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section id="markets" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-medium">Diversifica tu portafolio</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Mercados Disponibles</h2>
            <p className="text-gray-400">Opera en los mercados más líquidos del mundo con payouts competitivos</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '₿', name: 'Criptomonedas', pairs: 'BTC, ETH, SOL, BNB +10', payout: '95%', color: 'from-orange-500 to-orange-600', assets: 10 },
              { icon: '💱', name: 'Forex', pairs: 'EUR/USD, GBP/USD, USD/JPY +10', payout: '92%', color: 'from-purple-500 to-purple-600', assets: 10 },
              { icon: '🥇', name: 'Materias Primas', pairs: 'Oro, Plata, Petróleo +8', payout: '90%', color: 'from-purple-500 to-violet-600', assets: 8 },
              { icon: '📈', name: 'Acciones', pairs: 'Apple, Tesla, Nvidia +10', payout: '88%', color: 'from-emerald-500 to-emerald-600', assets: 10 }
            ].map((market, i) => (
              <div key={i} className="bg-[#13111c] rounded-xl p-5 border border-purple-900/20 hover:border-purple-500/30 hover:scale-105 transition-all cursor-pointer">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${market.color} flex items-center justify-center text-2xl`}>
                  {market.icon}
                </div>
                <h3 className="text-lg font-semibold mb-1 text-center">{market.name}</h3>
                <p className="text-gray-500 text-xs text-center mb-3">{market.pairs}</p>
                <div className="flex justify-between items-center pt-3 border-t border-purple-900/20">
                  <span className="text-xs text-gray-500">{market.assets} activos</span>
                  <span className="text-sm font-bold text-emerald-400">Hasta {market.payout}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-[#13111c]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-medium">Simple y rápido</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">¿Cómo Funciona?</h2>
            <p className="text-gray-400">Comienza a operar en 3 simples pasos</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Crea tu Cuenta', desc: 'Regístrate gratis en menos de 1 minuto. Sin documentos, sin complicaciones.', icon: Users },
              { step: '02', title: 'Deposita Fondos', desc: 'Deposita con criptomonedas (USDT, BTC, ETH). Mínimo $10, máximo ilimitado.', icon: DollarSign },
              { step: '03', title: 'Comienza a Operar', desc: 'Elige un activo, predice si sube o baja, y gana hasta 95% en segundos.', icon: TrendingUp }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-[#0d0b14] rounded-xl p-6 border border-purple-900/20 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-purple-400 text-xs font-bold">PASO {item.step}</span>
                  <h3 className="text-lg font-semibold mt-2 mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-purple-500/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section id="tournaments" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-medium">Compite y gana</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Torneos de Trading</h2>
            <p className="text-gray-400">Demuestra tus habilidades y gana premios increíbles</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Copa Principiantes', prize: '$1,000', entry: 'GRATIS', badge: 'GRATIS', badgeColor: 'bg-emerald-500', participants: '300', icon: Star },
              { name: 'Weekly Challenge', prize: '$5,000', entry: 'GRATIS', badge: 'POPULAR', badgeColor: 'bg-purple-500', participants: '500', icon: Trophy },
              { name: 'Elite Championship', prize: '$50,000', entry: '$200', badge: 'VIP', badgeColor: 'bg-gradient-to-r from-purple-500 to-violet-600', participants: '100', icon: Award }
            ].map((tournament, i) => (
              <div key={i} className="bg-[#13111c] rounded-xl p-6 border border-purple-900/20 hover:border-purple-500/30 transition-all relative overflow-hidden">
                <span className={`absolute top-4 right-4 ${tournament.badgeColor} text-[10px] font-bold px-2 py-1 rounded-full`}>
                  {tournament.badge}
                </span>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <tournament.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{tournament.name}</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Premio Total:</span>
                    <span className="font-bold text-emerald-400">{tournament.prize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Entrada:</span>
                    <span className="font-bold text-white">{tournament.entry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Participantes:</span>
                    <span className="font-bold text-purple-400">Hasta {tournament.participants}</span>
                  </div>
                </div>
                <Link to="/auth?mode=register" className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" /> Participar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-16 px-4 bg-[#13111c]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-purple-400 text-sm font-medium">Siempre contigo</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Soporte 24/7</h2>
              <p className="text-gray-400 mb-6">
                Nuestro equipo de soporte está disponible las 24 horas del día, los 7 días de la semana 
                para ayudarte con cualquier duda o problema.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Headphones, title: 'Chat en Vivo', desc: 'Respuesta en menos de 2 minutos' },
                  { icon: Target, title: 'Sistema de Tickets', desc: 'Para consultas detalladas' },
                  { icon: Play, title: 'Videollamadas', desc: 'Asistencia visual premium' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d0b14] rounded-2xl p-6 border border-purple-900/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Centro de Soporte</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    12 agentes en línea
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#1a1625] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">&lt;2min</div>
                  <div className="text-[10px] text-gray-500">Tiempo respuesta</div>
                </div>
                <div className="bg-[#1a1625] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">98%</div>
                  <div className="text-[10px] text-gray-500">Satisfacción</div>
                </div>
              </div>
              <Link to="/auth?mode=register" className="w-full py-2.5 bg-[#1a1625] border border-purple-900/30 rounded-lg text-sm font-medium hover:border-purple-500/50 transition-all flex items-center justify-center gap-2">
                Contactar Soporte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-2xl p-8 md:p-12 border border-purple-500/30 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-violet-600/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para Comenzar?</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Únete a miles de traders que ya están ganando con TORMENTUS. 
                Cuenta demo gratuita con $50,000 virtuales para practicar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?mode=register" className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-lg font-medium hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
                  Crear Cuenta Gratis <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-400" /> Sin comisiones</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-400" /> Demo gratis</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-400" /> Retiros rápidos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#13111c] border-t border-purple-900/20 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">TORMENTUS</span>
              </div>
              <p className="text-gray-500 text-sm">
                La plataforma de trading de opciones binarias más avanzada del mercado.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Plataforma</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Trading</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Torneos</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Mercados</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Compañía</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contacto</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Carreras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Política de Privacidad</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Política de Cookies</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">AML/KYC</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-900/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © 2025 TORMENTUS. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600">Métodos de pago:</span>
              <div className="flex gap-2">
                {['USDT', 'BTC', 'ETH', 'SOL', 'BNB'].map(crypto => (
                  <span key={crypto} className="px-2 py-1 bg-[#1a1625] rounded text-[10px] text-gray-400">{crypto}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
