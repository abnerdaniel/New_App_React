import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Info } from 'lucide-react';
import { CustomToggle as Toggle } from '../ui/CustomToggle';

interface OrderSummarySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (configs: {
        orderSummaryTemplate: string;
        showAddressOnSummary: boolean;
        showPaymentOnSummary: boolean;
    }) => void;
    currentConfigs: {
        orderSummaryTemplate: string;
        showAddressOnSummary: boolean;
        showPaymentOnSummary: boolean;
    };
}

const DEFAULT_TEMPLATE = `🍔 *Resumo do seu Pedido #{Id}*
Olá {NomeCliente}!
Status: *{Status}*

{Itens}

💵 *Total: {Total}*{Endereco}{Pagamento}`;

export function OrderSummarySettingsModal({ isOpen, onClose, onSave, currentConfigs }: OrderSummarySettingsModalProps) {
    const [template, setTemplate] = useState('');
    const [showAddress, setShowAddress] = useState(true);
    const [showPayment, setShowPayment] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setTemplate(currentConfigs.orderSummaryTemplate || DEFAULT_TEMPLATE);
            setShowAddress(currentConfigs.showAddressOnSummary);
            setShowPayment(currentConfigs.showPaymentOnSummary);
        }
    }, [isOpen, currentConfigs]);

    const handleSave = () => {
        onSave({
            orderSummaryTemplate: template,
            showAddressOnSummary: showAddress,
            showPaymentOnSummary: showPayment
        });
        onClose();
    };

    const handleRestoreDefault = () => {
        if (window.confirm("Deseja voltar para o texto de resumo original?")) {
            setTemplate(DEFAULT_TEMPLATE);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg">Configurar Resumo de Pedido</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    
                    {/* Toggles */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm">Mostrar Endereço na Mensagem</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Adiciona os detalhes de entrega como Bairro, Rua e Complemento.</p>
                            </div>
                            <Toggle active={showAddress} onClick={() => setShowAddress(!showAddress)} />
                        </div>
                        <hr className="border-gray-200" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm">Mostrar Forma de Pagamento</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Adiciona se é PIX, Dinheiro e qual o troco necessário.</p>
                            </div>
                            <Toggle active={showPayment} onClick={() => setShowPayment(!showPayment)} />
                        </div>
                    </div>

                    {/* Template Textarea */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 text-sm">Texto do Resumo</h4>
                            <button 
                                onClick={handleRestoreDefault}
                                className="flex items-center gap-1.5 text-xs text-brand-primary font-bold hover:text-brand-hover bg-brand-primary/10 px-2 py-1 rounded"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Restaurar Padrão
                            </button>
                        </div>
                        
                        <textarea
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner resize-y bg-gray-50"
                            placeholder="Digite o texto do resumo..."
                        />
                        
                        {/* Variáveis Guide */}
                        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <div className="flex gap-2">
                                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-xs font-bold text-blue-800">Variáveis Permitidas:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <code className="text-[10px] bg-white border border-blue-200 px-1.5 py-0.5 rounded text-blue-700">{'{NomeCliente}'}</code>
                                        <code className="text-[10px] bg-white border border-blue-200 px-1.5 py-0.5 rounded text-blue-700">{'{Id}'}</code>
                                        <code className="text-[10px] bg-white border border-blue-200 px-1.5 py-0.5 rounded text-blue-700">{'{Status}'}</code>
                                        <code className="text-[10px] bg-white border border-blue-200 px-1.5 py-0.5 rounded text-blue-700">{'{Itens}'}</code>
                                        <code className="text-[10px] bg-white border border-blue-200 px-1.5 py-0.5 rounded text-blue-700">{'{Total}'}</code>
                                        <code className="text-[10px] bg-white border border-blue-200 px-1.5 py-0.5 rounded text-blue-700">{'{Endereco}'}</code>
                                        <code className="text-[10px] bg-white border border-blue-200 px-1.5 py-0.5 rounded text-blue-700">{'{Pagamento}'}</code>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">Essas variáveis em chaves serão automaticamente substituídas pelos dados do pedido quando o WhatsApp for enviado.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/80">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
