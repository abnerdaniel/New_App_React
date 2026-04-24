import { api } from './api';
import type { Loja, Categoria } from '../types';

export const lojaService = {
  getAll: async (): Promise<Loja[]> => {
    try {
      const response = await api.get<any[]>('/vitrine'); 
      return response.data.map(loja => ({
        id: loja.id,
        nome: loja.nome || 'Loja sem nome',
        descricao: loja.descricao || 'Loja parceira',
        logoUrl: loja.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000',
        capaUrl: loja.capaUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000',
        imagemUrl: loja.imagemUrl, // Legacy
        bannerUrl: loja.bannerUrl, // Legacy
        avaliacao: loja.avaliacao || 4.8, 
        tempoEntregaMin: loja.tempoEntregaMin || 30,
        tempoEntregaMax: loja.tempoEntregaMax || 45,
        taxaEntrega: loja.taxaEntrega || 5.00,
        categoria: loja.categoria || 'Diversos',
        aberto: loja.aberta ?? true,
        licencaValidaAte: loja.licencaValidaAte,
        bloqueadaPorFaltaDePagamento: loja.bloqueadaPorFaltaDePagamento,
        logradouro: loja.logradouro,
        numero: loja.numero,
        bairro: loja.bairro,
        cidade: loja.cidade,
        estado: loja.estado,
        cep: loja.cep,
        complemento: loja.complemento,
        telefone: loja.telefone,
        whatsapp: loja.whatsApp || loja.whatsapp
      }));
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      return [];
    }
  },
  
  async getById(id: string): Promise<Loja | undefined> {
    try {
      const response = await api.get<any>(`/vitrine/${id}`);
      const data = response.data;
      
      // Mapping VitrineDTO to Loja
      return {
        id: data.lojaId,
        nome: data.nomeLoja || 'Loja sem nome',
        descricao: data.descricao || 'Loja parceira', 
        logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000',
        capaUrl: data.capaUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000',
        imagemUrl: data.logoUrl, // Legacy fallback
        bannerUrl: data.capaUrl, // Legacy fallback
        avaliacao: data.avaliacao ?? 5,
        tempoEntregaMin: data.tempoEntregaMin,
        tempoEntregaMax: data.tempoEntregaMax,
        taxaEntrega: data.taxaEntrega,
        categoria: data.categoria || 'Diversos',
        aberto: data.aberta ?? true,
        licencaValidaAte: data.licencaValidaAte,
        bloqueadaPorFaltaDePagamento: data.bloqueadaPorFaltaDePagamento,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        complemento: data.complemento,
        telefone: data.telefone,
        whatsapp: data.whatsApp || data.whatsapp
      };
    } catch (error) {
       console.error('Erro ao buscar loja:', error);
       return undefined;
    }
  },

  async getCardapio(id: string): Promise<Categoria[]> {
    try {
      const response = await api.get<any>(`/vitrine/${id}`);
      const data = response.data;

      if (!data.cardapio || !data.cardapio.categorias) return [];

      return data.cardapio.categorias.map((cat: any) => ({
          id: cat.id.toString(),
          nome: cat.nome,
          produtos: cat.produtos.map((prod: any) => ({
              id: prod.id.toString(),
              nome: prod.nome || prod.descricao, // Fallback
              descricao: prod.descricao,
              tipo: prod.tipo,
              preco: prod.preco / 100, // Convertendo centavos para reais
              imagemUrl: prod.urlImagem, 
              imagens: prod.imagens ? prod.imagens.map((img: any) => ({
                  id: img.id,
                  url: img.url,
                  ordem: img.ordem
              })) : [],
              adicionaisDetalhes: prod.adicionaisDetalhes ? prod.adicionaisDetalhes.map((det: any) => ({
                  produtoFilhoId: det.produtoFilhoId,
                  quantidadeMinima: det.quantidadeMinima ?? 0,
                  quantidadeMaxima: det.quantidadeMaxima ?? 99,
                  precoOverride: det.precoOverride != null ? det.precoOverride / 100 : null
              })) : [],
              categoriaId: cat.id.toString(),
              lojaId: id,
              disponivel: prod.disponivel,
              adicionais: prod.adicionais ? prod.adicionais.map((extra: any) => ({
                  id: extra.id.toString(),
                  nome: extra.nome,
                  descricao: extra.descricao,
                  preco: extra.preco / 100,
                  imagemUrl: extra.urlImagem,
                  lojaId: id
              })) : [],
              variantes: prod.variantes ? prod.variantes.map((v: any) => ({
                  id: v.id,
                  sku: v.sku,
                  preco: v.preco,
                  estoque: v.estoque,
                  disponivel: v.disponivel,
                  imagemUrl: v.imagemUrl,
                  atributos: v.atributos ? v.atributos.map((a: any) => ({
                      valorId: a.valorId,
                      nomeAtributo: a.nomeAtributo,
                      valor: a.valor,
                      codigoHex: a.codigoHex
                  })) : []
              })) : [],
              gruposOpcao: prod.gruposOpcao ? prod.gruposOpcao.map((g: any) => ({
                  id: g.id,
                  produtoLojaId: g.produtoLojaId,
                  nome: g.nome,
                  ordem: g.ordem,
                  minSelecao: g.minSelecao,
                  maxSelecao: g.maxSelecao,
                  obrigatorio: g.obrigatorio,
                  itens: g.itens ? g.itens.map((i: any) => ({
                      id: i.id,
                      grupoOpcaoId: i.grupoOpcaoId,
                      nome: i.nome,
                      preco: i.preco,
                      ordem: i.ordem,
                      ativo: i.ativo
                  })) : []
              })) : [],
              modoCardapio: prod.modoCardapio || 'Simples'
          })),
          combos: cat.combos ? cat.combos.map((combo: any) => ({
              id: combo.id.toString(),
              nome: combo.nome,
              descricao: combo.descricao,
              preco: combo.preco / 100, // Convertendo centavos para reais
              imagemUrl: combo.imagemUrl,
              ativo: combo.ativo,
              itens: combo.itens ? combo.itens.map((item: any) => ({
                  id: item.id.toString(),
                  produtoLojaId: item.produtoLojaId,
                  nomeProduto: item.nomeProduto,
                  quantidade: item.quantidade
              })) : [],
              etapas: combo.etapas ? combo.etapas.map((etapa: any) => ({
                  id: etapa.id,
                  titulo: etapa.titulo,
                  ordem: etapa.ordem,
                  minEscolhas: etapa.minEscolhas,
                  maxEscolhas: etapa.maxEscolhas,
                  obrigatorio: etapa.obrigatorio,
                  opcoes: etapa.opcoes ? etapa.opcoes.map((opcao: any) => ({
                      id: opcao.id,
                      produtoLojaId: opcao.produtoLojaId,
                      nomeProduto: opcao.nomeProduto,
                      precoAdicional: opcao.precoAdicional
                  })) : []
              })) : []
          })) : []
      }));

    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      return [];
    }
  }
};
