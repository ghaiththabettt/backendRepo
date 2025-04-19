import { PointageLocationDto } from '../pointage-location.dto';
import { TypeEntreeDeTemps } from '../type-entree-de-temps.enum';

export interface StartPointageRequest {
  employeeId: number;
  tacheId?: number; // Si besoin
  notes?: string;
  typeEntreeDeTemps?: TypeEntreeDeTemps; // Envoyé comme string, Spring le convertira
  heureDebutProposee?: string; // Format ISO string si utilisé
  heureFinProposee?: string;   // Format ISO string si utilisé
  localisationDebut?: PointageLocationDto;
}