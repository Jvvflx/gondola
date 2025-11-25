import { useQuery } from '@tanstack/react-query';
import { metricsAPI } from '../lib/api';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Products() {
    const { data: ruptureAlerts } = useQuery({
        queryKey: ['rupture-alerts'],
        queryFn: metricsAPI.getRuptureAlerts,
    });

    const { data: excessAlerts } = useQuery({
        queryKey: ['excess-alerts'],
        queryFn: metricsAPI.getExcessAlerts,
    });

    const { data: validityAlerts } = useQuery({
        queryKey: ['validity-alerts'],
        queryFn: metricsAPI.getValidityAlerts,
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8" />
                Gestão de Produtos
            </h1>

            {/* Rupture Alerts */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas de Ruptura ({ruptureAlerts?.length || 0})
                </h2>
                <div className="space-y-2">
                    {ruptureAlerts?.slice(0, 5).map((alert: any) => (
                        <AlertCard key={alert.productId} alert={alert} />
                    ))}
                </div>
            </div>

            {/* Excess Stock */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-600">
                    <TrendingUp className="w-5 h-5" />
                    Excesso de Estoque ({excessAlerts?.length || 0})
                </h2>
                <div className="space-y-2">
                    {excessAlerts?.slice(0, 5).map((alert: any) => (
                        <AlertCard key={alert.productId} alert={alert} />
                    ))}
                </div>
            </div>

            {/* Validity Alerts */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas de Validade ({validityAlerts?.length || 0})
                </h2>
                <div className="space-y-2">
                    {validityAlerts?.slice(0, 5).map((alert: any) => (
                        <AlertCard key={alert.productId} alert={alert} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function AlertCard({ alert }: any) {
    const severityColors = {
        high: 'border-l-4 border-l-red-500 bg-red-50',
        medium: 'border-l-4 border-l-orange-500 bg-orange-50',
        low: 'border-l-4 border-l-yellow-500 bg-yellow-50',
    };

    return (
        <div className={`p-4 rounded-lg ${severityColors[alert.severity as keyof typeof severityColors]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">{alert.productName}</h3>
                    <p className="text-sm text-gray-600">SKU: {alert.sku}</p>
                    <p className="text-sm text-gray-700 mt-1">{alert.reason}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Estoque Atual</p>
                    <p className="text-2xl font-bold text-gray-900">{alert.currentStock}</p>
                </div>
            </div>
        </div>
    );
}
