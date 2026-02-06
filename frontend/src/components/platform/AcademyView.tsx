import { useState, useEffect } from 'react';
import { GraduationCap, Play, BookOpen, FileText, Search, Clock, Star, CheckCircle, Lock, ChevronRight, Award, TrendingUp, BarChart3, Target, Loader2 } from 'lucide-react';
import { academyAPI } from '../../lib/api';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  lessons: number;
  progress: number;
  rating: number;
  thumbnail: string;
  locked: boolean;
}

interface Video {
  id: number;
  title: string;
  duration: string;
  views: number;
  category: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

interface Stats {
  completed_courses: number;
  total_progress: number;
  hours_learned: number;
  certificates: number;
}

export default function AcademyView() {
  const [activeTab, setActiveTab] = useState<'courses' | 'videos' | 'glossary'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [stats, setStats] = useState<Stats>({ completed_courses: 0, total_progress: 0, hours_learned: 0, certificates: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab, categoryFilter, levelFilter]);

  useEffect(() => {
    if (activeTab === 'glossary') {
      const timer = setTimeout(() => loadGlossary(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes] = await Promise.all([academyAPI.getStats()]);
      setStats(statsRes.data.stats || { completed_courses: 0, total_progress: 0, hours_learned: 0, certificates: 0 });

      if (activeTab === 'courses') {
        const res = await academyAPI.getCourses(categoryFilter, levelFilter);
        setCourses(res.data.courses || []);
      } else if (activeTab === 'videos') {
        const res = await academyAPI.getVideos(categoryFilter !== 'all' ? categoryFilter : undefined);
        setVideos(res.data.videos || []);
      } else {
        await loadGlossary();
      }
    } catch (err) {
      console.error('Error loading academy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGlossary = async () => {
    try {
      const res = await academyAPI.getGlossary(searchTerm || undefined);
      setGlossary(res.data.terms || []);
    } catch (err) {
      console.error('Error loading glossary:', err);
    }
  };

  const handleMarkComplete = async (lessonId: number) => {
    try {
      await academyAPI.markLessonComplete(lessonId);
      loadData();
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  const handleVideoView = async (videoId: number) => {
    try {
      await academyAPI.incrementVideoViews(videoId);
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const filteredCourses = courses.filter(c => 
    !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVideos = videos.filter(v => 
    !searchTerm || v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Principiante</span>;
      case 'intermediate': return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Intermedio</span>;
      case 'advanced': return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Avanzado</span>;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <BookOpen className="w-4 h-4" />;
      case 'technical': return <BarChart3 className="w-4 h-4" />;
      case 'strategies': return <Target className="w-4 h-4" />;
      case 'psychology': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full bg-[#0d0b14] overflow-y-auto custom-scrollbar">
      <div className="p-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><GraduationCap className="w-6 h-6 text-purple-400" /> Academia de Trading</h1>
            <p className="text-gray-400 text-sm">Aprende a operar como un profesional</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-gray-400 text-xs">Cursos Completados</span></div>
            <p className="text-2xl font-bold text-white">{stats.completed_courses}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-purple-400" /><span className="text-gray-400 text-xs">Progreso Total</span></div>
            <p className="text-2xl font-bold text-purple-400">{stats.total_progress}%</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-blue-400" /><span className="text-gray-400 text-xs">Horas Aprendidas</span></div>
            <p className="text-2xl font-bold text-blue-400">{stats.hours_learned}h</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><Award className="w-5 h-5 text-yellow-400" /><span className="text-gray-400 text-xs">Certificados</span></div>
            <p className="text-2xl font-bold text-yellow-400">{stats.certificates}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar cursos, videos o términos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#13111c] border border-purple-900/30 rounded-xl pl-10 pr-4 py-3 text-white" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'courses', label: 'Cursos', icon: BookOpen },
            { id: 'videos', label: 'Videos', icon: Play },
            { id: 'glossary', label: 'Glosario', icon: FileText }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'courses' && (
              <>
                {/* Filters */}
                <div className="flex gap-3 mb-6">
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="all">Todas las categorías</option>
                    <option value="basics">Básicos</option>
                    <option value="technical">Análisis Técnico</option>
                    <option value="strategies">Estrategias</option>
                    <option value="psychology">Psicología</option>
                  </select>
                  <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="all">Todos los niveles</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCourses.map(course => (
                    <div key={course.id} className={`bg-[#13111c] rounded-xl border ${course.locked ? 'border-gray-800 opacity-75' : 'border-purple-900/20'} overflow-hidden`}>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-4xl">{course.thumbnail}</div>
                          {course.locked && <Lock className="w-5 h-5 text-gray-500" />}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getLevelBadge(course.level)}
                          <span className="text-xs text-gray-500 flex items-center gap-1">{getCategoryIcon(course.category)}</span>
                        </div>
                        <h3 className="text-white font-medium mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{course.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration} min</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.lessons} lecciones</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {course.rating}</span>
                        </div>
                        {!course.locked && course.progress > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Progreso</span>
                              <span className="text-purple-400">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${course.progress}%` }} />
                            </div>
                          </div>
                        )}
                        <button disabled={course.locked} className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${course.locked ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : course.progress === 100 ? 'bg-green-600 text-white' : course.progress > 0 ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-white hover:bg-purple-600'}`}>
                          {course.locked ? <><Lock className="w-4 h-4" /> Bloqueado</> : course.progress === 100 ? <><CheckCircle className="w-4 h-4" /> Completado</> : course.progress > 0 ? <><Play className="w-4 h-4" /> Continuar</> : <><Play className="w-4 h-4" /> Comenzar</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredCourses.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron cursos</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-3">
                {filteredVideos.map(video => (
                  <div key={video.id} onClick={() => handleVideoView(video.id)} className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 flex items-center gap-4 hover:border-purple-500/50 cursor-pointer transition-all">
                    <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{video.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {video.duration}</span>
                        <span>{video.views.toLocaleString()} vistas</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                ))}
                {filteredVideos.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron videos</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'glossary' && (
              <div className="space-y-3">
                {glossary.map((item, i) => (
                  <div key={i} className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{item.term}</h3>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-400">{item.definition}</p>
                  </div>
                ))}
                {glossary.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron términos</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
