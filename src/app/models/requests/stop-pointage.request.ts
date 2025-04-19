import { PointageLocationDto } from '../pointage-location.dto';

export interface StopPointageRequest {
  pointageId: number;
  gpsValide?: boolean;
  reconnaissanceFacialeValidee?: boolean;
  localisationFin?: PointageLocationDto;
}