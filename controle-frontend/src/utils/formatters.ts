export function formatPhoneForWhatsapp(phone: string): string {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');
    
    // Se o número já tiver o código do país (55) e tiver o tamanho correto (12 ou 13 dígitos), retorna
    if (numbers.startsWith('55') && (numbers.length === 12 || numbers.length === 13)) {
        return numbers;
    }

    // Se for um número válido (10 ou 11 dígitos), adiciona o 55
    if (numbers.length >= 10 && numbers.length <= 11) {
        return `55${numbers}`;
    }

    // Retorna o que conseguiu processar (fallback)
    return numbers;
}
