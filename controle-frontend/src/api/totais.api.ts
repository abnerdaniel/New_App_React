import { api } from "./axios";
import type { ConsultaTotaisResponse } from "../types/ConsultaTotaisResponse";

const listar = async () =>{
  const response = await api.get<ConsultaTotaisResponse>("/api/consultaTotais/lista");
  return response.data;
};

export const totaisApi = {
  listar,
};
