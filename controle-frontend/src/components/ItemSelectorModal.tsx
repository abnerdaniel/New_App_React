import { useState, useEffect } from 'react';
import { Search, X, Check, Plus } from 'lucide-react';

interface ItemSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedIds: number[], type: 'PRODUTO' | 'COMBO') => void;
    availableItems: any[]; // List of all items (products or combos)
    currentCategoryItems: number[]; // IDs already in the category to exclude/disable
    type: 'PRODUTO' | 'COMBO';
}

export function ItemSelectorModal({ isOpen, onClose, onSave, availableItems, currentCategoryItems, type }: ItemSelectorModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSelectedIds([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Filter items based on search and type (though type is handled by parent passing specific list usually)
    // Actually parent passes 'availableItems' which might be mixed? 
    // Plan says "Tabs for Produtos vs Combos". 
    // Let's make the Modal handle both if passed all items, OR safer: Parent controls content.
    // Refined Plan: Parent passes specific list (e.g. all products) and type.
    
    // Filtering
    const filteredItems = availableItems.filter(item => 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !currentCategoryItems.includes(item.id) // Optionally hide already added ones
    );

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave(selectedIds, type);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">
                        Adicionar {type === 'PRODUTO' ? 'Produtos' : 'Combos'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Buscar itens..."
                            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum item encontrado.
                        </div>
                    ) : (
                        filteredItems.map(item => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <div 
                                    key={item.id}
                                    onClick={() => toggleSelection(item.id)}
                                    className={`flex items-center p-3 rounded-md cursor-pointer transition-colors border
                                        ${isSelected ? 'bg-brand-primary/10 border-brand-primary' : 'hover:bg-gray-50 border-transparent'}
                                    `}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
                                        ${isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-gray-300 bg-white'}
                                    `}>
                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-800">{item.nome}</p>
                                        <p className="text-xs text-gray-500">
                                            {(item.preco/100).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                                        </p>
                                    </div>

                                    {item.imagemUrl && (
                                        <img src={item.imagemUrl} alt="" className="w-10 h-10 rounded object-cover ml-2" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={selectedIds.length === 0}
                        className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-bold hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Adicionar ({selectedIds.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
