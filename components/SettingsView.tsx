import React, { useState } from 'react';
import { Trash2, Save, Database, Key } from 'lucide-react';

const SettingsView: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [isClearing, setIsClearing] = useState(false);

    const handleClearData = async () => {
        if (!confirm('Tem certeza? Isso apagará TODOS os dados do dashboard (produtos, vendas, estoque).')) {
            return;
        }

        setIsClearing(true);
        try {
            const response = await fetch('http://localhost:3001/admin/clear-data', {
                method: 'POST'
            });

            if (response.ok) {
                alert('Dados limpos com sucesso! O dashboard agora está zerado.');
                window.location.reload(); // Reload to reflect empty state
            } else {
                alert('Erro ao limpar dados.');
            }
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('Erro de conexão.');
        } finally {
            setIsClearing(false);
        }
    };

    const handleSaveConfig = () => {
        // In a real app, save to backend or localStorage
        localStorage.setItem('gondola_api_key', apiKey);
        alert('Configurações salvas com sucesso!');
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Configurações do Sistema</h2>
                <p className="text-zinc-400 text-sm">Gerencie suas integrações e dados.</p>
            </div>

            {/* Data Management Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <Database size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Gerenciamento de Dados</h3>
                        <p className="text-zinc-400 text-sm mt-1">
                            Use esta opção para resetar o dashboard para o estado inicial (zerado).
                            Útil para demonstrações ou reiniciar a importação.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleClearData}
                    disabled={isClearing}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded transition-colors text-sm font-bold"
                >
                    {isClearing ? 'Limpando...' : (
                        <>
                            <Trash2 size={16} />
                            Limpar Todos os Dados
                        </>
                    )}
                </button>
            </div>

            {/* Integration Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                        <Key size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Integração ERP</h3>
                        <p className="text-zinc-400 text-sm mt-1">
                            Configure a chave de API para conectar diretamente ao seu sistema de estoque.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk_live_..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleSaveConfig}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-black px-4 py-2 rounded transition-colors text-sm font-bold"
                    >
                        <Save size={16} />
                        Salvar Configuração
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
