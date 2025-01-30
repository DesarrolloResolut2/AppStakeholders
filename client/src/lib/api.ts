import axios from "axios";
import type { Provincia, Stakeholder, Tag } from "./types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    'Content-Type': 'application/json',
  },
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

export const exportProvinciaData = async (provinciaId: number, nombreProvincia: string) => {
  const { data } = await api.get<Provincia>(`/provincias/${provinciaId}/export`);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const fileName = nombreProvincia ? `provincia_${nombreProvincia.toLowerCase().replace(/\s+/g, '_')}.json` : `provincia_${provinciaId}.json`;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
export const exportStakeholderContactData = async (stakeholder: Stakeholder) => {
  const exportData = {
    datos_contacto: stakeholder.datos_contacto || {},
    datos_linkedin: stakeholder.datos_especificos_linkedin || {},
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contacto_linkedin_${stakeholder.nombre.replace(/\s+/g, '_').toLowerCase()}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};


export const deleteProvincia = async (id: number) => {
  await api.delete(`/provincias/${id}`);
};

// Nuevas funciones para manejar tags
export const fetchTags = async () => {
  const { data } = await api.get<Tag[]>("/tags");
  return data;
};

export const createTag = async (name: string) => {
  const { data } = await api.post<Tag>("/tags", { name });
  return data;
};

export const updateTag = async (id: number, name: string) => {
  const { data } = await api.put<Tag>(`/tags/${id}`, { name });
  return data;
};

export const deleteTag = async (id: number) => {
  await api.delete(`/tags/${id}`);
};

export const assignTagsToStakeholder = async (stakeholderId: number, tagIds: number[]) => {
  const { data } = await api.post<Stakeholder>(`/stakeholders/${stakeholderId}/tags`, { tagIds });
  return data;
};

export const fetchStakeholdersWithTags = async (tagIds?: number[]) => {
  const params = tagIds?.length ? { tags: tagIds } : undefined;
  const { data } = await api.get<Stakeholder[]>("/stakeholders", { params });
  return data;
};