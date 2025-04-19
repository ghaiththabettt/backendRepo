export interface EntreeDeTemps {
  id?: string;
  employeeId: string; // ID de l'employé
  typeEntreeDeTemps: 'TRAVAIL' | 'HEURES_SUPPLEMENTAIRES'; // Aligné avec le backend
  heureDebut: Date;
  heureFin?: Date;
  duree?: number;
  localisationDebut?: {
    lat?: number;
    lng?: number;
    adresseComplete?: string;
  };
  localisationFin?: {
    lat?: number;
    lng?: number;
    adresseComplete?: string;
  };
  pauses?: {
    debut: Date;
    fin?: Date;
    typePause: 'PAUSE_DEJEUNER' | 'PAUSE_PERSONNELLE' | 'REUNION' | 'AUTRE'; // Aligné avec le backend
    note: string;
  }[];
  dureePause?: number;
  dureeHeuresSupplementaires?: number;
  notes?: string;
  date: Date;
  restrictionsHorloge: 'FLEXIBLE' | 'MODERE' | 'STRICT'; // Aligné avec le backend
  status: 'EN_COURS' | 'EN_PAUSE' | 'TERMINE'; // Aligné avec le backend
}