import { useQuery } from '@tanstack/react-query';
import { aiAPI } from '../lib/api';
import { Sparkles, TrendingDown, AlertCircle } from 'lucide-react';

export default function Promotions() {
    const { data: suggestions, isLoading } = useQuery({
        queryKey: ['promotion-suggestions'],
        queryFn: aiAPI.getPromotionSuggestions,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    Sugestões de Promoção
                </h1>
            </div>

            <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <p className="text-gray-700">
                    <strong>IA Generativa:</strong> Estas sugestões foram geradas automaticamente com base em análise de estoque,
                    validade e histórico de vendas usando inteligência artificial.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Gerando sugestões com IA...</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {suggestions?.map((suggestion: any, index: number) => (
                        <PromotionCard key={index} suggestion={suggestion} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PromotionCard({ suggestion }: any) {
    const priorityColors = {
        high: 'border-red-300 bg-red-50',
        medium: 'border-orange-300 bg-orange-50',
        low: 'border-yellow-300 bg-yellow-50',
    };

    const priorityLabels = {
        high: 'Alta Prioridade',
        medium: 'Média Prioridade',
        low: 'Baixa Prioridade',
    };

    return (
        <div className={`card border-2 ${priorityColors[suggestion.priority as keyof typeof priorityColors]}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">{suggestion.productName}</h3>
                    <p className="text-sm text-gray-600">SKU: {suggestion.sku}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${suggestion.priority === 'high' ? 'bg-red-200 text-red-800' :
                    suggestion.priority === 'medium' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                    }`}>
                    {priorityLabels[suggestion.priority as keyof typeof priorityLabels]}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                    <span>{suggestion.reason}</span>
                </div>

                <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">
                        Desconto Sugerido: {suggestion.suggestedDiscount}%
                    </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Insight de IA:</p>
                            <p className="text-sm text-gray-600">{suggestion.aiInsight}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button className="btn-primary flex-1">
                        Criar Promoção
                    </button>
                    <button className="btn-secondary">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        </div>
    );
}
