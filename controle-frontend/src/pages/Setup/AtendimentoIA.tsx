import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { whatsappService } from '../../services/whatsapp.service';
import { MessageCircle, QrCode, LogOut, Loader2, AlertTriangle, ShieldCheck, Settings, Info, Settings2 } from 'lucide-react';
import { CustomToggle as Toggle } from '../../components/ui/CustomToggle';
import { OrderSummarySettingsModal } from '../../components/modals/OrderSummarySettingsModal';

export function AtendimentoIA() {
    const { activeLoja } = useAuth();
    
    const [status, setStatus] = useState<'LOADING' | 'DISCONNECTED' | 'PENDING_QR' | 'CONNECTED'>('LOADING');
    const [qrCode, setQrCode] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(40);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    
    // Configurações UI
    const [configs, setConfigs] = useState({
        iaEnabled: true,
        sendCustomerNumber: false,
        sendOrderSummary: false,
        orderUpdates: false,
        botWithoutIA: false,
        orderSummaryTemplate: "",
        showAddressOnSummary: true,
        showPaymentOnSummary: true
    });

    useEffect(() => {
        if (activeLoja) {
            whatsappService.getConfigs(activeLoja.id)
                .then(lojaData => {
                    setConfigs({
                        iaEnabled: lojaData.iaEnabled ?? true,
                        sendCustomerNumber: lojaData.sendCustomerNumber ?? false,
                        sendOrderSummary: lojaData.sendOrderSummary ?? false,
                        orderUpdates: lojaData.orderUpdates ?? false,
                        botWithoutIA: lojaData.botWithoutIA ?? false,
                        orderSummaryTemplate: lojaData.orderSummaryTemplate ?? "",
                        showAddressOnSummary: lojaData.showAddressOnSummary ?? true,
                        showPaymentOnSummary: lojaData.showPaymentOnSummary ?? true
                    });
                })
                .catch(console.error);
        }
    }, [activeLoja]);

    const toggleConfig = async (key: keyof typeof configs) => {
        if (!activeLoja) return;
        const newConfigs = { ...configs, [key]: !configs[key] };
        setConfigs(newConfigs);
        try {
            await whatsappService.updateConfigs(activeLoja.id, newConfigs);
        } catch (err) {
            console.error("Falha ao salvar a configuração", err);
            // rollback
            setConfigs(configs);
            alert("Erro ao salvar configuração.");
        }
    };

    // Polling interval
    const pollingRef = useRef<number | null>(null);

    const checkStatus = async () => {
        if (!activeLoja) return;
        try {
            const res = await whatsappService.getStatus(activeLoja.id);
            setStatus(res.status as 'DISCONNECTED' | 'PENDING_QR' | 'CONNECTED');
            setErrorMsg('');
            // Se já conectou, limpa qualquer contador
            if (res.status === 'CONNECTED') {
                setTimeLeft(40);
            }
        } catch (error: any) {
            console.error('Error fetching WA status', error);
            if (error?.response?.data?.error === 'INVALID_PHONE') {
                setStatus('DISCONNECTED');
                setQrCode('');
                setErrorMsg(error.response.data.message);
                if (pollingRef.current) clearInterval(pollingRef.current);
            } else {
                setStatus('DISCONNECTED');
            }
        }
    };

    useEffect(() => {
        if (activeLoja) {
            checkStatus();
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [activeLoja]);

    useEffect(() => {
        let intervalId: number | null = null;
        if (status === 'PENDING_QR') {
            intervalId = window.setInterval(() => {
                checkStatus();
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Refresh o QR code automaticamente chamando connect de novo (como o backend faz o fallback)
                        handleConnect();
                        return 40; // reseta pra mais 40 seg
                    }
                    return prev - 1;
                });
            }, 5000); // 5 seconds polling, decrement timeLeft by 5 inside
            pollingRef.current = intervalId;
        } else {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
            else if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [status]);

    const handleConnect = async () => {
        if (!activeLoja) return;
        setIsConnecting(true);
        setErrorMsg('');
        try {
            const res = await whatsappService.connect(activeLoja.id);
            setQrCode(res.qrcode);
            setStatus(res.status as 'PENDING_QR');
            setTimeLeft(40); // Reset timer 40 seconds when generated
        } catch (error: any) {
            console.error('Failed to connect WA', error);
            setErrorMsg(error?.response?.data?.message || 'Falha ao conectar via WhatsApp');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!activeLoja) return;
        if (!window.confirm("Certeza que deseja desconectar o WhatsApp da IA?")) return;
        
        setIsConnecting(true);
        try {
            await whatsappService.disconnect(activeLoja.id);
            setStatus('DISCONNECTED');
            setQrCode('');
            setTimeLeft(40);
        } catch (error) {
            console.error('Failed to disconnect WA', error);
            alert('Falha ao tentar desconectar');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <>
            <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-brand-primary/10 overflow-hidden">
                    <div className="bg-brand-primary p-6 md:p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="relative z-10 flex items-center gap-4">
                           <div className="p-3 bg-white/10 rounded-xl">
                               <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                           </div>
                           <div>
                               <h1 className="text-2xl md:text-3xl font-black">Atendimento Automatizado</h1>
                               <p className="text-white/80 mt-1 max-w-lg text-sm md:text-base">Conecte seu WhatsApp corporativo para enviar atualizações de pedidos aos clientes de forma automática.</p>
                           </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        {errorMsg && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-red-800">Atenção!</h3>
                                    <p className="text-red-700 text-sm mt-1">{errorMsg}</p>
                                </div>
                            </div>
                        )}

                        {status === 'LOADING' ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                                <p className="text-text-secondary">Carregando status da conexão...</p>
                            </div>
                        ) : status === 'CONNECTED' ? (
                            <div className="py-8">
                                <div className="flex flex-col items-center justify-center text-center mb-10">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50">
                                        <ShieldCheck className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">WhatsApp Conectado e Operacional!</h2>
                                    <p className="text-gray-500 mt-2 max-w-md">Seu WhatsApp está vinculado e pronto para enviar mensagens automáticas de pedidos aos seus clientes.</p>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                                            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                                                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                                    <Settings className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-bold text-gray-800 text-lg">Configurações de Atendimento</h3>
                                            </div>
                                            <div className="p-5 space-y-5">
                                                <div className="flex items-center justify-between opacity-60 pointer-events-none">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">Inteligência Artificial Ativa <span className="text-xs text-brand-primary font-bold ml-2">(Em breve)</span></h4>
                                                        <p className="text-sm text-gray-500 mt-0.5">Permitir que a IA responda e feche pedidos automaticamente.</p>
                                                    </div>
                                                    <Toggle active={false} onClick={() => {}} />
                                                </div>
                                                <hr className="border-gray-50" />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-gray-800">Resumo após Pedido</h4>
                                                            {configs.sendOrderSummary && (
                                                                <button 
                                                                    onClick={() => setIsSummaryModalOpen(true)}
                                                                    className="p-1 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-all flex items-center justify-center -mt-0.5 mx-1 tooltip cursor-pointer"
                                                                    title="Configurar Mensagem"
                                                                >
                                                                    <Settings2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-0.5">Enviar o resumo detalhado logo após receber o pedido.</p>
                                                    </div>
                                                    <Toggle active={configs.sendOrderSummary} onClick={() => toggleConfig('sendOrderSummary')} />
                                                </div>
                                                <hr className="border-gray-50" />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">Avisos de Atualização de Pedido</h4>
                                                        <p className="text-sm text-gray-500 mt-0.5">Notificar o cliente sobre mudanças no status do pedido.</p>
                                                        <p className="text-xs font-semibold text-orange-600 mt-1">⚠️ Obs: Se o número cadastrado estiver errado, o cliente não receberá os avisos.</p>
                                                    </div>
                                                    <Toggle active={configs.orderUpdates} onClick={() => toggleConfig('orderUpdates')} />
                                                </div>
                                                <hr className="border-gray-50" />
                                                <div className="flex items-center justify-between opacity-60 pointer-events-none">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">Bot de Triagem sem IA <span className="text-xs text-brand-primary font-bold ml-2">(Em breve)</span></h4>
                                                        <p className="text-sm text-gray-500 mt-0.5">Usar um bot padrão com menus numéricos em vez de IA livre.</p>
                                                    </div>
                                                    <Toggle active={false} onClick={() => {}} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 bg-opacity-50 border border-orange-200 rounded-2xl p-5 flex gap-4">
                                            <Info className="w-6 h-6 text-orange-600 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-orange-800 mb-1">Aviso Importante</h4>
                                                <p className="text-sm text-orange-700 leading-relaxed text-balance">
                                                    Não nos responsabilizamos por <strong>contas bloqueadas</strong> (banimentos de número). 
                                                    A funcionalidade, políticas de uso e estabilidade da ferramenta WhatsApp são mantidas pelas regras e servidores da <strong>Meta</strong>. Recomendamos sempre o uso de um chip aquecido e exclusivo para o seu delivery.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl w-full sticky top-6">
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center mb-6 shadow-sm">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                                    <ShieldCheck className="w-6 h-6 text-green-600" />
                                                </div>
                                                <span className="font-bold text-gray-800">Status: Conectado</span>
                                                <span className="text-xs text-green-600 font-semibold mt-1">Sessão Ativa</span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700 mb-4">Ações da Conexão</p>
                                            <button 
                                                onClick={handleDisconnect}
                                                disabled={isConnecting}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors disabled:opacity-50 shadow-sm"
                                            >
                                                {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                                                Desconectar WhatsApp
                                            </button>
                                            <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
                                                Desconectar interrompe imediatamente o serviço de atendimento e envio de mensagens para os clientes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : status === 'PENDING_QR' && qrCode ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Leia o QR Code</h2>
                                <p className="text-gray-500 mb-8 max-w-md text-sm">Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código abaixo. O código atualizará em {timeLeft} segundos.</p>
                                
                                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 relative">
                                    {isConnecting && (
                                        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
                                            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                                        </div>
                                    )}
                                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 mx-auto" />
                                </div>
                                
                                <div className="flex items-center gap-2 text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-lg text-sm font-semibold">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Aguardando leitura...
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                    <QrCode className="w-12 h-12 text-gray-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">WhatsApp Desconectado</h2>
                                <p className="text-gray-500 mt-2 max-w-md mb-8">Para que a inteligência artificial possa responder seus clientes, é necessário conectar o WhatsApp da sua loja.</p>
                                
                                <button
                                    onClick={handleConnect}
                                    disabled={isConnecting}
                                    className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isConnecting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Gerando QRCode...
                                        </>
                                    ) : (
                                        <>
                                            <QrCode className="w-5 h-5" />
                                            Gerar QR Code de Conexão
                                        </>
                                    )}
                                </button>
                                
                                <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-400">
                                    <p>🛡️ Certifique-se de usar o mesmo número ({(activeLoja as any)?.telefone || (activeLoja as any)?.whatsapp}) cadastrado no painel.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Template Engine Modal */}
            <OrderSummarySettingsModal 
                isOpen={isSummaryModalOpen} 
                onClose={() => setIsSummaryModalOpen(false)} 
                currentConfigs={configs}
                onSave={async (newTemplateConfigs) => {
                    if (!activeLoja) return;
                    const mergedConfigs = { ...configs, ...newTemplateConfigs };
                    setConfigs(mergedConfigs);
                    try {
                        await whatsappService.updateConfigs(activeLoja.id, mergedConfigs);
                    } catch (err) {
                        console.error('Failed to save template configs', err);
                        setConfigs(configs); // rollback
                        alert('Falha ao salvar as configurações de mensagem');
                    }
                }} 
            />
        </>
    );
}
