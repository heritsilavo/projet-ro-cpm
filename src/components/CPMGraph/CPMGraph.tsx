"use client"
import React, {  useEffect, useState } from "react";
import {  Task } from "./types";
import { calculateCriticalPath, generateEventsAndArcs, layoutNodes, generateEdges } from "./utils";
import {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    ReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProjectSummary } from "../ProjectSummary/ProjectSummary";
import CustomEdge from "../CustomEdge/CustomEdge";
import { CustomNode } from "../CustomNode/CustomNode";

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

export default function CPMGraph() {

    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [criticalPath, setCriticalPath] = useState<string[]>([]);
    
    useEffect(function () {
        const { updatedTasks, criticalPathIds } = calculateCriticalPath(initialTasks);

        setTasks(updatedTasks);
        setCriticalPath(criticalPathIds);
        var { arcs, events } = generateEventsAndArcs(updatedTasks);

        const generatedNodes = layoutNodes(tasks, events, criticalPathIds);
        setNodes(generatedNodes);

        const generatedEdges = generateEdges(arcs, criticalPathIds);
        setEdges(generatedEdges)

        console.log("UPDATED TASKS", updatedTasks);
        console.log("EVENTS: ", events);
        console.log("ARCS: ", arcs);

    }, [])

    return <div style={{ width: '100%', height: '800px' }}>
        <ReactFlowProvider>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                edgeTypes={{ custom: CustomEdge }}
                nodeTypes={{ custom: CustomNode}}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
                <ProjectSummary criticalPath={criticalPath} tasks={tasks}></ProjectSummary>
            </ReactFlow>
        </ReactFlowProvider>
    </div>
}