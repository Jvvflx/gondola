import React, { useEffect, useState } from 'react';
import { TrendingDown, CheckCircle2, Sparkles, BrainCircuit, ArrowRight } from 'lucide-react';

interface Prediction {
    id: number;
    product_id: string;
    product_name: string;
    category: string;
    price: string;
    cost: string;
    prediction_date: string;
    status: string;
    suggested_action: string;
    confidence_score: string;
    details: any;
}

const PredictionsView: React.FC = () => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState<number | null>(null);
    const [resolvedIds, setResolvedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard/predictions');
            if (response.ok) {
                const data = await response.json();
                setPredictions(data);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = (id: number) => {
        setResolvingId(id);
        // Simulate API call to apply suggestion
        setTimeout(() => {
            setResolvingId(null);
            setResolvedIds(prev => [...prev, id]);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BrainCircuit className="text-brand-500" />
                    Predições & Resolução
                    <span className="bg-brand-500/20 text-brand-400 text-xs px-2 py-1 rounded-full border border-brand-500/30">
                        {predictions.length - resolvedIds.length} Ativos
                    </span>
                </h2>
                <div className="text-xs text-zinc-500">
                    Baseado em análise de 4+ períodos
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Analisando padrões de venda...</div>
                ) : predictions.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                        <BrainCircuit className="mx-auto mb-3 text-zinc-700" size={48} />
                        <p>Nenhuma predição de risco encontrada.</p>
                        <p className="text-xs mt-1">Seus produtos estão vendendo conforme o esperado.</p>
                    </div>
                ) : (
                    predictions.map((pred) => {
                        const isResolved = resolvedIds.includes(pred.id);
                        const details = pred.details || {};
                        const confidence = parseFloat(pred.confidence_score) * 100;

                        return (
                            <div key={pred.id} className={`bg-zinc-900 border ${isResolved ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-800'} p-6 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-zinc-700 transition-all`}>
                                <div className="flex items-start gap-5 mb-4 md:mb-0">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${isResolved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-brand-500/10 border-brand-500/30 text-brand-500'}`}>
                                        {isResolved ? <CheckCircle2 size={24} /> : <TrendingDown size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-zinc-200 text-lg">{pred.product_name}</h3>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                Confiança: {confidence.toFixed(0)}%
                                            </span>
                                            {details.total_sold !== undefined && (
                                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    BAIXO GIRO
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-zinc-400 text-sm max-w-2xl">{pred.suggested_action}</p>

                                        {details.days_to_sell_out && (
                                            <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-zinc-600">Venda estimada:</span>
                                                    <span className="text-zinc-300">{Math.round(details.days_to_sell_out)} dias</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-zinc-600">Validade:</span>
                                                    <span className="text-red-400">{details.days_until_expiry} dias</span>
                                                </div>
                                            </div>
                                        )}

                                        {details.total_sold !== undefined && (
                                            <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-zinc-600">Vendas (Período):</span>
                                                    <span className="text-red-400 font-bold">{details.total_sold} un.</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-zinc-600">Estoque Parado:</span>
                                                    <span className="text-zinc-300">{details.stock} un.</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isResolved ? (
                                    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded border border-emerald-500/20">
                                        <CheckCircle2 size={16} />
                                        <span className="text-sm font-bold">Resolvido</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleResolve(pred.id)}
                                        disabled={resolvingId === pred.id}
                                        className="bg-brand-600 hover:bg-brand-500 text-black font-bold text-sm px-6 py-3 rounded flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                                    >
                                        {resolvingId === pred.id ? (
                                            <span className="animate-pulse">Aplicando...</span>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                Resolver Agora
                                                <ArrowRight size={16} className="opacity-60" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PredictionsView;
