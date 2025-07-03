import { ArcType, EventType, Task } from "../components/CPMGraph/types";
import { Edge, Node } from "@xyflow/react";

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

export const getTaskById = function (id: string, listeTache: Task[]): (Task | null) {
    for (let i = 0; i < listeTache.length; i++) {
        if (listeTache[i].id == id) return listeTache[i];
    }
    return null;
}

export const getTaskIndexInPredecessorSSuccessor = function (taskId: string, taskList: Task[]): number {
    var index = -1;
    const predecessor = getTaskById(getTaskById(taskId, taskList).predecessors[0], taskList);
    if (!!predecessor) {
        for (let i = 0; i < predecessor.successors.length; i++) {
            if (predecessor.successors[i] == taskId) index = i;
        }
    }
    return index;
}

export const isThereTaskWithCommonSuccessor = function (taskId: string, taskList: Task[]): boolean {
    const task = getTaskById(taskId, taskList);
    var exist = false;
    if (!!task) {
        taskList.filter(t => t.id != taskId).forEach(t => {
            t.successors.forEach(succ1 => {
                task.successors.forEach(succ2 => {
                    if (succ1 == succ2) exist = true;
                })
            });
        });
    }
    return exist;
}

export const calculateCriticalPath = (tasksList: Task[]) => {
    const tasksWithPredecessors = calculatePredecessors(tasksList);
    const result = JSON.parse(JSON.stringify(tasksWithPredecessors)) as Task[];

    // Calculer les dates au plus tôt (forward pass)
    result.forEach((task) => {
        task.earliest = 0;
    });

    // Tri topologique pour le forward pass
    let sorted: string[] = [];
    let visited = new Set<string>();
    let temp = new Set<string>();

    const visit = (taskId: string) => {
        if (temp.has(taskId)) return; // Détection de cycle
        if (visited.has(taskId)) return;

        temp.add(taskId);
        const task = result.find((t) => t.id === taskId);

        if (task && task.successors) {
            task.successors.forEach((successorId) => visit(successorId));
        }

        temp.delete(taskId);
        visited.add(taskId);
        sorted.unshift(taskId);
    };

    // Commencer par le début
    visit('start');

    // Forward pass (early start/finish)
    sorted.forEach((taskId) => {
        const task = result.find((t) => t.id === taskId);

        if (task.predecessors && task.predecessors.length > 0) {
            task.earliest = Math.max(
                ...task.predecessors.map((predId) => {
                    const pred = result.find((t) => t.id === predId);
                    return pred!.earliest! + pred!.duration;
                })
            );
        } else {
            task.earliest = 0;
        }
    });

    // Calculer la durée totale du projet
    const endTask = result.find((t) => t.id === 'fin');
    const projectDuration = endTask!.earliest!;

    // Calculer les dates au plus tard (backward pass)
    result.forEach((task) => {
        task.latest = projectDuration;
    });

    // Backward pass (late start/finish)
    [...sorted].reverse().forEach((taskId) => {
        const task = result.find((t) => t.id === taskId);

        if (task.successors && task.successors.length > 0) {
            task.latest = Math.min(
                ...task.successors.map((succId) => {
                    const succ = result.find((t) => t.id === succId);
                    return succ!.latest! - task.duration;
                })
            );
        } else {
            task.latest = projectDuration - task.duration;
        }

        // Calculer la marge de chaque tâche
        task.slack = task.latest! - task.earliest!;
    });

    // Identifier le chemin critique
    const critical = result.filter((task) => task.slack === 0).map((task) => task.id);

    return { updatedTasks: result, criticalPathIds: critical };
}

//Les arcs representent les taches et le noueds representent les evenements(deb-a, )
export const generateEventsAndArcs = function (tasks: Task[]): { events: EventType[], arcs: ArcType[] } {
    var events: EventType[] = [];
    var arcs: ArcType[] = []

    const tacheDebut = tasks.find(t => (t.id == 'start'));
    const eventDebut: EventType = {
        id: "debut-" + tasks[1].id,
        name: "deb",
        entree: [],
        sortie: tacheDebut.successors.map(s => ('debut-' + s)),
        erliest: 0
    }

    events.push(eventDebut);

    tasks.forEach((task: Task, index: number) => {
        if (task.id != 'start' && task.id != "fin") {

            //CREER UN ARC
            const entryEvent = events.find(e => e.id.includes('debut-' + task.id))
            if (!entryEvent) {
                console.error("CAN'T FIND ENTRY NODE FOR TASK:" + JSON.stringify(task));
            } else {
                var arc: ArcType = {
                    id: task.id,
                    name: task.name,
                    entreeNodeId: entryEvent.id,
                    entreeHandlerId: entryEvent.id + "-" + getTaskIndexInPredecessorSSuccessor(task.id, tasks), //entreeNodeId + index in predecessor's successor list
                    sortieNodeId: "",//A Completer apres creation de l'event
                    task
                }

                ////CREER UN EVENT
                var event: EventType = new EventType();


                const isEventExistBySuccesor = (successor: string, eventList: EventType[]): { exist: boolean, event: EventType | null } => {
                    var result: { exist: boolean, event: EventType | null } = { exist: false, event: null };
                    eventList.forEach(existingEvent => {
                        if (existingEvent.id == "debut-" + successor) result = { exist: true, event: existingEvent }
                    });
                    return result;
                }

                const generateUniqueEventId = (baseId: string, events: EventType[]): string => {
                    let id = baseId;
                    let counter = 1;
                    while (events.some(e => e.id === id)) {
                        id = `${baseId}-${counter}`;
                        counter++;
                    }
                    return id;
                };

                if (isThereTaskWithCommonSuccessor(task.id, tasks)) {
                    if (task.successors.length > 1) {
                        // Create a junction event for this task's exit
                        const junctionEventId = generateUniqueEventId("junction-" + task.id, events);
                        const junctionEvent: EventType = {
                            id: junctionEventId,
                            name: "junction-" + task.name,
                            entree: [arc.id],
                            sortie: []
                        };
                        events.push(junctionEvent);
                        arc.sortieNodeId = junctionEventId;

                        // Create dummy arcs from junction to each successor's entry event
                        task.successors.forEach((successorId, index) => {
                            // Find or create successor entry event
                            let successorEvent = events.find(e => e.id === "debut-" + successorId);
                            if (!successorEvent) {
                                successorEvent = {
                                    id: "debut-" + successorId,
                                    name: "debut-" + getTaskById(successorId, tasks)?.name || successorId,
                                    entree: [],
                                    sortie: ["debut-" + successorId + "-" + index]
                                };
                                events.push(successorEvent);
                            }

                            // Create dummy arc
                            const dummyArc: ArcType = {
                                id: `dummy-${task.id}-to-${successorId}`,
                                name: "", // Empty name for dummy arcs
                                entreeNodeId: junctionEventId,
                                entreeHandlerId: `${junctionEventId}-${index}`,
                                sortieNodeId: successorEvent.id,
                                task: {
                                    id: `dummy-${task.id}-${successorId}`,
                                    name: "",
                                    duration: 0, // Zero duration for dummy arcs
                                    successors: []
                                }
                            };

                            arcs.push(dummyArc);
                            junctionEvent.sortie.push(dummyArc.id);
                            successorEvent.entree.push(dummyArc.id);
                        });
                    } else if (task.successors.length == 1) {
                        if (isEventExistBySuccesor(task.successors[0], events).exist) {
                            event = isEventExistBySuccesor(task.successors[0], events).event;
                            event.entree.push(arc.id);
                        }
                        else {

                            event = {
                                id: task.successors.map(s => ("debut-" + s)).join('_'),
                                name: task.successors.map(s => ("debut-" + s)).join('_'),
                                entree: [],
                                sortie: task.successors.map((s, i) => ("debut-" + s + "-" + i))
                            }
                            event.entree.push(arc.id);
                            events.push(event)
                        }
                        arc.sortieNodeId = event.id;
                    }
                } else { //Cas normale
                    event = {
                        id: task.successors.map(s => ("debut-" + s)).join('_'),
                        name: task.successors.map(s => ("debut-" + s)).join('_'),
                        entree: [],
                        sortie: task.successors.map((s, i) => ("debut-" + s + "-" + i))
                    }
                    arc.sortieNodeId = event.id;
                    event.entree.push(arc.id);
                    events.push(event)
                }

                arcs.push(arc);
            }

        }
    });

    const eventFinIndex = events.findIndex(e => e.id.includes('fin'));
    if (eventFinIndex == -1)
        console.error("CAN'T FIND FIN EVENT");
    else {
        events[eventFinIndex].name = "fin";
    }

    //Add tasks
    events.forEach((event) => {


        event.entree.forEach((taskId) => {

            if (taskId.includes("dummy")) {
                const task = tasks.find(t => t.id === taskId.split("-")[3]);
                event.taskEntries = event.taskEntries || [];
                event.taskEntries.push(task);
            } else {
                const t = getTaskById(taskId, tasks);
                event.taskEntries = event.taskEntries || [];
                event.taskEntries.push(t);
            }
        });

        event.sortie.forEach((taskId) => {
            const t = getTaskById(taskId.split("-")[1], tasks);
            event.taskExits = event.taskExits || [];
            event.taskExits.push(t);
        });


    });

    //calculate erliest
    events.forEach((event) => {
        if (event.name != "deb") {
            var erliests: number[] = [];
            const previousEtries = event.entree.map(entree => ({ event: events.find(e => (e.id.includes("-" + entree) || (entree.includes("dummy") && e.id.includes("-" + entree.split('-')[1])))), task: tasks.find(t => (t.id == entree) || (entree.includes("dummy") && t.id == entree.split('-')[1])) }));

            const calculateErliest = function (e: EventType) {
                const previous = e.entree.map(entree => ({ event: events.find(e => (e.id.includes("-" + entree) || (entree.includes("dummy") && e.id.includes("-" + entree.split('-')[1])))), task: tasks.find(t => (t.id == entree) || (entree.includes("dummy") && t.id == entree.split('-')[1])) }));
                previous.forEach(entry => {
                    if (!entry.event.erliest) {
                        calculateErliest(entry.event)
                    }
                });
                e.erliest = Math.max(...previous.map(entry => (entry.event.erliest + entry.task.duration)));
            }

            //si le previousEntry n'a pas de erliest calculer le d'abord et faire de meme pour ses previousEntry a lui.
            previousEtries.forEach(entry => {
                if (!entry.event.erliest && entry.event.erliest != 0) {
                    calculateErliest(entry.event)
                }
            });

            event.erliest = Math.max(...previousEtries.map(entry => (entry.event.erliest + entry.task.duration)));
        }
    });

    //TODO: calculate latests
    //Ne pas retenir qu'une seule valeur retenire une liste de { taskId: string, latest: number }
    const calculateLatests = function (event: EventType) {
        //console.log("%%%%%%%%%%%: ", event.id, event);
        if (event.name == "fin") {
            event.latests = [{ taskId: "", latest: event.erliest }]
        } else if (event.id.includes("junction")) {
            var nextNodes = event.sortie.map(s => events.find(e => e.id == "debut-" + s.split('-')[3]));
            nextNodes.forEach(n => calculateLatests(n));

            nextNodes = nextNodes.map(n => events.find(e => e.id == n.id));
            var values = [];
            nextNodes.forEach(node => values.push(Math.min(...node.latests.map(l => l.latest))))
            //console.log("%%%%%%%%", event.id, values);
            event.latests = [{ latest: Math.min(...values), taskId: "" }]
        } else {
            const endTasks = event.taskExits;
            if (!!endTasks) {
                var latests = []
                endTasks.forEach((t, i) => {
                    const arc = arcs.find(a => a.id == event.sortie[i].split("-")[1])

                    var values = []

                    const nextNode = events.find(e => e.id == arc.sortieNodeId);
                    if (!nextNode.latests) nextNode.latests = [];
                    calculateLatests(nextNode);
                    values = nextNode.latests.map(l => l.latest - t.duration);
                    //console.log("%%%%%%%%", event.id, values);
                    latests.push({ taskId: t.id, latest: Math.min(...values) })

                });
                event.latests = [...latests]
            }
        }

    }
    calculateLatests(events[0])

    return { events, arcs };
}

// Fonction pour positionner les nœuds
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

    // Calculate depths
    const depthMap = calculateDepth();
    console.log("DEPTH MAP", depthMap);

    const reactFlowNodes: Node[] = events.map((event, index) => {
        const depth = depthMap.get(event.id) || 0;

        var isCritical = false;

        event.entree.forEach(e => {
            if (criticalPathIds.includes(e)) isCritical = true;
            else if (e.includes("dummy") && criticalPathIds.includes(e.split("-")[3])) isCritical = true
        })
        if (event.name == "deb" || event.name == "fin") isCritical = false

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

// Fonction pour générer les arêtes
export const generateEdges = (arcList: ArcType[], criticalPathIds: string[]) => {
    const edgesList: Edge[] = [];

    arcList.forEach((arc) => {
        var isCritical = criticalPathIds.includes(arc.id)

        if (arc.id.includes("dummy")) {
            const eventsId = arc.id.split("-").filter((id) => id.length == 1);
        
            if (criticalPathIds.includes(eventsId[0]) && criticalPathIds.includes(eventsId[1])) {
                isCritical = true;
            }
        }

        edgesList.push({
            id: arc.id,
            source: arc.entreeNodeId,
            target: arc.sortieNodeId,
            data: {
                name: arc.name,
                duration: arc.task?.duration || 0,
                isCritical,
                slack: arc.task.slack
            },
            type: "custom"
        });
    });

    return edgesList;
}

export const getStepsDescriptions = (step: number) => {
    var texte = "";
    switch (step) {
        case 1:
            texte = "Traçage du graphe"
            break;
        case 2:
            texte = "Calcul des dates au plus tot"
            break;
        case 3:
            texte = "Le chemin critique"
            break;
        case 4:
            texte = "Dates au plus tards"
            break;
        case 5:
            texte = "Marges de retards"
            break;

        default:
            break;
    }

    return `(${step}) - ${texte}`;
}