import axios from "axios";
import type { Provincia, Stakeholder } from "./types";

const api = axios.create({
  baseURL: "/api",
});

export const fetchProvincias = async () => {
  const { data } = await api.get<Provincia[]>("/provincias");
  return data;
};

export const createProvincia = async (nombre: string) => {
  const { data } = await api.post<Provincia>("/provincias", { nombre });
  return data;
};

export const fetchStakeholders = async (provinciaId: number) => {
  const { data } = await api.get<Stakeholder[]>(`/provincias/${provinciaId}/stakeholders`);
  return data;
};

export const createStakeholder = async (stakeholder: Omit<Stakeholder, "id">) => {
  const { data } = await api.post<Stakeholder>("/stakeholders", stakeholder);
  return data;
};

export const updateStakeholder = async (id: number, stakeholder: Omit<Stakeholder, "id">) => {
  const { data } = await api.put<Stakeholder>(`/stakeholders/${id}`, stakeholder);
  return data;
};

export const deleteStakeholder = async (id: number) => {
  await api.delete(`/stakeholders/${id}`);
};

export const exportProvinciaData = async (provinciaId: number) => {
  const { data } = await api.get<Provincia>(`/provincias/${provinciaId}/export`);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `provincia_${provinciaId}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};
