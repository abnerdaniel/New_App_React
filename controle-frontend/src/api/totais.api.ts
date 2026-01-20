import { api } from "./axios";
import type { ConsultaTotaisResponse } from "../types/ConsultaTotaisResponse";

export const totaisApi = {
  listar: () =>
    api.get<ConsultaTotaisResponse>("/consultaTotais/lista"),
};
