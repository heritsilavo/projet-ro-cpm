export interface Task {
    id: string;
    name: string;
    duration: number;
    successors: string[];
    predecessors?: string[];
    earliest?: number;
    latest?: number;
    slack?: number;
}

export interface EventType {
    id: string;
    name: string;
    entree: string[];
    sortie: string[];
}

export interface ArcType {
    id: string;
    name: string;
    entree: string;
    sortie: string;
    task: Task;
}