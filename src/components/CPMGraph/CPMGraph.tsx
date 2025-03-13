import React, { useCallback, useEffect, useState } from "react";
import { ArcType, Task, EventType } from "./types";
import { calculatePredecessors } from "./utils";


// Définition des données initiales
const initialTasks: Task[] = [
    { id: 'start', name: 'Début', duration: 0, successors: ['a'] },
    { id: 'a', name: 'a', duration: 7, successors: ['b'] },
    { id: 'b', name: 'b', duration: 7, successors: ['c'] },
    { id: 'c', name: 'c', duration: 15, successors: ['d'] },
    { id: 'd', name: 'd', duration: 30, successors: ['e', 'g', 'h'] },
    { id: 'e', name: 'e', duration: 45, successors: ['f'] },
    { id: 'f', name: 'f', duration: 15, successors: ['k'] },
    { id: 'g', name: 'g', duration: 45, successors: ['l'] },
    { id: 'h', name: 'h', duration: 60, successors: ['i'] },
    { id: 'i', name: 'i', duration: 20, successors: ['j'] },
    { id: 'j', name: 'j', duration: 30, successors: ['l'] },
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

const getTaskById = function (id:string, listeTache: Task[]):(Task | null) {
    for (let i = 0; i < listeTache.length; i++) {
        if (listeTache[i].id == id) return listeTache[i];
    }
    return null;
}


//TODO: Creer un noeud personalisée avec un handler pour chaque sorties et un handler pour les entreée

export default function CPMGraph() {

    const [tasks, setTasks] = useState<Task[]>(initialTasks)

    //Les arcs representent les taches et le noueds representent les evenements(deb-a, )
    const generateEventsAndArcs = useCallback(function (): { events: EventType[], arcs: ArcType[] } {
        var events: EventType[] = [];
        var arcs: ArcType[] = []

        const tacheDebut = tasks.find(t => (t.id=='start'));
        const eventDebut: EventType = {
            id: "start",
            name: "deb",
            entree: [],
            sortie: tacheDebut.successors.map(s => ('debut-'+s))
        }

        events.push(eventDebut);

        tasks.forEach((task: Task, index: number) => {
            if (task.id != 'start' && task.id != "fin") {
                //Crer l'arc
                var arc:ArcType = {
                    id: task.id,
                    name: task.name,
                    entree: ('debut-'+task.id),
                    sortie: ('fin-'+task.id),
                    task
                }

                arcs.push(arc);
                
                

                //Creer l'evenement debut des taches successeurs si l'event n'existe pas
                var event:EventType = {
                    id: task.successors.map(s => 'debut-'+s+"-fin-"+task.id).join("_"),
                    name: task.successors.map(s => 'debut-'+s+"-fin-"+task.id).join("_"),
                    entree: ["fin-"+task.id],
                    sortie: task.successors.map(s => 'debut-'+s)
                }

                events.push(event)
                
            }
        });

        return { events, arcs };
    }, [tasks])

    useEffect(function () {
        const taskWithPredecessors = calculatePredecessors(tasks);
        const {arcs,events} = generateEventsAndArcs();
        
        console.log("EVENTS: ", events);
        console.log("ARCS: ",arcs);
        
    
    }, [])

    return <div></div>
}