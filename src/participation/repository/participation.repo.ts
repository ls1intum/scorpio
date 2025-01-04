import { StudentParticipation } from "@shared/models/participation.model";
import { ParticipationDB } from "./participation.interface.repo";

class ParticipationDBKeyValue implements ParticipationDB {
    getParticipation(participationId: string): Promise<StudentParticipation> {
        throw new Error("Method not implemented.");
    }

    saveParticipation(participation: StudentParticipation): Promise<StudentParticipation> {
        throw new Error("Method not implemented.");
    }
}