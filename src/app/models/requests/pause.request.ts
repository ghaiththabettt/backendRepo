import { TypePause } from '../type-pause.enum';

export interface PauseRequest {
  pointageId: number;
  typePause: TypePause; // Envoyé comme string, Spring le convertira
  note?: string;
}