import { Course } from "./course.model";
import { StudentParticipation } from "./participation.model";

export abstract class Exercise {
    public id?: number;
    public problemStatement?: string;
    public title?: string;
    public shortName?: string;
    public releaseDate?: Date;
    public startDate?: Date;
    public dueDate?: Date;
    public assessmentDueDate?: Date;
    public maxPoints?: number;
    public bonusPoints?: number;
    public assessmentType?: AssessmentType;
    public allowComplaintsForAutomaticAssessments?: boolean;
    public allowFeedbackRequests?: boolean;
    public difficulty?: DifficultyLevel;
    public mode?: ExerciseMode = ExerciseMode.INDIVIDUAL; // default value
    public includedInOverallScore?: IncludedInOverallScore = IncludedInOverallScore.INCLUDED_COMPLETELY; // default value
    // public categories?: ExerciseCategory[];
    public type?: ExerciseType;
    public exampleSolutionPublicationDate?: Date;

    public studentParticipations?: StudentParticipation[];
    public course?: Course;

    constructor(type: ExerciseType) {}
}

export class ProgrammingExercise extends Exercise {
    public projectKey?: string;

    public programmingLanguage?: ProgrammingLanguage;
    public showTestNamesToStudents?: boolean;

    /**
     * This attribute is used to generate a programming exercise with no connection to the VCS and CI.
     * This functionality is only for testing purposes.
     */
    public noVersionControlAndContinuousIntegrationAvailable?: boolean;

    constructor(course: Course | undefined) {
        super(ExerciseType.PROGRAMMING);
        this.course = course;
    }
}

export enum AssessmentType {
    AUTOMATIC = 'AUTOMATIC',
    SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
    MANUAL = 'MANUAL',
    AUTOMATIC_ATHENA = 'AUTOMATIC_ATHENA',
}

export enum DifficultyLevel {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
}

export enum ExerciseMode {
    INDIVIDUAL = 'INDIVIDUAL',
    TEAM = 'TEAM',
}

export enum IncludedInOverallScore {
    INCLUDED_COMPLETELY = 'INCLUDED_COMPLETELY',
    INCLUDED_AS_BONUS = 'INCLUDED_AS_BONUS',
    NOT_INCLUDED = 'NOT_INCLUDED',
}

export enum ExerciseType {
    PROGRAMMING = 'programming',
    MODELING = 'modeling',
    QUIZ = 'quiz',
    TEXT = 'text',
    FILE_UPLOAD = 'file-upload',
}

export enum ProgrammingLanguage {
    EMPTY = 'EMPTY',
    ASSEMBLER = 'ASSEMBLER',
    C = 'C',
    C_PLUS_PLUS = 'C_PLUS_PLUS',
    C_SHARP = 'C_SHARP',
    HASKELL = 'HASKELL',
    JAVA = 'JAVA',
    JAVASCRIPT = 'JAVASCRIPT',
    KOTLIN = 'KOTLIN',
    OCAML = 'OCAML',
    PYTHON = 'PYTHON',
    R = 'R',
    RUST = 'RUST',
    SWIFT = 'SWIFT',
    TYPESCRIPT = 'TYPESCRIPT',
    VHDL = 'VHDL',
}