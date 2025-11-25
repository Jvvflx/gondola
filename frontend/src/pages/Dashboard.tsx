import { useQuery } from '@tanstack/react-query';
import { metricsAPI, aiAPI } from '../lib/api';
import { BarChart3, TrendingUp, AlertTriangle, Package, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { data: metrics } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: metricsAPI.getDashboard,
    });

    const { data: salesHistory } = useQuery({
        queryKey: ['sales-history'],
        queryFn: () => metricsAPI.getSalesHistory(30),
    });

    const { data: insights } = useQuery({
        queryKey: ['ai-insights'],
        queryFn: aiAPI.getInsights,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Última atualização: {new Date().toLocaleString('pt-BR')}
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total de Produtos"
                    value={metrics?.totalProducts || 0}
                    icon={<Package className="w-6 h-6" />}
                    color="blue"
                />
                <MetricCard
                    title="Vendas Realizadas"
                    value={metrics?.totalSales || 0}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="green"
                />
                <MetricCard
                    title="Alertas de Ruptura"
                    value={metrics?.ruptureAlerts || 0}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    color="red"
                />
                <MetricCard
                    title="Alertas de Validade"
                    value={metrics?.validityAlerts || 0}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    color="orange"
                />
            </div>

            {/* Sales Chart */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Histórico de Vendas (30 dias)
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesHistory || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Insights */}
            {insights && (
                <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Insights de IA
                    </h2>
                    <p className="text-gray-700 mb-4">{insights.summary}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-sm text-gray-600 mb-2">Métricas-Chave</h3>
                            <ul className="space-y-1">
                                {insights.keyMetrics?.map((metric: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700">• {metric}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-gray-600 mb-2">Recomendações</h3>
                            <ul className="space-y-1">
                                {insights.recommendations?.map((rec: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700">• {rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ title, value, icon, color }: any) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
