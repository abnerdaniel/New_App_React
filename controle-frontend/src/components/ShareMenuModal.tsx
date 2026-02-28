import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Download, Check } from 'lucide-react';

interface ShareMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug?: string;
  nome?: string;
}

export function ShareMenuModal({ isOpen, onClose, slug, nome }: ShareMenuModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Gerar a URL dinâmica
  const hostname = window.location.hostname;
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  
  // Remove o 'admin.' do início se existir, senão usa o host normal (para dev local)
  const clientHostname = hostname.replace(/^admin\./, '');
  
  // Na máquina local, assumimos que o cliente roda na 5174 e admin na 5175
  const finalHostname = isLocal ? 'localhost:5174' : clientHostname;
  const protocol = window.location.protocol;
  
  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .normalize('NFD')                 // Normalize accents
      .replace(/[\u0300-\u036f]/g, '')  // Remove accents
      .replace(/\s+/g, '-')             // Replace spaces with -
      .replace(/[^\w-]+/g, '')          // Remove all non-word chars
      .replace(/--+/g, '-')             // Replace multiple - with single -
      .replace(/^-+/, '')               // Trim - from start of text
      .replace(/-+$/, '');              // Trim - from end of text
  };

  const activeSlug = slug || (nome ? generateSlug(nome) : 'loja');
  const urlCardapio = `${protocol}//${finalHostname}/${activeSlug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(urlCardapio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `qrcode-${slug || 'loja'}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Divulgar Cardápio</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          
          <p className="text-sm text-gray-500 mb-6 text-center">
            Escaneie o QR Code ou copie o link abaixo para enviar aos seus clientes.
          </p>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <QRCodeSVG 
              id="qr-code-svg"
              value={urlCardapio} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="w-full mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Link do seu cardápio
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={urlCardapio} 
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-brand-primary text-white hover:bg-brand-hover'
                }`}
                title="Copiar Link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200"
          >
            <Download size={18} />
            Baixar QR Code
          </button>

        </div>
      </div>
    </div>
  );
}
