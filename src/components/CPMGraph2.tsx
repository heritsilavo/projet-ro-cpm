import React, { useCallback, useEffect, useState } from 'react';
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
import { CustomNode } from './CustomNode/CustomNode'; // Composant de nœud personnalisé
import { ProjectSummary } from './ProjectSummary/ProjectSummary'; // Composant de résumé du projet

// Définition des types pour les tâches
interface Task {
  id: string;
  name: string;
  duration: number;
  successors: string[];
  predecessors?: string[];
  earliest?: number;
  latest?: number;
  slack?: number;
}

// Définition des données initiales
const initialTasks: Task[] = [
  { id: 'start', name: 'Déb', duration: 0, successors: ['a'] },
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

const CPMGraph: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [criticalPath, setCriticalPath] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Calculer les prédécesseurs pour chaque tâche
  const calculatePredecessors = useCallback((tasksList: Task[]): Task[] => {
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
  }, []);

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
  }, [calculatePredecessors]);

  // Positionnement automatique des nœuds en couches
  const layoutNodes = useCallback((tasksList: Task[], criticalPathIds: string[]) => {
    const depthMap = new Map<string, number>();
  
    const calculateDepth = (taskId: string, visited = new Set<string>(), depth = 0) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);
  
      const currentMax = depthMap.get(taskId) || 0;
      depthMap.set(taskId, Math.max(currentMax, depth));
  
      const task = tasksList.find((t) => t.id === taskId);
      if (task && task.successors) {
        task.successors.forEach((succId) => {
          calculateDepth(succId, new Set(visited), depth + 1);
        });
      }
    };
  
    calculateDepth('start');
  
    const levelGroups: { [key: number]: string[] } = {};
    depthMap.forEach((depth, taskId) => {
      if (!levelGroups[depth]) levelGroups[depth] = [];
      levelGroups[depth].push(taskId);
    });
  
    const nodesList: Node[] = [];
    const spacingX = 300;
    const spacingY = 250;
  
    Object.entries(levelGroups).forEach(([depth, taskIds], depthIndex) => {
      const levelWidth = taskIds.length * spacingY;
      const startY = -(levelWidth / 2);
  
      taskIds.forEach((taskId, i) => {
        const task = tasksList.find((t) => t.id === taskId);
        const isCritical = criticalPathIds.includes(taskId);
  
        nodesList.push({
          id: taskId,
          type: 'taskNode',
          position: { x: parseInt(depth) * spacingX, y: startY + i * spacingY },
          data: {
            label: task!.name,
            duration: task!.duration,
            earliest: task!.earliest,
            latest: task!.latest,
            slack: task!.slack,
            isCritical,
            predecessors: task!.predecessors || [], // Passer les prédécesseurs
            successors: task!.successors || [],   // Passer les successeurs
          },
        });
      });
    });
  
    return nodesList;
  }, []);

  // Générer les arêtes à partir des relations de succession
  const generateEdges = useCallback((tasksList: Task[], criticalPathIds: string[]) => {
    const edgesList: Edge[] = [];
  
    tasksList.forEach((task) => {
      // Générer les arêtes pour les successeurs (connexions sortantes)
      if (task.successors) {
        task.successors.forEach((successorId, index) => {
          const isCritical = criticalPathIds.includes(task.id) && criticalPathIds.includes(successorId);
  
          // Identifiants des Handles pour les successeurs
          const sourceHandle = `source-${successorId}-${index}`; // Handle de sortie du nœud source
          const targetHandle = `target-${task.id}-${index}`;    // Handle d'entrée du nœud cible
  
          edgesList.push({
            id: `${task.id}-${successorId}-${index}`,
            source: task.id,
            target: successorId,
            sourceHandle, // Spécifier le Handle de sortie
            targetHandle, // Spécifier le Handle d'entrée
            label: task.duration.toString(),
            labelStyle: { fill: isCritical ? 'red' : 'black', fontWeight: isCritical ? 'bold' : 'normal' },
            data: { id: `${task.id}-${successorId}`, duration: task.duration, isCritical },
            style: { stroke: isCritical ? 'red' : '#999', strokeWidth: isCritical ? 2 : 1 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isCritical ? 'red' : '#999',
            },
          });
        });
      }
  
      // Générer les arêtes pour les prédécesseurs (connexions entrantes)
      if (task.predecessors) {
        task.predecessors.forEach((predecessorId, index) => {
          const isCritical = criticalPathIds.includes(predecessorId) && criticalPathIds.includes(task.id);
  
          // Identifiants des Handles pour les prédécesseurs
          const sourceHandle = `source-${task.id}-${index}`; // Handle de sortie du nœud source (prédécesseur)
          const targetHandle = `target-${predecessorId}-${index}`; // Handle d'entrée du nœud cible (tâche actuelle)
  
          edgesList.push({
            id: `${predecessorId}-${task.id}-${index}`,
            source: predecessorId,
            target: task.id,
            sourceHandle, // Spécifier le Handle de sortie
            targetHandle, // Spécifier le Handle d'entrée
            label: tasksList.find((t) => t.id === predecessorId)?.duration.toString(), // Durée du prédécesseur
            labelStyle: { fill: isCritical ? 'red' : 'black', fontWeight: isCritical ? 'bold' : 'normal' },
            data: { id: `${predecessorId}-${task.id}`, duration: tasksList.find((t) => t.id === predecessorId)?.duration, isCritical },
            style: { stroke: isCritical ? 'red' : '#999', strokeWidth: isCritical ? 2 : 1 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isCritical ? 'red' : '#999',
            },
          });
        });
      }
    });
  
    return edgesList;
  }, []);

  // Initialiser le composant une seule fois
  useEffect(() => {
    if (!isInitialized) {
      const { updatedTasks, criticalPathIds } = calculateCriticalPath(initialTasks);
      console.log("UPDATED TASKS", updatedTasks);
      
      setTasks(updatedTasks);
      setCriticalPath(criticalPathIds);
      const nodesList = layoutNodes(updatedTasks, criticalPathIds);
      const edgesList = generateEdges(updatedTasks, criticalPathIds);
      setNodes(nodesList);
      setEdges(edgesList);
      setIsInitialized(true);
    }
  }, [isInitialized, calculateCriticalPath, layoutNodes, generateEdges, setNodes, setEdges]);

  // Définition des types de nœuds
  const nodeTypes = {
    taskNode: CustomNode,
  };

  return (
    <div style={{ width: '100%', height: '800px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <ProjectSummary tasks={tasks} criticalPath={criticalPath} />
      </ReactFlow>
    </div>
  );
};

export default CPMGraph;