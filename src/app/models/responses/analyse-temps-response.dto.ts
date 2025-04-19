import { EntreeDeTempsDTO } from '../entree-de-temps.dto';
export interface AnalyseTempsResponseDto {
    tempsTotalTravailleMinutes: number;
    nombrePointages: number;
    pausesTotalesMinutes: number;
    productivite: string;
    pointagesDetail: EntreeDeTempsDTO[];
}