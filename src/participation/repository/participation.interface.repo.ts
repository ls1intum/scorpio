import { StudentParticipation } from "@shared/models/participation.model";

export interface ParticipationDB {
    getParticipation(participationId: string): Promise<StudentParticipation>;
    saveParticipation(participation: StudentParticipation): Promise<StudentParticipation>;
}