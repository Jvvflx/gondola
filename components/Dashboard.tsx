import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    Bell,
    Settings,
    LogOut,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Search,
    Sparkles,
    CheckCircle2,
    Lightbulb,
    BrainCircuit
} from 'lucide-react';
import StockView from './StockView';
import AlertsView from './AlertsView';
import InsightsView from './InsightsView';
import PredictionsView from './PredictionsView';

import SettingsView from './SettingsView';
import UploadModal from './UploadModal';

interface DashboardProps {
    onLogout: () => void;
}

type Tab = 'overview' | 'stock' | 'alerts' | 'insights' | 'resolver' | 'settings';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [alerts, setAlerts] = useState<any[]>([]);
    const [stats, setStats] = useState({
        stockValue: 0,
        salesToday: 0,
        alertsCount: 0
    });
    const [predictions, setPredictions] = useState<any[]>([]);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch Overview Stats
            const statsRes = await fetch('http://localhost:3001/dashboard/overview');
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            // Fetch Alerts
            const alertsRes = await fetch('http://localhost:3001/dashboard/alerts');
            if (alertsRes.ok) {
                const data = await alertsRes.json();
                setAlerts(data);
            }

            // Fetch Predictions
            const predsRes = await fetch('http://localhost:3001/dashboard/predictions');
            if (predsRes.ok) {
                const data = await predsRes.json();
                setPredictions(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleAction = (id: string) => {
        setGeneratingId(id);
        setTimeout(() => {
            setGeneratingId(null);
            // Optimistic update
            setAlerts(prev => prev.map(item => item.id === id ? { ...item, status: 'RESOLVED' } : item));
        }, 1500);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'stock':
                return <StockView />;
            case 'alerts':
                return <AlertsView />;
            case 'insights':
                return <InsightsView />;
            case 'resolver':
                return <PredictionsView />;
            case 'settings':
                return <SettingsView />;
            case 'overview':
            default:
                return renderOverview();
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={64} />
                    </div>
                    <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Vendas Hoje</div>
                    <div className="text-3xl font-bold text-white tracking-tight">
                        R$ {stats.salesToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-2 text-xs text-brand-500 flex items-center gap-1">
                        <TrendingUp size={12} />
                        +15% vs ontem
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={64} />
                    </div>
                    <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Alertas Ativos</div>
                    <div className="text-3xl font-bold text-white tracking-tight">
                        {alerts.length} <span className="text-base text-zinc-500 font-normal">Alertas</span>
                    </div>
                    <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Ação necessária
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={64} />
                    </div>
                    <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Valor em Estoque</div>
                    <div className="text-3xl font-bold text-white tracking-tight">
                        R$ {stats.stockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1">
                        Atualizado agora
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Feed de Alertas */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            Alertas Recentes
                        </h3>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className="text-xs text-brand-500 hover:underline"
                        >
                            Ver todos
                        </button>
                    </div>

                    <div className="divide-y divide-zinc-800">
                        {alerts.slice(0, 5).map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded flex items-center justify-center border ${item.status === 'RESOLVED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                                        item.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                        }`}>
                                        {item.status === 'RESOLVED' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-zinc-200">{item.productName}</div>
                                        <div className="text-xs text-zinc-500 mt-0.5">
                                            {item.message}
                                        </div>
                                    </div>
                                </div>

                                {item.status !== 'RESOLVED' ? (
                                    <button
                                        onClick={() => handleAction(item.id)}
                                        disabled={generatingId === item.id}
                                        className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded flex items-center gap-2 transition-all"
                                    >
                                        {generatingId === item.id ? (
                                            <span className="animate-pulse">Gerando...</span>
                                        ) : (
                                            <>
                                                <Sparkles size={12} className="text-brand-500" />
                                                Criar Oferta
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-emerald-500 px-3 py-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                                        OFERTA ATIVA
                                    </span>
                                )}
                            </div>
                        ))}
                        {alerts.length === 0 && (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                                Tudo certo! Nenhum alerta no momento.
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel Stats */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                        <h4 className="text-xs font-bold uppercase text-zinc-500 mb-4">Eficiência da IA</h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-zinc-300">Margem Recuperada</span>
                                    <span className="text-brand-500 font-bold">0%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-500 w-[0%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-zinc-300">Redução de Quebra</span>
                                    <span className="text-brand-500 font-bold">0%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-500 w-[0%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold uppercase text-zinc-500">PREDIÇÕES</h4>
                            <button onClick={() => setActiveTab('resolver')} className="text-[10px] text-brand-500 hover:underline">Ver todas</button>
                        </div>
                        <ul className="space-y-3 text-sm">
                            {predictions.length === 0 ? (
                                <li className="text-zinc-500 text-xs italic">Nenhuma predição de risco no momento.</li>
                            ) : (
                                predictions.slice(0, 3).map((pred, idx) => (
                                    <li key={idx} className="flex flex-col gap-1 text-zinc-400 border-l-2 border-brand-500/30 pl-3 py-1">
                                        <span className="font-bold text-zinc-300 text-xs">{pred.product_name}</span>
                                        <span className="text-[10px] leading-tight">{pred.suggested_action.split('.')[0]}...</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono flex">
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={async (files, period) => {
                    const formData = new FormData();
                    files.forEach(file => formData.append('files', file));
                    formData.append('period', period);

                    try {
                        const response = await fetch('http://localhost:3001/upload', {
                            method: 'POST',
                            body: formData
                        });

                        if (response.ok) {
                            const data = await response.json();
                            alert(`Sucesso! ${data.count} registros processados.`);
                            fetchDashboardData();
                        } else {
                            const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                            alert(`Erro ao enviar CSVs: ${errorData.error || 'Erro interno'}`);
                        }
                    } catch (error) {
                        console.error('Error uploading CSV:', error);
                        alert('Erro de conexão.');
                    }
                }}
            />

            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-brand-500">
                        <div className="w-8 h-8 bg-brand-500/20 rounded flex items-center justify-center">
                            <span className="font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold tracking-tight text-white">Gôndola OS</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold px-3 mb-2">Principal</div>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded border transition-colors ${activeTab === 'overview'
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent'
                            }`}
                    >
                        <LayoutDashboard size={18} />
                        <span className="font-bold text-sm">Visão Geral</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded border transition-colors ${activeTab === 'stock'
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent'
                            }`}
                    >
                        <Package size={18} />
                        <span className="font-medium text-sm">Estoque</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded border transition-colors justify-between ${activeTab === 'alerts'
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Bell size={18} />
                            <span className="font-medium text-sm">Alertas</span>
                        </div>
                        {alerts.length > 0 && (
                            <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {alerts.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded border transition-colors ${activeTab === 'insights'
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent'
                            }`}
                    >
                        <Lightbulb size={18} />
                        <span className="font-medium text-sm">Insights AI</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('resolver')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded border transition-colors ${activeTab === 'resolver'
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent'
                            }`}
                    >
                        <BrainCircuit size={18} />
                        <span className="font-medium text-sm">Resolver (IA)</span>
                    </button>

                    <div className="text-[10px] text-zinc-500 uppercase font-bold px-3 mt-6 mb-2">Sistema</div>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded border transition-colors ${activeTab === 'settings'
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent'
                            }`}
                    >
                        <Settings size={18} />
                        <span className="font-medium text-sm">Configurações</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700"></div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold truncate">Loja Centro</div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full mt-2 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors py-2"
                    >
                        <LogOut size={14} />
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Topbar */}
                <header className="h-16 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between px-6 backdrop-blur-sm">
                    <div className="flex items-center gap-4 text-zinc-400">
                        <span className="text-xs uppercase font-bold tracking-widest text-zinc-600">Dashboard // V.2.4.0</span>
                    </div>
                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-brand-600 hover:bg-brand-500 text-black font-bold text-xs px-4 py-2 rounded transition-colors mr-4"
                        >
                            Upload CSV
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                            <input
                                type="text"
                                placeholder="Buscar SKU..."
                                className="bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-brand-500 transition-colors w-64 placeholder:text-zinc-700"
                            />
                        </div>
                        <button className="w-8 h-8 rounded border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400">
                            <Bell size={16} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </div>
            </main>
        </div >
    );
};

export default Dashboard;