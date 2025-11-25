import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Clock, Calendar, AlertCircle } from 'lucide-react';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: File[], period: string) => Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [period, setPeriod] = useState<string>('day');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            await onUpload(files, period);
            onClose();
            setFiles([]);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                        <Upload size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Upload de Dados</h2>
                        <p className="text-xs text-zinc-400">Importe seus arquivos CSV para análise.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* File Selection */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Arquivos CSV</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-800/50 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
                        >
                            <input
                                type="file"
                                multiple
                                accept=".csv"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <FileSpreadsheet size={32} className="text-zinc-600 group-hover:text-brand-500 transition-colors mb-3" />
                            <div className="text-sm text-zinc-300 font-medium">
                                {files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : 'Clique para selecionar arquivos'}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                                {files.length > 0 ? (
                                    <ul className="mt-2 space-y-1">
                                        {files.slice(0, 3).map((f, i) => (
                                            <li key={i} className="text-zinc-400">{f.name}</li>
                                        ))}
                                        {files.length > 3 && <li>...</li>}
                                    </ul>
                                ) : 'Suporta múltiplos arquivos'}
                            </div>
                        </div>
                    </div>

                    {/* Period Selection */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Intervalo entre Arquivos</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setPeriod('hour')}
                                className={`flex flex-col items-center justify-center p-3 rounded border transition-all ${period === 'hour'
                                    ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                    }`}
                            >
                                <Clock size={16} className="mb-1" />
                                <span className="text-xs font-bold">1 Hora</span>
                            </button>
                            <button
                                onClick={() => setPeriod('day')}
                                className={`flex flex-col items-center justify-center p-3 rounded border transition-all ${period === 'day'
                                    ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                    }`}
                            >
                                <Calendar size={16} className="mb-1" />
                                <span className="text-xs font-bold">1 Dia</span>
                            </button>
                            <button
                                onClick={() => setPeriod('month')}
                                className={`flex flex-col items-center justify-center p-3 rounded border transition-all ${period === 'month'
                                    ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                    }`}
                            >
                                <Calendar size={16} className="mb-1" />
                                <span className="text-xs font-bold">1 Mês</span>
                            </button>
                        </div>
                        <div className="mt-3 flex items-start gap-2 text-xs text-zinc-500 bg-zinc-950 p-3 rounded border border-zinc-800">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <p>
                                Os arquivos serão processados sequencialmente. O último arquivo será considerado "Hoje".
                                {period === 'day' && ' Ex: 7 arquivos = Histórico de 7 dias.'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={files.length === 0 || isUploading}
                        className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                Processando...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Iniciar Importação
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
