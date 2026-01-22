import { useState, useEffect } from "react";
import { CategoriasList } from "./CategoriasList";
import { CategoriasForm } from "./CategoriasForm";
import { categoriaApi } from "../../api/categorias.api";
import type { Categoria } from "../../types/Categoria";

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  async function carregarCategorias() {
    setLoading(true);
    try {
      const response = await categoriaApi.listar();
      setCategorias(response);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  }

  async function criarCategoria(descricao: string, finalidade: Categoria['finalidade']) {
    setLoading(true);
    try {
     await categoriaApi.criar({
        descricao,
        finalidade,
      });
      await carregarCategorias();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  return (
    <div>
      <h2>Categorias</h2>

      <CategoriasForm onSubmit={criarCategoria} />

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <CategoriasList categorias={categorias} />
      )}
    </div>
  );
}
