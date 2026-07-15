import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Anamnese, AnamneseInput } from "@/types";
import type { AnamneseRepository } from "./anamnese.repository";

/**
 * A API já devolve a entidade com os mesmos nomes de campo do domínio, então não
 * há mapeamento a fazer além de garantir o tipo. `GET /anamnesis/:id` de um
 * registro inexistente responde 200 com corpo vazio (o service devolve null),
 * por isso `findById` valida a presença do id.
 */
export const httpAnamneseRepository: AnamneseRepository = {
  async findByPatient(patientId) {
    const { data } = await httpClient.get<Anamnese[]>(
      endpoints.anamnese.byPatient(patientId),
    );
    return Array.isArray(data) ? data : [];
  },

  async findById(id) {
    const { data } = await httpClient.get<Anamnese | null>(endpoints.anamnese.byId(id));
    if (!data || typeof data !== "object") {
      throw new Error("Anamnese não encontrada");
    }
    return data;
  },

  async create(input: AnamneseInput) {
    const { data } = await httpClient.post<Anamnese>(endpoints.anamnese.base, input);
    return data;
  },

  async update(id, input) {
    await httpClient.put(endpoints.anamnese.byId(id), input);
  },

  async remove(id) {
    await httpClient.delete(endpoints.anamnese.byId(id));
  },
};
