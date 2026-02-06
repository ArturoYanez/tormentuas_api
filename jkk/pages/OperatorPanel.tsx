import React, { useState } from 'react';
import { Trophy, Plus, Edit, Trash2, Eye, Users, DollarSign, Calendar, Download, Award, Star, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Tournament {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Upcoming' | 'Finished';
  prizePool: number;
  entryFee: number;
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  rules: string;
  featured: boolean;
  category: 'Forex' | 'Crypto' | 'Stocks' | 'Mixed';
  rewards: { position: number; amount: number }[];
}

const OperatorPanel = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: 1,
      name: "Weekly Forex Challenge",
      description: "Compite semanalmente en el mercado de divisas por increíbles premios",
      status: 'Active',
      prizePool: 10000,
      entryFee: 0,
      participants: 487,
      maxParticipants: 1000,
      startDate: "2025-10-15",
      endDate: "2025-10-22",
      rules: "Trading competitivo con reglas estándar de forex, apalancamiento máximo 1:100",
      featured: true,
      category: 'Forex',
      rewards: [
        { position: 1, amount: 5000 },
        { position: 2, amount: 3000 },
        { position: 3, amount: 2000 }
      ]
    },
    {
      id: 2,
      name: "Crypto Masters Tournament",
      description: "El torneo mensual más prestigioso de trading de criptomonedas",
      status: 'Upcoming',
      prizePool: 25000,
      entryFee: 50,
      participants: 0,
      maxParticipants: 500,
      startDate: "2025-10-25",
      endDate: "2025-11-25",
      rules: "Trading de alto nivel con criptomonedas principales y altcoins seleccionadas",
      featured: true,
      category: 'Crypto',
      rewards: [
        { position: 1, amount: 12500 },
        { position: 2, amount: 7500 },
        { position: 3, amount: 5000 }
      ]
    },
    {
      id: 3,
      name: "Stock Market Sprint",
      description: "Trading rápido en el mercado de acciones estadounidenses",
      status: 'Active',
      prizePool: 5000,
      entryFee: 25,
      participants: 156,
      maxParticipants: 300,
      startDate: "2025-10-10",
      endDate: "2025-10-17",
      rules: "Solo acciones del S&P 500, operaciones intradía permitidas",
      featured: false,
      category: 'Stocks',
      rewards: [
        { position: 1, amount: 2500 },
        { position: 2, amount: 1500 },
        { position: 3, amount: 1000 }
      ]
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prizePool: '',
    entryFee: '',
    maxParticipants: '',
    startDate: '',
    endDate: '',
    rules: '',
    featured: false,
    category: 'Forex' as Tournament['category'],
    status: 'Upcoming' as Tournament['status'],
    rewards: [
      { position: 1, amount: 0 },
      { position: 2, amount: 0 },
      { position: 3, amount: 0 }
    ]
  });

  const handleCreateTournament = () => {
    if (!formData.name || !formData.prizePool || !formData.startDate || !formData.endDate) {
      toast({
        title: "⚠️ Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    const newTournament: Tournament = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      prizePool: parseFloat(formData.prizePool),
      entryFee: parseFloat(formData.entryFee) || 0,
      maxParticipants: parseInt(formData.maxParticipants) || 500,
      status: formData.status,
      participants: 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      rules: formData.rules,
      featured: formData.featured,
      category: formData.category,
      rewards: formData.rewards
    };

    setTournaments([...tournaments, newTournament]);
    setShowCreateDialog(false);
    resetForm();
    
    toast({
      title: "✨ Torneo creado exitosamente",
      description: `${newTournament.name} ha sido agregado a la plataforma.`,
    });
  };

  const handleUpdateTournament = () => {
    if (!editingTournament) return;

    setTournaments(tournaments.map(t => 
      t.id === editingTournament.id 
        ? {
            ...t,
            name: formData.name,
            description: formData.description,
            prizePool: parseFloat(formData.prizePool),
            entryFee: parseFloat(formData.entryFee),
            maxParticipants: parseInt(formData.maxParticipants) || t.maxParticipants,
            status: formData.status,
            startDate: formData.startDate,
            endDate: formData.endDate,
            rules: formData.rules,
            featured: formData.featured,
            category: formData.category,
            rewards: formData.rewards
          }
        : t
    ));

    setEditingTournament(null);
    resetForm();
    
    toast({
      title: "✅ Cambios guardados",
      description: "El torneo ha sido actualizado correctamente.",
    });
  };

  const handleDeleteTournament = (id: number) => {
    setTournaments(tournaments.filter(t => t.id !== id));
    toast({
      title: "🗑️ Torneo eliminado",
      description: "El torneo ha sido eliminado de la plataforma.",
      variant: "destructive"
    });
  };

  const toggleFeatured = (id: number) => {
    setTournaments(tournaments.map(t => 
      t.id === id ? { ...t, featured: !t.featured } : t
    ));
    
    const tournament = tournaments.find(t => t.id === id);
    toast({
      title: tournament?.featured ? "⭐ Destacado removido" : "⭐ Torneo destacado",
      description: tournament?.featured ? "El torneo ya no está destacado." : "El torneo ahora aparecerá como destacado.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      prizePool: '',
      entryFee: '',
      maxParticipants: '',
      startDate: '',
      endDate: '',
      rules: '',
      featured: false,
      category: 'Forex',
      status: 'Upcoming',
      rewards: [
        { position: 1, amount: 0 },
        { position: 2, amount: 0 },
        { position: 3, amount: 0 }
      ]
    });
  };

  const openEditDialog = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description,
      prizePool: tournament.prizePool.toString(),
      entryFee: tournament.entryFee.toString(),
      maxParticipants: tournament.maxParticipants.toString(),
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      rules: tournament.rules,
      featured: tournament.featured,
      category: tournament.category,
      status: tournament.status,
      rewards: tournament.rewards
    });
  };

  const stats = {
    activeTournaments: tournaments.filter(t => t.status === 'Active').length,
    totalParticipants: tournaments.reduce((sum, t) => sum + t.participants, 0),
    totalPrizePool: tournaments.reduce((sum, t) => sum + t.prizePool, 0),
    upcomingTournaments: tournaments.filter(t => t.status === 'Upcoming').length,
  };

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: Tournament['status']) => {
    const styles = {
      Active: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
      Upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
      Finished: 'bg-muted text-muted-foreground border-border hover:bg-muted'
    };
    return styles[status];
  };

  const getCategoryBadge = (category: Tournament['category']) => {
    const styles = {
      Forex: 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30',
      Crypto: 'bg-secondary/20 text-secondary border-secondary/30 hover:bg-secondary/30',
      Stocks: 'bg-accent/20 text-accent border-accent/30 hover:bg-accent/30',
      Mixed: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30'
    };
    return styles[category];
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground flex items-center gap-3">
              <span className="text-5xl">🎮</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Panel de Operador
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">Administra y gestiona todos los torneos de la plataforma</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                Crear Torneo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold flex items-center gap-2">
                  <span className="text-3xl">✨</span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Crear Nuevo Torneo
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="rewards">Premios</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Nombre del Torneo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-background border-border text-foreground mt-1"
                      placeholder="Ej: Weekly Forex Challenge"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-foreground">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="bg-background border-border text-foreground mt-1"
                      placeholder="Describe el torneo..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-foreground">Categoría *</Label>
                      <Select value={formData.category} onValueChange={(value: Tournament['category']) => setFormData({...formData, category: value})}>
                        <SelectTrigger className="bg-background border-border text-foreground mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Forex">💱 Forex</SelectItem>
                          <SelectItem value="Crypto">₿ Crypto</SelectItem>
                          <SelectItem value="Stocks">📈 Acciones</SelectItem>
                          <SelectItem value="Mixed">🎯 Mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-foreground">Estado *</Label>
                      <Select value={formData.status} onValueChange={(value: Tournament['status']) => setFormData({...formData, status: value})}>
                        <SelectTrigger className="bg-background border-border text-foreground mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Upcoming">🔵 Próximo</SelectItem>
                          <SelectItem value="Active">🟢 Activo</SelectItem>
                          <SelectItem value="Finished">⚫ Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="featured" className="text-foreground font-medium">Destacar torneo</Label>
                      <p className="text-sm text-muted-foreground">El torneo aparecerá en la portada</p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prizePool" className="text-foreground">Premio Total ($) *</Label>
                      <Input
                        id="prizePool"
                        type="number"
                        value={formData.prizePool}
                        onChange={(e) => setFormData({...formData, prizePool: e.target.value})}
                        className="bg-background border-border text-foreground mt-1"
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="entryFee" className="text-foreground">Entrada ($)</Label>
                      <Input
                        id="entryFee"
                        type="number"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
                        className="bg-background border-border text-foreground mt-1"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants" className="text-foreground">Máximo de Participantes</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                      className="bg-background border-border text-foreground mt-1"
                      placeholder="1000"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-foreground">Fecha Inicio *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-foreground">Fecha Fin *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rules" className="text-foreground">Reglas del Torneo</Label>
                    <Textarea
                      id="rules"
                      value={formData.rules}
                      onChange={(e) => setFormData({...formData, rules: e.target.value})}
                      className="bg-background border-border text-foreground mt-1"
                      placeholder="Describe las reglas y requisitos..."
                      rows={4}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="rewards" className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <p className="text-sm text-foreground">Configura la distribución de premios para las primeras 3 posiciones</p>
                  </div>
                  {formData.rewards.map((reward, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border">
                      <Award className={`w-8 h-8 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                      <div className="flex-1 space-y-1">
                        <Label className="text-foreground font-semibold">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} Posición #{reward.position}
                        </Label>
                        <Input
                          type="number"
                          value={reward.amount}
                          onChange={(e) => {
                            const newRewards = [...formData.rewards];
                            newRewards[idx].amount = parseFloat(e.target.value) || 0;
                            setFormData({...formData, rewards: newRewards});
                          }}
                          className="bg-background border-border text-foreground"
                          placeholder="Premio en $"
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreateTournament} className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Crear Torneo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 backdrop-blur hover:shadow-xl transition-all hover:scale-105 hover:border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Torneos Activos</p>
                  <p className="text-4xl font-bold text-foreground">{stats.activeTournaments}</p>
                  <p className="text-xs text-primary">En progreso</p>
                </div>
                <div className="bg-primary/20 p-4 rounded-xl">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border-secondary/20 backdrop-blur hover:shadow-xl transition-all hover:scale-105 hover:border-secondary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Total Participantes</p>
                  <p className="text-4xl font-bold text-foreground">{stats.totalParticipants}</p>
                  <p className="text-xs text-secondary">Jugadores activos</p>
                </div>
                <div className="bg-secondary/20 p-4 rounded-xl">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20 backdrop-blur hover:shadow-xl transition-all hover:scale-105 hover:border-accent/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Premio Total</p>
                  <p className="text-4xl font-bold text-foreground">${stats.totalPrizePool.toLocaleString()}</p>
                  <p className="text-xs text-accent">En premios</p>
                </div>
                <div className="bg-accent/20 p-4 rounded-xl">
                  <DollarSign className="w-8 h-8 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 backdrop-blur hover:shadow-xl transition-all hover:scale-105 hover:border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Próximos Torneos</p>
                  <p className="text-4xl font-bold text-foreground">{stats.upcomingTournaments}</p>
                  <p className="text-xs text-primary">Por iniciar</p>
                </div>
                <div className="bg-primary/20 p-4 rounded-xl">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments Table */}
        <Card className="bg-card/50 border-border backdrop-blur animate-fade-in shadow-2xl">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              Gestión de Torneos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Buscar torneos por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground h-11 focus:ring-2 focus:ring-primary"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-border text-foreground h-11">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Active">🟢 Activos</SelectItem>
                  <SelectItem value="Upcoming">🔵 Próximos</SelectItem>
                  <SelectItem value="Finished">⚫ Finalizados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-border text-foreground h-11">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="Forex">💱 Forex</SelectItem>
                  <SelectItem value="Crypto">₿ Crypto</SelectItem>
                  <SelectItem value="Stocks">📈 Acciones</SelectItem>
                  <SelectItem value="Mixed">🎯 Mixto</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="bg-background/50 border-border hover:bg-muted h-11 w-11">
                <Download className="w-5 h-5" />
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border overflow-hidden shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-border hover:bg-muted/50">
                    <TableHead className="text-foreground font-bold">Torneo</TableHead>
                    <TableHead className="text-foreground font-bold">Estado</TableHead>
                    <TableHead className="text-foreground font-bold">Categoría</TableHead>
                    <TableHead className="text-foreground font-bold">Participantes</TableHead>
                    <TableHead className="text-foreground font-bold">Premio</TableHead>
                    <TableHead className="text-foreground font-bold">Entrada</TableHead>
                    <TableHead className="text-foreground font-bold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTournaments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Trophy className="w-12 h-12 text-muted-foreground/50" />
                          <div>
                            <p className="font-semibold text-lg">No se encontraron torneos</p>
                            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTournaments.map((tournament) => (
                      <TableRow key={tournament.id} className="border-border hover:bg-muted/30 transition-all group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {tournament.featured && (
                              <div className="bg-yellow-500/20 p-1.5 rounded-lg">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              </div>
                            )}
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{tournament.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{tournament.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(tournament.status)}>
                            {tournament.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryBadge(tournament.category)}>
                            {tournament.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-foreground font-semibold">{tournament.participants}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-muted-foreground">{tournament.maxParticipants}</span>
                            </div>
                            <div className="space-y-1">
                              <Progress 
                                value={(tournament.participants / tournament.maxParticipants) * 100} 
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                {Math.round((tournament.participants / tournament.maxParticipants) * 100)}% completo
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-accent/20 p-1.5 rounded-lg">
                              <DollarSign className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-foreground font-bold text-lg">
                              ${tournament.prizePool.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground font-medium">
                            {tournament.entryFee === 0 ? 'Gratis' : `$${tournament.entryFee.toLocaleString()}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleFeatured(tournament.id)}
                              className="hover:bg-yellow-500/20 hover:text-yellow-500 transition-all"
                              title={tournament.featured ? "Quitar destacado" : "Destacar torneo"}
                            >
                              <Star className={`w-4 h-4 ${tournament.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setViewingTournament(tournament);
                                setShowViewDialog(true);
                              }}
                              className="hover:bg-primary/20 hover:text-primary transition-all"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openEditDialog(tournament)}
                                  className="hover:bg-secondary/20 hover:text-secondary transition-all"
                                  title="Editar torneo"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Edit className="w-6 h-6 text-secondary" />
                                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                      Editar Torneo
                                    </span>
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <Tabs defaultValue="basic" className="w-full">
                                  <TabsList className="grid w-full grid-cols-3 bg-muted">
                                    <TabsTrigger value="basic">Básico</TabsTrigger>
                                    <TabsTrigger value="details">Detalles</TabsTrigger>
                                    <TabsTrigger value="rewards">Premios</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="basic" className="space-y-4 mt-4">
                                    <div>
                                      <Label htmlFor="edit-name" className="text-foreground">Nombre del Torneo *</Label>
                                      <Input
                                        id="edit-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="bg-background border-border text-foreground mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-description" className="text-foreground">Descripción</Label>
                                      <Textarea
                                        id="edit-description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="bg-background border-border text-foreground mt-1"
                                        rows={3}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-foreground">Categoría</Label>
                                        <Select value={formData.category} onValueChange={(value: Tournament['category']) => setFormData({...formData, category: value})}>
                                          <SelectTrigger className="bg-background border-border mt-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-card border-border">
                                            <SelectItem value="Forex">💱 Forex</SelectItem>
                                            <SelectItem value="Crypto">₿ Crypto</SelectItem>
                                            <SelectItem value="Stocks">📈 Acciones</SelectItem>
                                            <SelectItem value="Mixed">🎯 Mixto</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label className="text-foreground">Estado</Label>
                                        <Select value={formData.status} onValueChange={(value: Tournament['status']) => setFormData({...formData, status: value})}>
                                          <SelectTrigger className="bg-background border-border mt-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-card border-border">
                                            <SelectItem value="Upcoming">Próximo</SelectItem>
                                            <SelectItem value="Active">Activo</SelectItem>
                                            <SelectItem value="Finished">Finalizado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                      <Label className="text-foreground">Destacar torneo</Label>
                                      <Switch
                                        checked={formData.featured}
                                        onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                                      />
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="details" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-foreground">Premio Total ($)</Label>
                                        <Input
                                          type="number"
                                          value={formData.prizePool}
                                          onChange={(e) => setFormData({...formData, prizePool: e.target.value})}
                                          className="bg-background border-border mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-foreground">Entrada ($)</Label>
                                        <Input
                                          type="number"
                                          value={formData.entryFee}
                                          onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
                                          className="bg-background border-border mt-1"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-foreground">Máximo de Participantes</Label>
                                      <Input
                                        type="number"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                                        className="bg-background border-border mt-1"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-foreground">Fecha Inicio</Label>
                                        <Input
                                          type="date"
                                          value={formData.startDate}
                                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                          className="bg-background border-border mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-foreground">Fecha Fin</Label>
                                        <Input
                                          type="date"
                                          value={formData.endDate}
                                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                          className="bg-background border-border mt-1"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-foreground">Reglas</Label>
                                      <Textarea
                                        value={formData.rules}
                                        onChange={(e) => setFormData({...formData, rules: e.target.value})}
                                        className="bg-background border-border mt-1"
                                        rows={4}
                                      />
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="rewards" className="space-y-4 mt-4">
                                    {formData.rewards.map((reward, idx) => (
                                      <div key={idx} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                        <Award className={`w-8 h-8 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                                        <div className="flex-1">
                                          <Label className="text-foreground">
                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} Posición #{reward.position}
                                          </Label>
                                          <Input
                                            type="number"
                                            value={reward.amount}
                                            onChange={(e) => {
                                              const newRewards = [...formData.rewards];
                                              newRewards[idx].amount = parseFloat(e.target.value) || 0;
                                              setFormData({...formData, rewards: newRewards});
                                            }}
                                            className="bg-background border-border mt-1"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </TabsContent>
                                </Tabs>
                                
                                <div className="flex gap-3 pt-4">
                                  <Button variant="outline" onClick={() => setEditingTournament(null)} className="flex-1">
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleUpdateTournament} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                                    Guardar Cambios
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="hover:bg-destructive/20 hover:text-destructive transition-all"
                                  title="Eliminar torneo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground text-xl">¿Eliminar torneo?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Esta acción no se puede deshacer. El torneo <strong>"{tournament.name}"</strong> será eliminado permanentemente de la plataforma.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-muted text-foreground border-border hover:bg-muted/80">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTournament(tournament.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-3xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                Detalles del Torneo
              </DialogTitle>
            </DialogHeader>
            {viewingTournament && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="text-lg font-semibold text-foreground">{viewingTournament.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge className={getStatusBadge(viewingTournament.status)}>{viewingTournament.status}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-foreground">{viewingTournament.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Premio Total</p>
                    <p className="text-2xl font-bold text-accent">${viewingTournament.prizePool.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Entrada</p>
                    <p className="text-2xl font-bold text-foreground">
                      {viewingTournament.entryFee === 0 ? 'Gratis' : `$${viewingTournament.entryFee}`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Participantes</p>
                    <p className="text-lg font-semibold text-foreground">
                      {viewingTournament.participants} / {viewingTournament.maxParticipants}
                    </p>
                    <Progress value={(viewingTournament.participants / viewingTournament.maxParticipants) * 100} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <Badge className={getCategoryBadge(viewingTournament.category)}>{viewingTournament.category}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reglas</p>
                  <p className="text-foreground">{viewingTournament.rules}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground font-semibold">Distribución de Premios</p>
                  {viewingTournament.rewards.map((reward, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className={`w-6 h-6 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                        <span className="text-foreground font-medium">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} Posición #{reward.position}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-accent">${reward.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OperatorPanel;
