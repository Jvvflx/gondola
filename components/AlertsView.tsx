import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Sparkles, Filter } from 'lucide-react';

interface Alert {
    id: string;
    type: 'ruptura' | 'validade';
    message: string;
    severity: 'high' | 'medium' | 'low';
    productName: string;
    stock: number;
    expiry: string | null;
    status?: 'PENDING' | 'RESOLVED';
}

const AlertsView: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'ruptura' | 'validade'>('all');
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard/alerts');
            if (response.ok) {
                const data = await response.json();
                setAlerts(data.map((a: any) => ({ ...a, status: 'PENDING' })));
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(id);
    };

    const handleApplySuggestion = (id: string, suggestion: string) => {
        setGeneratingId(id);
        // Simulate AI action
        setTimeout(() => {
            setGeneratingId(null);
            setExpandedId(null);
            setAlerts(prev => prev.map(item => item.id === id ? { ...item, status: 'RESOLVED' } : item));
        }, 1500);
    };

    const filteredAlerts = alerts.filter(a => filter === 'all' || a.type === filter);

    const getSuggestions = (alert: Alert) => {
        if (alert.type === 'validade') {
            return [
                { title: 'Promoção Relâmpago', desc: 'Aplicar 30% de desconto imediato', action: 'Aplicar 30% OFF' },
                { title: 'Bundle', desc: 'Juntar com produto de alta saída', action: 'Criar Kit' },
                { title: 'Doação', desc: 'Destinar para banco de alimentos', action: 'Registrar Doação' }
            ];
        }
        return [
            { title: 'Pedido de Reposição', desc: 'Solicitar urgência ao fornecedor', action: 'Gerar Pedido' },
            { title: 'Ajuste de Preço', desc: 'Aumentar preço temporariamente', action: 'Ajustar Preço' },
            { title: 'Transferência', desc: 'Verificar estoque em outras lojas', action: 'Verificar Lojas' }
        ];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    Central de Alertas
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {alerts.filter(a => a.status !== 'RESOLVED').length}
                    </span>
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded text-xs font-bold transition-colors ${filter === 'all' ? 'bg-brand-600 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('validade')}
                        className={`px-4 py-2 rounded text-xs font-bold transition-colors ${filter === 'validade' ? 'bg-brand-600 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        Validade
                    </button>
                    <button
                        onClick={() => setFilter('ruptura')}
                        className={`px-4 py-2 rounded text-xs font-bold transition-colors ${filter === 'ruptura' ? 'bg-brand-600 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        Ruptura
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Carregando alertas...</div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">Nenhum alerta encontrado.</div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div key={alert.id} className={`bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all ${expandedId === alert.id ? 'ring-1 ring-brand-500' : 'hover:border-zinc-700'}`}>
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-start gap-5">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${alert.status === 'RESOLVED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                                        alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                        }`}>
                                        {alert.status === 'RESOLVED' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-zinc-200 text-lg">{alert.productName}</h3>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                {alert.type}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 text-sm">{alert.message}</p>
                                        {alert.expiry && (
                                            <div className="mt-2 text-xs text-zinc-500">
                                                Vencimento: <span className="text-zinc-300">{alert.expiry}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {alert.status !== 'RESOLVED' ? (
                                    <button
                                        onClick={() => handleAction(alert.id)}
                                        className={`border border-zinc-700 text-zinc-300 text-sm px-4 py-2 rounded flex items-center gap-2 transition-all ${expandedId === alert.id ? 'bg-zinc-800 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                                    >
                                        <Sparkles size={16} className="text-brand-500" />
                                        {expandedId === alert.id ? 'Fechar Opções' : 'Criar Oferta'}
                                    </button>
                                ) : (
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-emerald-500 block">RESOLVIDO</span>
                                        <span className="text-[10px] text-zinc-500">Ação tomada automaticamente</span>
                                    </div>
                                )}
                            </div>

                            {/* Expanded Area */}
                            {expandedId === alert.id && alert.status !== 'RESOLVED' && (
                                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                                    <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50">
                                        <h4 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                                            <Sparkles size={14} />
                                            Sugestões da IA para resolver este problema:
                                        </h4>
                                        <div className="grid md:grid-cols-3 gap-3">
                                            {getSuggestions(alert).map((sugg, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleApplySuggestion(alert.id, sugg.action)}
                                                    disabled={generatingId === alert.id}
                                                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-brand-500/50 p-3 rounded text-left transition-all group relative overflow-hidden"
                                                >
                                                    {generatingId === alert.id && (
                                                        <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center z-10">
                                                            <span className="animate-pulse text-xs font-bold text-brand-500">Aplicando...</span>
                                                        </div>
                                                    )}
                                                    <div className="font-bold text-zinc-200 text-sm mb-1 group-hover:text-brand-400">{sugg.title}</div>
                                                    <div className="text-xs text-zinc-500 mb-3">{sugg.desc}</div>
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-500/10 inline-block px-2 py-1 rounded">
                                                        {sugg.action}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertsView;
