import { api } from '../api/axios';

export interface WhatsAppStatusResponse {
    status: 'DISCONNECTED' | 'PENDING_QR' | 'CONNECTED';
}

export interface WhatsAppConnectResponse {
    qrcode: string;
    status: string;
}

export const whatsappService = {
    getStatus: async (lojaId: string): Promise<WhatsAppStatusResponse> => {
        const response = await api.get(`/api/loja/${lojaId}/whatsapp/status`);
        return response.data;
    },
    
    connect: async (lojaId: string): Promise<WhatsAppConnectResponse> => {
        const response = await api.post(`/api/loja/${lojaId}/whatsapp/connect`);
        return response.data;
    },
    
    disconnect: async (lojaId: string): Promise<{ status: string }> => {
        const response = await api.delete(`/api/loja/${lojaId}/whatsapp/disconnect`);
        return response.data;
    },

    getConfigs: async (lojaId: string): Promise<any> => {
        const response = await api.get(`/api/loja/${lojaId}`);
        return response.data;
    },

    updateConfigs: async (lojaId: string, configs: any): Promise<any> => {
        const response = await api.put(`/api/loja/${lojaId}/atendimento-ia/config`, configs);
        return response.data;
    }
};
