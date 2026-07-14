import axios from 'axios';
import { Passport, VerifyInput } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

export async function verify(input: VerifyInput): Promise<Passport> {
  const { data } = await api.post<Passport>('/api/verify', input);
  return data;
}

export async function getPassport(publicId: string): Promise<Passport> {
  const { data } = await api.get<Passport>(`/api/passports/${publicId}`);
  return data;
}

export interface HistoryRow {
  id: string;
  inputType: string;
  status: string;
  truthScore: number | null;
  createdAt: string;
  passport?: { publicId: string } | null;
}

export async function getHistory(): Promise<HistoryRow[]> {
  const { data } = await api.get<HistoryRow[]>('/api/history');
  return data;
}
