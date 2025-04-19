// models/entree-de-temps.dto.ts
import { PointageLocationDto } from './pointage-location.dto';
import { PauseDTO } from './pause.dto';
import { RestrictionsHorloge } from './restrictions-horloge.enum'; // Créez ce fichier enum
import { Status } from './status.enum';                     // Créez ce fichier enum
import { TypeEntreeDeTemps } from './type-entree-de-temps.enum'; // Créez ce fichier enum

export interface EntreeDeTempsDTO {
  id: number;
  employeeId: number;
  employeeFullName?: string; // Optionnel, pour affichage direct
  tacheId?: number;          // Optionnel, si tâche réintégrée
  tacheTitre?: string;       // Optionnel, si tâche réintégrée
  typeEntreeDeTemps: TypeEntreeDeTemps;
  heureDebut: string;
  heureFin?: string;
  dureeNetteMinutes?: number;
  dureePauseMinutes?: number;
  localisationDebut?: PointageLocationDto;
  localisationFin?: PointageLocationDto;
  pauses: PauseDTO[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  restrictionsHorloge: RestrictionsHorloge;
  status: Status;
}
