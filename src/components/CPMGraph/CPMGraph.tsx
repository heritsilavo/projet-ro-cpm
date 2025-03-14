import React, { useCallback, useEffect, useState } from "react";
import { ArcType, Task, EventType } from "./types";
import { calculatePredecessors } from "./utils";
import {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    ReactFlow,
    Node,
    Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProjectSummary } from "../ProjectSummary/ProjectSummary";

// Définition des données initiales
const initialTasks: Task[] = [
    { id: 'start', name: 'Début', duration: 0, successors: ['a'] },
    { id: 'a', name: 'a', duration: 7, successors: ['b'] },
    { id: 'b', name: 'b', duration: 7, successors: ['c'] },
    { id: 'c', name: 'c', duration: 15, successors: ['d'] },
    { id: 'd', name: 'd', duration: 30, successors: ['e', 'g', 'h'] },
    { id: 'e', name: 'e', duration: 45, successors: ['f'] },
    { id: 'f', name: 'f', duration: 15, successors: ['k'] },
    { id: 'g', name: 'g', duration: 45, successors: ['m'] },
    { id: 'h', name: 'h', duration: 60, successors: ['i'] },
    { id: 'i', name: 'i', duration: 20, successors: ['j'] },
    { id: 'j', name: 'j', duration: 30, successors: ['m'] },
    { id: 'k', name: 'k', duration: 30, successors: ['l'] },
    { id: 'l', name: 'l', duration: 15, successors: ['m'] },
    { id: 'm', name: 'm', duration: 30, successors: ['n', 'p'] },
    { id: 'n', name: 'n', duration: 15, successors: ['o'] },
    { id: 'o', name: 'o', duration: 30, successors: ['q'] },
    { id: 'p', name: 'p', duration: 15, successors: ['t'] },
    { id: 'q', name: 'q', duration: 15, successors: ['r', 's'] },
    { id: 'r', name: 'r', duration: 15, successors: ['u', 'w'] },
    { id: 's', name: 's', duration: 30, successors: ['v', 'w'] },
    { id: 't', name: 't', duration: 7, successors: ['u', 'v'] },
    { id: 'u', name: 'u', duration: 4, successors: ['fin'] },
    { id: 'v', name: 'v', duration: 2, successors: ['fin'] },
    { id: 'w', name: 'w', duration: 7, successors: ['fin'] },
    { id: 'fin', name: 'fin', duration: 0, successors: [] },
];

const getTaskById = function (id: string, listeTache: Task[]): (Task | null) {
    for (let i = 0; i < listeTache.length; i++) {
        if (listeTache[i].id == id) return listeTache[i];
    }
    return null;
}

const getTaskIndexInPredecessorSSuccessor = function (taskId: string, taskList: Task[]): number {
    var index = -1;
    const predecessor = getTaskById(getTaskById(taskId, taskList).predecessors[0], taskList);
    if (!!predecessor) {
        for (let i = 0; i < predecessor.successors.length; i++) {
            if (predecessor.successors[i] == taskId) index = i;
        }
    }
    return index;
}

const isThereTaskWithCommonSuccessor = function (taskId: string, taskList: Task[]): boolean {
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


//TODO: Creer un noeud personalisée avec un handler pour chaque sorties et un handler pour les 

export default function CPMGraph() {

    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [criticalPath, setCriticalPath] = useState<string[]>([]);

    // Calcul du chemin critique avec les dates au plus tôt et au plus tard
    const calculateCriticalPath = useCallback((tasksList: Task[]) => {
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
    }, []);

    //Les arcs representent les taches et le noueds representent les evenements(deb-a, )
    const generateEventsAndArcs = useCallback(function (tasks: Task[]): { events: EventType[], arcs: ArcType[] } {
        var events: EventType[] = [];
        var arcs: ArcType[] = []

        const tacheDebut = tasks.find(t => (t.id == 'start'));
        const eventDebut: EventType = {
            id: "debut-" + tasks[1].id,
            name: "deb",
            entree: [],
            sortie: tacheDebut.successors.map(s => ('debut-' + s))
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
                                        sortie: []
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
                            if (isEventExistBySuccesor(task.successors[0], events).exist) event = isEventExistBySuccesor(task.successors[0], events).event;
                            else {
                                event = {
                                    id: task.successors.map(s => ("debut-" + s)).join('_'),
                                    name: task.successors.map(s => ("debut-" + s)).join('_'),
                                    entree: [],
                                    sortie: task.successors.map((s, i) => ("debut-" + s + "-" + i))
                                }
                                events.push(event)
                            }
                        }
                    } else { //Cas normale
                        event = {
                            id: task.successors.map(s => ("debut-" + s)).join('_'),
                            name: task.successors.map(s => ("debut-" + s)).join('_'),
                            entree: [],
                            sortie: task.successors.map((s, i) => ("debut-" + s + "-" + i))
                        }
                        events.push(event)
                    }
                    arc.sortieNodeId = event.id;
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

        return { events, arcs };
    }, [tasks])

    // Fonction pour positionner les nœuds
    const layoutNodes = useCallback((events: EventType[]) => {

        const reactFlowNodes: Node[] = [];

        const nodeStyle = {
            width: 100,
            height: 40,
            borderRadius: '5px',
            backgroundColor: '#eee',
            border: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }

        events.forEach((event, index) => {
            reactFlowNodes.push({
                id: event.id,
                type: 'default',
                position: { x: index * 300, y: 0 },
                data: {
                    label: event.name,
                },
                style: nodeStyle,
            })
        });

        return reactFlowNodes;
    }, []);

    useEffect(function () {
        const { updatedTasks, criticalPathIds } = calculateCriticalPath(initialTasks);
        console.log("UPDATED TASKS", updatedTasks);

        setTasks(updatedTasks);
        setCriticalPath(criticalPathIds);
        const { arcs, events } = generateEventsAndArcs(updatedTasks);

        const generatedNodes = layoutNodes(events);
        setNodes(generatedNodes);

        console.log("EVENTS: ", events);
        console.log("ARCS: ", arcs);


    }, [])

    return <div style={{ width: '100%', height: '800px' }}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            //nodeTypes={nodeTypes}
            fitView
        >
            <Background />
            <Controls />
            <MiniMap />
            <ProjectSummary criticalPath={criticalPath} tasks={tasks}></ProjectSummary>
        </ReactFlow>
    </div>
}