
import { useEffect, useRef } from 'react';

interface Category {
    id: string;
    nome: string;
}

interface CategoryNavProps {
    categories: Category[];
    activeCategory: string | null;
    onSelect: (categoryId: string | null) => void;
}

export function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll active button into view
    useEffect(() => {
        if (activeCategory && scrollContainerRef.current) {
            const activeButton = scrollContainerRef.current.querySelector<HTMLButtonElement>(`button[data-id="${activeCategory}"]`);
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        } else if (activeCategory === null && scrollContainerRef.current) {
             scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }, [activeCategory]);

    return (
        <div className="sticky top-0 z-30 bg-white shadow-sm">
            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-2 p-4 no-scrollbar items-center max-w-4xl mx-auto"
            >
                <button 
                    onClick={() => onSelect(null)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                        activeCategory === null 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Todos
                </button>
                
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        data-id={cat.id}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                            activeCategory === cat.id 
                                ? 'bg-red-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {cat.nome}
                    </button>
                ))}
            </div>
        </div>
    );
}
