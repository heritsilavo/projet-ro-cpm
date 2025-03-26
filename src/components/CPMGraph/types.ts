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
    taskEntries?: Task[];
    taskExits?: Task[];
    erliest?: number;
    latests?: { taskId: string, latest: number }[];

    constructor() {
        this.id = "";
        this.name = "";
        this.entree = [];
        this.sortie = [];
        this.erliest = 0;
        this.taskEntries = [];
        this.taskExits = [];
        this.latests = [];
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