import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface Recommendation {
    productId: string;
    suggestion: string;
    discount: number;
}

interface InsightsData {
    id: number;
    content: {
        summary: string;
        recommendations: Recommendation[];
    };
    created_at: string;
}

const InsightsView: React.FC = () => {
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard/insights');
            if (response.ok) {
                const data = await response.json();
                setInsights(data);
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12 text-zinc-500">Carregando insights da IA...</div>;
    }

    if (!insights) {
        return (
            <div className="text-center py-12 text-zinc-500">
                <Sparkles size={48} className="mx-auto mb-4 text-zinc-700" />
                <p>Nenhum insight gerado ainda.</p>
                <p className="text-xs mt-2">A análise roda automaticamente a cada 6 horas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-brand-500" />
                        Insights Mangaba AI
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">
                        Gerado em: {new Date(insights.created_at).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-2">Resumo da Análise</h3>
                <p className="text-zinc-300 leading-relaxed">
                    {insights.content.summary}
                </p>
            </div>

            {/* Recommendations Grid */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand-500" />
                    Recomendações de Ação
                </h3>

                <div className="grid gap-4">
                    {insights.content.recommendations.length === 0 ? (
                        <div className="text-zinc-500 italic">Nenhuma recomendação específica no momento.</div>
                    ) : (
                        insights.content.recommendations.map((rec, index) => (
                            <div key={index} className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg hover:border-brand-500/50 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-black transition-colors">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-zinc-200">Sugestão de Promoção</h4>
                                            <span className="text-xs font-bold bg-brand-500/20 text-brand-400 px-2 py-1 rounded">
                                                {rec.productId}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 text-sm mb-4">
                                            {rec.suggestion}
                                        </p>
                                        <button className="text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded flex items-center gap-2 transition-colors">
                                            Aplicar Sugestão
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InsightsView;
