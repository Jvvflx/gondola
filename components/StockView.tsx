import React, { useEffect, useState } from 'react';
import { Search, Package, AlertTriangle } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: string;
    cost: string;
    category: string;
    stock: number;
    next_expiry_date: string | null;
}

const StockView: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gestão de Estoque</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-brand-500 w-64"
                    />
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Produto</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Preço</th>
                            <th className="px-6 py-4">Custo</th>
                            <th className="px-6 py-4">Estoque</th>
                            <th className="px-6 py-4">Validade</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                    Carregando estoque...
                                </td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                    Nenhum produto encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-200">{product.name}</td>
                                    <td className="px-6 py-4 text-zinc-400">{product.category || '-'}</td>
                                    <td className="px-6 py-4 text-zinc-300">R$ {Number(product.price).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-zinc-500">R$ {Number(product.cost).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${(product.stock || 0) < 10 ? 'text-red-400' : 'text-zinc-300'
                                                }`}>
                                                {product.stock || 0}
                                            </span>
                                            {(product.stock || 0) < 10 && (
                                                <AlertTriangle size={14} className="text-red-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {product.next_expiry_date ? new Date(product.next_expiry_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${(product.stock || 0) < 10
                                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                            }`}>
                                            {(product.stock || 0) < 10 ? 'Crítico' : 'Normal'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockView;
