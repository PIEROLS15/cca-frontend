export interface CommonerLicenseVerification {
  id: number;
  dni: string;
  licenseNumber: string;
  fullName: string;
  firstNames: string;
  lastNames: string;
  gender: string;
  photoUrl: string | null;
  hasPhoto: boolean;
  isActive: boolean;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}
