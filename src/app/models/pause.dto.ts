import { TypePause } from './type-pause.enum'; // Créez ce fichier enum ci-dessous

export interface PauseDTO {
  id: number;
  debut: string; // Les dates seront reçues comme strings ISO
  fin?: string;
  typePause: TypePause;
  note?: string;
  dureeMinutes?: number;
}