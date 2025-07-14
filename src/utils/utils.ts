import { ArcType, EventType, Task } from "../components/CPMGraph/types";
import { Edge, Node } from "@xyflow/react";

// Optimisation: Créer un cache pour les recherches fréquentes
const taskCache = new Map<string, Task>();

// Calculer les prédécesseurs pour chaque tâche
export const calculatePredecessors = (tasksList: Task[]): Task[] => {
    const taskWithPredecessors = JSON.parse(JSON.stringify(tasksList)) as Task[];

    // Optimisation: Initialiser tous les prédécesseurs en une passe
    taskWithPredecessors.forEach((task) => {
        task.predecessors = [];
    });

    // Optimisation: Utiliser Map pour un accès O(1)
    const taskMap = new Map(taskWithPredecessors.map(task => [task.id, task]));

    taskWithPredecessors.forEach((task) => {
        if (task.successors?.length) {
            task.successors.forEach((successorId) => {
                const successor = taskMap.get(successorId);
                if (successor) {
                    successor.predecessors!.push(task.id);
                }
            });
        }
    });

    return taskWithPredecessors;
};

// Optimisation: Utiliser Map pour un accès plus rapide
export const getTaskById = function (id: string, listeTache: Task[]): Task | null {
    // Mise en cache pour éviter les recherches répétées
    if (taskCache.has(id)) {
        return taskCache.get(id)!;
    }
    
    const task = listeTache.find(task => task.id === id) || null;
    if (task) {
        taskCache.set(id, task);
    }
    return task;
}

// Optimisation: Améliorer la logique et gérer les cas d'erreur
export const getTaskIndexInPredecessorSSuccessor = function (taskId: string, taskList: Task[]): number {
    const task = getTaskById(taskId, taskList);
    if (!task?.predecessors?.length) return -1;
    
    const predecessor = getTaskById(task.predecessors[0], taskList);
    if (!predecessor?.successors?.length) return -1;
    
    return predecessor.successors.findIndex(id => id === taskId);
}

// Optimisation: Simplifier la logique avec des méthodes plus efficaces
export const isThereTaskWithCommonSuccessor = function (taskId: string, taskList: Task[]): boolean {
    const task = getTaskById(taskId, taskList);
    if (!task?.successors?.length) return false;
    
    const taskSuccessors = new Set(task.successors);
    
    return taskList.some(otherTask => 
        otherTask.id !== taskId && 
        otherTask.successors?.some(successor => taskSuccessors.has(successor))
    );
}

export const calculateCriticalPath = (tasksList: Task[]) => {
    const tasksWithPredecessors = calculatePredecessors(tasksList);
    const result = JSON.parse(JSON.stringify(tasksWithPredecessors)) as Task[];

    // Optimisation: Utiliser Map pour un accès plus rapide
    const taskMap = new Map(result.map(task => [task.id, task]));

    // Calculer les dates au plus tôt (forward pass)
    result.forEach((task) => {
        task.earliest = 0;
    });

    // Optimisation: Tri topologique amélioré avec détection de cycles
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (taskId: string): boolean => {
        if (visiting.has(taskId)) {
            throw new Error(`Cycle détecté impliquant la tâche: ${taskId}`);
        }
        if (visited.has(taskId)) return true;

        visiting.add(taskId);
        const task = taskMap.get(taskId);

        if (task?.successors?.length) {
            for (const successorId of task.successors) {
                if (!visit(successorId)) return false;
            }
        }

        visiting.delete(taskId);
        visited.add(taskId);
        sorted.unshift(taskId);
        return true;
    };

    // Commencer par le début
    if (!visit('start')) {
        throw new Error('Erreur lors du tri topologique');
    }

    // Forward pass (early start/finish) - optimisé
    sorted.forEach((taskId) => {
        const task = taskMap.get(taskId);
        if (!task) return;

        if (task.predecessors?.length) {
            let maxEarliest = 0;
            for (const predId of task.predecessors) {
                const pred = taskMap.get(predId);
                if (pred) {
                    maxEarliest = Math.max(maxEarliest, (pred.earliest || 0) + pred.duration);
                }
            }
            task.earliest = maxEarliest;
        } else {
            task.earliest = 0;
        }
    });

    // Calculer la durée totale du projet
    const endTask = taskMap.get('fin');
    if (!endTask) {
        throw new Error('Tâche "fin" non trouvée');
    }
    const projectDuration = endTask.earliest || 0;

    // Calculer les dates au plus tard (backward pass)
    result.forEach((task) => {
        task.latest = projectDuration;
    });

    // Backward pass (late start/finish) - optimisé
    [...sorted].reverse().forEach((taskId) => {
        const task = taskMap.get(taskId);
        if (!task) return;

        if (task.successors?.length) {
            let minLatest = Infinity;
            for (const succId of task.successors) {
                const succ = taskMap.get(succId);
                if (succ) {
                    minLatest = Math.min(minLatest, (succ.latest || 0) - task.duration);
                }
            }
            task.latest = minLatest !== Infinity ? minLatest : projectDuration - task.duration;
        } else {
            task.latest = projectDuration - task.duration;
        }

        // Calculer la marge de chaque tâche
        task.slack = (task.latest || 0) - (task.earliest || 0);
    });

    // Identifier le chemin critique
    const critical = result.filter((task) => task.slack === 0).map((task) => task.id);

    return { updatedTasks: result, criticalPathIds: critical };
}

// Optimisation: Refactoriser pour plus de lisibilité et de maintenabilité
export const generateEventsAndArcs = function (tasks: Task[]): { events: EventType[], arcs: ArcType[] } {
    const events: EventType[] = [];
    const arcs: ArcType[] = [];
    
    // Optimisation: Utiliser Map pour un accès plus rapide
    const taskMap = new Map(tasks.map(task => [task.id, task]));

    // Créer l'événement de début
    const startTask = taskMap.get('start');
    if (!startTask) {
        throw new Error('Tâche "start" non trouvée');
    }

    const eventDebut: EventType = {
        id: startTask.successors?.map(c => `debut-${c}`).join('_') || 'debut',
        name: "deb",
        entree: [],
        sortie: startTask.successors?.map(s => `debut-${s}`) || [],
        erliest: 0
    };

    events.push(eventDebut);

    // Fonctions utilitaires pour améliorer la lisibilité
    const findEventBySuccessor = (successor: string): EventType | null => {
        return events.find(e => e.id === `debut-${successor}`) || null;
    };

    const generateUniqueEventId = (baseId: string): string => {
        let id = baseId;
        let counter = 1;
        while (events.some(e => e.id === id)) {
            id = `${baseId}-${counter}`;
            counter++;
        }
        return id;
    };

    const shouldCreateJunction = (task: Task): boolean => {
        if (!task.successors?.length) return false;
        
        const tasksWithCommonSuccessors = tasks.filter(t => 
            t.id !== task.id && 
            t.successors?.some(s => task.successors?.includes(s))
        );
        
        const formatSuccessors = (t: Task) => t.successors?.sort().join('-') || '';
        
        return tasksWithCommonSuccessors.some(t => 
            t.successors && t.successors.length > 1 && 
            formatSuccessors(t) !== formatSuccessors(task)
        );
    };

    // Traitement des tâches principales
    tasks.forEach((task) => {
        if (task.id === 'start' || task.id === 'fin') return;

        const entryEvent = events.find(e => e.id.includes(`debut-${task.id}`));
        if (!entryEvent) {
            console.error(`Impossible de trouver l'événement d'entrée pour la tâche: ${task.id}`);
            return;
        }

        const arc: ArcType = {
            id: task.id,
            name: task.name,
            entreeNodeId: entryEvent.id,
            entreeHandlerId: `${entryEvent.id}-${getTaskIndexInPredecessorSSuccessor(task.id, tasks)}`,
            sortieNodeId: "",
            task
        };

        // Gestion des événements de sortie
        if (isThereTaskWithCommonSuccessor(task.id, tasks)) {

            if (task.successors && shouldCreateJunction(task)) {
                // Créer un événement de jonction
                const junctionEventId = generateUniqueEventId(`junction-${task.id}`);
                const junctionEvent: EventType = {
                    id: junctionEventId,
                    name: `junction-${task.name}`,
                    entree: [arc.id],
                    sortie: []
                };
                events.push(junctionEvent);
                arc.sortieNodeId = junctionEventId;

                // Créer des arcs fictifs
                task.successors.forEach((successorId, index) => {
                    let successorEvent = findEventBySuccessor(successorId);
                    if (!successorEvent) {
                        const successorTask = taskMap.get(successorId);
                        successorEvent = {
                            id: `debut-${successorId}`,
                            name: `debut-${successorTask?.name || successorId}`,
                            entree: [],
                            sortie: [`debut-${successorId}-${index}`]
                        };
                        events.push(successorEvent);
                    }

                    const dummyArc: ArcType = {
                        id: `dummy-${task.id}-to-${successorId}`,
                        name: "",
                        entreeNodeId: junctionEventId,
                        entreeHandlerId: `${junctionEventId}-${index}`,
                        sortieNodeId: successorEvent.id,
                        task: {
                            id: `dummy-${task.id}-${successorId}`,
                            name: "",
                            duration: 0,
                            successors: []
                        }
                    };

                    arcs.push(dummyArc);
                    junctionEvent.sortie.push(dummyArc.id);
                    successorEvent.entree.push(dummyArc.id);
                });
            } else {
                // Logique pour les autres cas
                const handleMultipleSuccessors = () => {
                    if (!task.successors) return;
                    
                    const successorId = task.successors.map(s => `debut-${s}`).join('_');
                    let event = events.find(e => e.id === successorId);
                    
                    if (!event) {
                        event = {
                            id: successorId,
                            name: successorId,
                            entree: [],
                            sortie: task.successors.map((s, i) => `debut-${s}-${i}`)
                        };
                        events.push(event);
                    }
                    
                    event.entree.push(arc.id);
                    arc.sortieNodeId = event.id;
                };

                if (task.successors && task.successors.length > 1) {
                    handleMultipleSuccessors();
                } else if (task.successors && task.successors.length === 1) {
                    let event = findEventBySuccessor(task.successors[0]);
                    if (!event) {
                        event = {
                            id: `debut-${task.successors[0]}`,
                            name: `debut-${task.successors[0]}`,
                            entree: [],
                            sortie: [`debut-${task.successors[0]}-0`]
                        };
                        events.push(event);
                    }
                    event.entree.push(arc.id);
                    arc.sortieNodeId = event.id;
                }
            }
        } else {
            // Cas normal
            if (task.successors) {
                const event: EventType = {
                    id: task.successors.map(s => `debut-${s}`).join('_'),
                    name: task.successors.map(s => `debut-${s}`).join('_'),
                    entree: [arc.id],
                    sortie: task.successors.map((s, i) => `debut-${s}-${i}`)
                };
                events.push(event);
                arc.sortieNodeId = event.id;
            }
        }

        arcs.push(arc);
    });

    // Mise à jour de l'événement de fin
    const finEventIndex = events.findIndex(e => e.id.includes('fin'));
    if (finEventIndex !== -1) {
        events[finEventIndex].name = "fin";
    }

    // Ajouter les tâches aux événements
    events.forEach((event) => {
        event.taskEntries = [];
        event.taskExits = [];
        
        event.entree.forEach((taskId) => {
            const task = taskId.includes("dummy") 
                ? taskMap.get(taskId.split("-")[1])
                : taskMap.get(taskId);
            if (task) {
                event.taskEntries.push(task);
            }
        });

        event.sortie.forEach((taskId) => {
            const task = taskMap.get(taskId.split("-")[1]);
            if (task) {
                event.taskExits.push(task);
            }
        });
    });

    // Calcul des dates au plus tôt (optimisé avec mémoïsation)
    const memoizedEarliest = new Map<string, number>();
    
    const calculateEarliest = (event: EventType): number => {
        if (event.name === "deb") {
            return event.erliest = 0;
        }
        
        if (memoizedEarliest.has(event.id)) {
            return memoizedEarliest.get(event.id)!;
        }

        const previousEntries = event.entree.map(entree => ({
            event: events.find(e => e.id.includes(`-${entree}`) || 
                (entree.includes("dummy") && e.id.includes(`-${entree.split('-')[1]}`))),
            task: taskMap.get(entree) || taskMap.get(entree.split('-')[1])
        })).filter(entry => entry.event && entry.task);

        const earliest = Math.max(...previousEntries.map(entry => {
            const eventEarliest = entry.event!.erliest ?? calculateEarliest(entry.event!);
            return eventEarliest + entry.task!.duration;
        }));

        event.erliest = earliest;
        memoizedEarliest.set(event.id, earliest);
        return earliest;
    };

    events.forEach(event => {
        if (event.name !== "deb") {
            calculateEarliest(event);
        }
    });

    // Calcul des dates au plus tard (optimisé)
    const calculateLatests = (event: EventType): void => {
        if (event.latests) return; // Éviter les calculs redondants

        if (event.name === "fin") {
            event.latests = [{ taskId: "", latest: event.erliest || 0 }];
            return;
        }

        if (event.id.includes("junction")) {
            const nextNodes = event.sortie
                .map(s => events.find(e => e.id === `debut-${s.split('-')[3]}`))
                .filter(Boolean);
            
            nextNodes.forEach(node => calculateLatests(node!));
            
            const values = nextNodes.map(node => 
                Math.min(...(node!.latests?.map(l => l.latest) || [0]))
            );
            
            event.latests = [{ latest: Math.min(...values), taskId: "" }];
        } else {
            const endTasks = event.taskExits || [];
            const latests: { taskId: string; latest: number }[] = [];

            endTasks.forEach((task, i) => {
                const arc = arcs.find(a => a.id === event.sortie[i]?.split("-")[1]);
                if (!arc) return;

                const nextNode = events.find(e => e.id === arc.sortieNodeId);
                if (!nextNode) return;

                calculateLatests(nextNode);
                const values = nextNode.latests?.map(l => l.latest - task.duration) || [0];
                latests.push({ taskId: task.id, latest: Math.min(...values) });
            });

            event.latests = latests;
        }
    };

    // Calculer les dates au plus tard en commençant par le début
    if (events.length > 0) {
        calculateLatests(events[0]);
    }

    return { events, arcs };
}

// Fonction pour positionner les nœuds (optimisée)
export const layoutNodes = (tasks: Task[], events: EventType[], criticalPathIds: string[]) => {

    const calculateDepth = () => {
        const depthMap = new Map<string, number>();
        const updateDepthMap = new Map<string, number>();

        // First, initialize all events with a base depth of 0
        events.forEach((event) => {
            depthMap.set(event.id, 0);
        });

        // Recursive depth calculation
        events.forEach((event) => {
            if (event.id.includes("_")) {
                const SuccTasks = event.id.split("_").map((eventId) =>
                    getTaskById(eventId.split("-")[1], tasks)
                );

                SuccTasks.forEach((task) => {
                    if (task.successors.length === 1) {
                        const eventSuccessor = events.find(e => e.id.includes("-" + task.successors[0]));
                        if (eventSuccessor) {
                            updateDepthMap.set(eventSuccessor.id, 1);
                        }
                    }

                    if (task.successors.length > 1) {
                        task.successors.forEach((successorId, index) => {
                            const eventSuccessor = events.find(e => e.id.includes("-" + successorId));
                            if (eventSuccessor) {
                                updateDepthMap.set(eventSuccessor.id, 1 + index);
                            }
                        });
                    }
                });
            }
        });

        // Update depth map with calculated depths
        for (const [eventId, depth] of Array.from(updateDepthMap.entries())) {
            const currentDepth = depthMap.get(eventId) || 0;
            depthMap.set(eventId, currentDepth + depth);
        }

        return depthMap;
    };

    const depthMap = calculateDepth();
    const criticalPathSet = new Set(criticalPathIds);

    const reactFlowNodes: Node[] = events.map((event, index) => {
        const depth = depthMap.get(event.id) || 0;
        
        const isCritical = event.name !== "deb" && event.name !== "fin" && 
            event.entree.some(entree => {
                if (entree.includes("dummy")) {
                    return criticalPathSet.has(entree.split("-")[1]);
                }
                return criticalPathSet.has(entree);
            })
            && event.sortie.some(sort => {
                if (sort.includes("dummy")) {
                    return criticalPathSet.has(sort.split("-")[3]);
                }
                return criticalPathSet.has(sort.split("-")[1]);
            });

        return {
            id: event.id,
            type: 'custom',
            position: {
                x: depth === 0 ? index * 300 : index * 300,
                y: depth * 250
            },
            data: {
                event: event,
                isCritical
            },
        };
    });

    return reactFlowNodes;
}

// Fonction pour générer les arêtes (optimisée)
export const generateEdges = (arcList: ArcType[], criticalPathIds: string[]) => {
    const edgesList: Edge[] = [];
    const edgeGroups = new Map<string, ArcType[]>();
    const criticalPathSet = new Set(criticalPathIds);

    // Grouper les arêtes par paire source-target
    arcList.forEach(arc => {
        const key = `${arc.entreeNodeId}-${arc.sortieNodeId}`;
        if (!edgeGroups.has(key)) {
            edgeGroups.set(key, []);
        }
        edgeGroups.get(key)!.push(arc);
    });

    // Créer les arêtes avec optimisation
    edgeGroups.forEach((arcs) => {
        arcs.forEach((arc, index) => {
            let isCritical = criticalPathSet.has(arc.id);

            // Gestion des arcs fictifs
            if (arc.id.includes("dummy")) {
                const taskId1 = arc.id.split("-")[1];
                const taskId2 = arc.id.split("-")[3];
                isCritical = criticalPathSet.has(taskId1) && criticalPathSet.has(taskId2);
            }

            edgesList.push({
                id: arc.id,
                source: arc.entreeNodeId,
                target: arc.sortieNodeId,
                data: {
                    name: arc.name,
                    duration: arc.task?.duration || 0,
                    isCritical,
                    slack: arc.task?.slack || 0,
                    confondus: arcs,
                    edgeIndex: index,
                    totalConfondus: arcs.length
                },
                type: "custom"
            });
        });
    });

    return edgesList;
};

// Fonction inchangée
export const getStepsDescriptions = (step: number) => {
    const descriptions = {
        1: "Traçage du graphe",
        2: "Calcul des dates au plus tot",
        3: "Le chemin critique",
        4: "Dates au plus tards",
        5: "Marges de retards"
    };

    const texte = descriptions[step as keyof typeof descriptions] || "";
    return `(${step}) - ${texte}`;
}

// Nettoyage du cache (fonction utilitaire)
export const clearTaskCache = () => {
    taskCache.clear();
};