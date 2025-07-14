"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { Task } from "./types";
import { calculateCriticalPath, generateEventsAndArcs, layoutNodes, generateEdges, getStepsDescriptions } from "../../utils/utils";
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
import { CustomNode } from "../CustomNode/CustomNode";
import "./CpmGraph.css";
import CustomEdge from "../CustomEdge/CustomEdge";

const StepContext = createContext<{ step: number, setStep: React.Dispatch<React.SetStateAction<number>> }>({ step: 1, setStep: () => { } });
const MIN_STEP = 1;
const MAX_STEP = 5;

const selectedEdgeContext = createContext<{ selectedEdge: string, setSelectedEdge: React.Dispatch<React.SetStateAction<string>> }>({ selectedEdge: "", setSelectedEdge: () => { } });

export default function CPMGraph({ initialTasks }: { initialTasks: Task[] }) {

    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [criticalPath, setCriticalPath] = useState<string[]>([]);
    const [selectedEdge, setSelectedEdge] = useState<string>("");

    const [step, setStep] = useState(1);

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

    return <>
        <div className="w-full h-[800px] border-2">
            <StepContext.Provider value={{ step, setStep }}>
                <selectedEdgeContext.Provider value={{ selectedEdge, setSelectedEdge }}>
                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            edgeTypes={{ custom: CustomEdge }}
                            nodeTypes={{ custom: CustomNode }}
                            fitView
                        >
                            <Background />
                            <Controls />
                            <MiniMap />
                            <ProjectSummary criticalPath={criticalPath} tasks={tasks}></ProjectSummary>
                        </ReactFlow>
                    </ReactFlowProvider>
                </selectedEdgeContext.Provider>
            </StepContext.Provider>
        </div>
        <div className="btns-container">
            <button onClick={() => (step > MIN_STEP) && setStep(old => old - 1)} className={`btn ${(MIN_STEP == step) ? 'btn-disable' : ''}`} disabled={(MIN_STEP >= step)} >Precedent</button>
            <div>{getStepsDescriptions(step)}</div>
            <button onClick={() => (step < MAX_STEP) && setStep(old => old + 1)} className={`btn ${(MAX_STEP <= step) ? 'btn-disable' : ''}`} disabled={(MAX_STEP <= step)} >Suivant</button>
        </div>
    </>
}

export const useStep = () => {
    const { step, setStep } = useContext(StepContext);
    return { step, setStep };
}

export const useSelectedEdge = () => {
    const { selectedEdge, setSelectedEdge } = useContext(selectedEdgeContext);
    return { selectedEdge, setSelectedEdge };
}