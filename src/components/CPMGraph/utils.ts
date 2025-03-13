import { Task } from "./types";

// Calculer les prédécesseurs pour chaque tâche
export const calculatePredecessors = (tasksList: Task[]): Task[] => {
    const taskWithPredecessors = JSON.parse(JSON.stringify(tasksList)) as Task[];

    taskWithPredecessors.forEach((task) => {
        task.predecessors = [];
    });

    taskWithPredecessors.forEach((task) => {
        if (task.successors) {
            task.successors.forEach((successorId) => {
                const successor = taskWithPredecessors.find((t) => t.id === successorId);
                if (successor) {
                    successor.predecessors!.push(task.id);
                }
            });
        }
    });

    return taskWithPredecessors;
};