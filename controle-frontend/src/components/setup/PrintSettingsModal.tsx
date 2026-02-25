import { useState } from 'react';
import { X, Printer, Save } from 'lucide-react';
import { getPrintSettings, savePrintSettings, type PrintSettings } from '../../utils/printReceipt';

interface PrintSettingsModalProps {
    lojaId: string;
    lojaNome: string;
    onClose: () => void;
}

export function PrintSettingsModal({ lojaId, lojaNome, onClose }: PrintSettingsModalProps) {
    const [settings, setSettings] = useState<PrintSettings>(() => getPrintSettings(lojaId));
    
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        savePrintSettings(lojaId, settings);
        
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gray-50 border-b p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Printer size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Configurações de Impressora</h2>
                            <p className="text-sm text-gray-500">Ajustes para {lojaNome}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-3">
                        <Printer className="shrink-0 mt-0.5" size={18} />
                        <p>Estas configurações são salvas neste navegador/computador especificamente para a Loja atual. Elas alteram como os cupons são impressos nas telas de Monitor e Delivery.</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Conteúdo do Cupom</h3>
                        
                        <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={settings.imprimirLogo}
                                onChange={(e) => setSettings({...settings, imprimirLogo: e.target.checked})}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            />
                            <div>
                                <p className="font-bold text-gray-800">Imprimir Logotipo</p>
                                <p className="text-sm text-gray-500">Exibe a logomarca da loja no cabeçalho do recibo.</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={settings.imprimirDadosCliente}
                                onChange={(e) => setSettings({...settings, imprimirDadosCliente: e.target.checked})}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            />
                            <div>
                                <p className="font-bold text-gray-800">Imprimir Dados do Cliente</p>
                                <p className="text-sm text-gray-500">Exibe nome, telefone e endereço (no caso de delivery) do cliente.</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 transition-colors opacity-50">
                            <input 
                                type="checkbox" 
                                checked={settings.imprimirViaCozinha}
                                disabled
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            />
                            <div>
                                <p className="font-bold text-gray-800 flex items-center gap-2">Imprimir Via da Cozinha <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">Em breve</span></p>
                                <p className="text-sm text-gray-500">Habilita a impressão de uma segunda via sem valores, apenas com itens e observações.</p>
                            </div>
                        </label>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Aparência e Personalização</h3>
                        
                        <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={settings.fonteNegrito}
                                onChange={(e) => setSettings({...settings, fonteNegrito: e.target.checked})}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            />
                            <div>
                                <p className="font-bold text-gray-800">Destacar Textos (Negrito)</p>
                                <p className="text-sm text-gray-500">Deixa toda a fonte do cupom em negrito, útil para impressoras com pouca tinta.</p>
                            </div>
                        </label>

                        <div>
                            <label className="block font-bold text-gray-800 mb-1">Mensagem de Rodapé</label>
                            <p className="text-sm text-gray-500 mb-2">Uma mensagem customizada na parte inferior do cupom.</p>
                            <textarea 
                                value={settings.mensagemRodape}
                                onChange={(e) => setSettings({...settings, mensagemRodape: e.target.value})}
                                placeholder="Agradecemos a preferência! Volte sempre."
                                rows={2}
                                className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-brand-hover transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isSaving ? 'Salvando...' : 'Salvar Preferências'}
                    </button>
                </div>
            </div>
        </div>
    );
}
