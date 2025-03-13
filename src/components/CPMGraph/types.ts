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

export class EventType {
    id: string;
    name: string;
    entree: string[];
    sortie: string[];

    constructor() {
        this.id = "";
        this.name = "";
        this.entree = [];
        this.sortie = [];
    }
}

export interface ArcType {
    id: string;
    name: string;
    entreeNodeId: string;
    entreeHandlerId: string;
    sortieNodeId: string;
    task: Task;
}