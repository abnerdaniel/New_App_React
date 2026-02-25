import type { LojaResumo } from '../types/Usuario';

// This is an interface matching PedidoMonitor and Pedido for print purposes
export interface PrintOrderData {
    id: number;
    numeroFila?: number;
    numeroMesa?: number;
    isRetirada?: boolean;
    dataVenda: string;
    valorTotal?: number;
    desconto?: number;
    subtotal?: number; // Usually derived
    metodoPagamento?: string;
    trocoPara?: number;
    observacao?: string;
    descricao?: string;

    cliente?: {
        nome: string;
        telefone?: string;
        cpf?: string; // We might need to extract this from obs if it's there
    };
    
    enderecoDeEntrega?: {
        logradouro: string;
        bairro: string;
        numero: string;
        complemento?: string;
        cidade: string;
    } | null;

    sacola: {
        quantidade: number;
        nomeProduto?: string;
        precoVenda?: number;
        adicionais?: { nomeProduto?: string; precoVenda?: number }[];
        observacao?: string;
        produtoLoja?: {
            descricao?: string;
            produto?: { nome: string };
        };
    }[];
}

export interface PrintSettings {
    imprimirLogo: boolean;
    imprimirDadosCliente: boolean;
    imprimirViaCozinha: boolean;
    fonteNegrito: boolean;
    mensagemRodape: string;
}

export const getPrintSettings = (lojaId: string): PrintSettings => {
    const defaultSettings: PrintSettings = {
        imprimirLogo: true,
        imprimirDadosCliente: true,
        imprimirViaCozinha: false,
        fonteNegrito: false,
        mensagemRodape: "Obrigado pela preferência! Volte sempre."
    };
    try {
        const stored = localStorage.getItem(`@App:printSettings:${lojaId}`);
        if (stored) return JSON.parse(stored);
    } catch (_) {
         // ignore
    }
    return defaultSettings;
};

export const savePrintSettings = (lojaId: string, settings: PrintSettings) => {
    localStorage.setItem(`@App:printSettings:${lojaId}`, JSON.stringify(settings));
};

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.substring(0,2)}) ${cleaned.substring(2,7)}-${cleaned.substring(7)}`;
    }
    return phone;
};

export const printReceipt = (pedido: PrintOrderData, loja: LojaResumo | null) => {
    if (!loja) {
        alert("Loja não encontrada para impressão.");
        return;
    }

    const settings = getPrintSettings(loja.id);
    
    // Normalize data (Pedido vs PedidoMonitor mapping)
    const p: PrintOrderData = pedido;
    const isDelivery = !p.isRetirada && !!p.enderecoDeEntrega && !p.numeroMesa;
    
    // Parse total and subtotal - handling cents
    const rawTotal = p.valorTotal ?? 0; 
    
    // Actually, in both backends, it's stored in cents, so we divide by 100
    const valorRealTotal = rawTotal / 100;

    // Calculate subtotal from items if not provided
    let calculatedSubtotal = 0;
    p.sacola.forEach(item => {
        let itemTotal = (item.precoVenda || 0) / 100;
        item.adicionais?.forEach(add => {
             itemTotal += (add.precoVenda || 0) / 100;
        });
        calculatedSubtotal += itemTotal * item.quantidade;
    });

    const isFila = p.numeroFila && p.numeroFila > 0;
    const isMesa = p.numeroMesa && p.numeroMesa > 0;

    const dataHoraStr = new Date(p.dataVenda).toLocaleString('pt-BR');
    
    // Extract CPF from observation if it exists
    let cpf = p.cliente?.cpf || '';
    let observacaoLimpa = p.observacao || '';
    if (observacaoLimpa.includes('- CPF:')) {
         const parts = observacaoLimpa.split('- CPF:');
         cpf = parts[1].trim();
         observacaoLimpa = parts[0].trim();
    }

    let itemHtml = '';
    p.sacola.forEach(item => {
        const title = item.nomeProduto || item.produtoLoja?.produto?.nome || item.produtoLoja?.descricao || 'Item sem nome';
        const price = (item.precoVenda || 0) / 100;
        const total = price * item.quantidade;
        
        itemHtml += `
            <div class="item">
                <div class="item-name"><strong>${item.quantidade}x</strong> ${title}</div>
                <div class="item-price">${formatCurrency(total)}</div>
            </div>
        `;

        if (item.observacao) {
             itemHtml += `<div class="item-obs">Obs: ${item.observacao}</div>`;
        }

        if (item.adicionais && item.adicionais.length > 0) {
            item.adicionais.forEach(add => {
                const addPrice = (add.precoVenda || 0) / 100;
                itemHtml += `
                    <div class="item-adicional">
                        <div>+ ${add.nomeProduto || 'Adicional'}</div>
                        <div>${addPrice > 0 ? formatCurrency(addPrice) : ''}</div>
                    </div>
                `;
            });
        }
    });

    // Construção do HTML do cupom
    const receiptHtml = `
    <html>
        <head>
            <title>Recibo Pedido #${p.id}</title>
            <style>
                @page { margin: 0; size: auto; }
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    font-size: 12px; 
                    color: #000; 
                    margin: 0; 
                    padding: 8mm; 
                    width: 80mm; 
                    box-sizing: border-box;
                    ${settings.fonteNegrito ? 'font-weight: bold;' : ''}
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                
                .header { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .logo { max-width: 120px; max-height: 80px; margin-bottom: 5px; }
                .loja-nome { font-size: 16px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; }
                
                .order-info { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .order-number { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                .order-type { font-size: 14px; font-weight: bold; padding: 2px; border: 1px solid #000; display: inline-block; margin-bottom: 5px; margin-top: 5px; }
                
                .customer-info { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                
                .items-list { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .item { display: flex; justify-content: space-between; margin-bottom: 3px; }
                .item-name { flex-grow: 1; padding-right: 10px; }
                .item-adicional { display: flex; justify-content: space-between; padding-left: 20px; font-size: 11px; }
                .item-obs { padding-left: 20px; font-size: 11px; font-style: italic; }
                
                .totals { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .total-line { display: flex; justify-content: space-between; margin-bottom: 3px; }
                .total-line.grand-total { font-size: 16px; font-weight: bold; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; }
                
                .payment-info { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                
                .footer { text-align: center; font-size: 11px; margin-top: 10px; }
                
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header text-center">
                ${(settings.imprimirLogo && loja.imagemUrl) ? `<img src="${loja.imagemUrl}" class="logo" />` : ''}
                <div class="loja-nome">${loja.nome}</div>
            </div>

            <div class="order-info text-center">
                <div class="order-number">Pedido #${p.id}</div>
                <div>${dataHoraStr}</div>
                
                <div class="order-type">
                    ${isDelivery ? '🚗 DELIVERY' : isMesa ? ('🍽️ MESA ' + p.numeroMesa) : '🛍️ RETIRADA NO BALCÃO'}
                </div>
                ${isFila ? ('<div><strong>Fila: #' + p.numeroFila + '</strong></div>') : ''}
            </div>

            ${settings.imprimirDadosCliente ? `
            <div class="customer-info">
                <div><strong>Cliente:</strong> ${p.cliente?.nome || p.descricao || 'Não identificado'}</div>
                ${p.cliente?.telefone ? `<div><strong>Tel:</strong> ${formatPhone(p.cliente.telefone)}</div>` : ''}
                ${cpf ? `<div><strong>CPF:</strong> ${cpf}</div>` : ''}
                
                ${isDelivery && p.enderecoDeEntrega ? `
                    <div style="margin-top: 5px;"><strong>Endereço de Entrega:</strong></div>
                    <div>${p.enderecoDeEntrega.logradouro}, ${p.enderecoDeEntrega.numero} ${p.enderecoDeEntrega.complemento ? ' - ' + p.enderecoDeEntrega.complemento : ''}</div>
                    <div>${p.enderecoDeEntrega.bairro}, ${p.enderecoDeEntrega.cidade}</div>
                ` : ''}
            </div>
            ` : ''}

            <div class="items-list">
                <div style="margin-bottom: 5px; text-transform: uppercase;">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #000;">
                        <span>Qtd Descrição</span>
                        <span>Total R$</span>
                    </div>
                </div>
                ${itemHtml}
            </div>

            <div class="totals">
                ${calculatedSubtotal > 0 && calculatedSubtotal !== valorRealTotal ? `
                <div class="total-line">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(calculatedSubtotal)}</span>
                </div>
                ` : ''}
                
                ${p.desconto && p.desconto > 0 ? `
                <div class="total-line">
                    <span>Desconto:</span>
                    <span>- ${formatCurrency((p.desconto)/100)}</span>
                </div>
                ` : ''}
                
                <!-- If there's a difference between given total and subtotal without discount, it might be delivery fee -->
                ${(valorRealTotal > calculatedSubtotal && isDelivery) ? `
                <div class="total-line">
                    <span>Taxa de Entrega (Aprox):</span>
                    <span>${formatCurrency(valorRealTotal - calculatedSubtotal)}</span>
                </div>
                ` : ''}

                <div class="total-line grand-total">
                    <span>Total a Pagar:</span>
                    <span>${formatCurrency(valorRealTotal)}</span>
                </div>
            </div>

            <div class="payment-info">
                <div class="total-line">
                    <span>Forma de Pagto:</span>
                    <span><strong>${p.metodoPagamento || 'Não informada'}</strong></span>
                </div>
                
                ${(p.metodoPagamento?.toLowerCase() === 'dinheiro' && p.trocoPara && p.trocoPara > 0) ? `
                <div class="total-line">
                    <span>Valor Recebido:</span>
                    <span>${formatCurrency(p.trocoPara)}</span>
                </div>
                <div class="total-line bold">
                    <span>Troco:</span>
                    <span>${formatCurrency(p.trocoPara - valorRealTotal)}</span>
                </div>
                ` : ''}
            </div>

            ${observacaoLimpa ? `
            <div style="margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px;">
                <strong>Observações:</strong><br>
                ${observacaoLimpa}
            </div>
            ` : ''}

            <div class="footer">
                ${settings.mensagemRodape ? `<div style="margin-top:5px; font-weight:bold;">${settings.mensagemRodape}</div>` : ''}
                <div>---</div>
                <div>Impresso em ${new Date().toLocaleString('pt-BR')}</div>
            </div>
            <br>
            <br>
            <br>
            .
        </body>
    </html>
    `;

    // Criar iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(receiptHtml);
        doc.close();
        
        // Wait for images to load, then print
        iframe.onload = () => {
             // Let it render slightly
             setTimeout(() => {
                 iframe.contentWindow?.focus();
                 iframe.contentWindow?.print();
                 // Remove the iframe after some delay
                 setTimeout(() => {
                     document.body.removeChild(iframe);
                 }, 3000);
             }, 500);
        };
    } else {
        // Fallback pop-up if iframe fails
        const newWin = window.open('', '_blank');
        if (newWin) {
            newWin.document.write(receiptHtml);
            newWin.document.close();
            newWin.focus();
            setTimeout(() => {
                newWin.print();
                newWin.close();
            }, 1000);
        }
    }
};
