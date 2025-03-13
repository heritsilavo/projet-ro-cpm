import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

// Composant de nœud personnalisé
const TaskNode = ({ data }) => {
  const { label, duration, earliest, latest, slack, isCritical } = data;
  
  return (
    <div className={`node ${isCritical ? 'critical' : ''}`} style={{
      border: '1px solid #999',
      borderRadius: '50%',
      padding: '10px',
      width: '120px',
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isCritical ? '#ffe6e6' : 'white',
      borderColor: isCritical ? 'red' : '#999'
    }}>
      <div style={{ fontWeight: 'bold' }}>{label}</div>
      <div>Durée: {duration}</div>
      {earliest !== undefined && latest !== undefined && (
        <>
          <div>ES: {earliest}</div>
          <div>EF: {earliest + duration}</div>
          <div>LS: {latest}</div>
          <div>LF: {latest + duration}</div>
          <div>Marge: {slack}</div>
        </>
      )}
    </div>
  );
};

// Définition des données initiales
const initialTasks = [
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

const CPMGraph = () => {
  const [tasks, setTasks] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [criticalPath, setCriticalPath] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculer les prédécesseurs pour chaque tâche
  const calculatePredecessors = useCallback((tasksList) => {
    const taskWithPredecessors = JSON.parse(JSON.stringify(tasksList));
    
    taskWithPredecessors.forEach(task => {
      task.predecessors = [];
    });
    
    taskWithPredecessors.forEach(task => {
      if (task.successors) {
        task.successors.forEach(successorId => {
          const successor = taskWithPredecessors.find(t => t.id === successorId);
          if (successor) {
            successor.predecessors.push(task.id);
          }
        });
      }
    });
    
    return taskWithPredecessors;
  }, []);

  // Calcul du chemin critique avec les dates au plus tôt et au plus tard
  const calculateCriticalPath = useCallback((tasksList) => {
    const tasksWithPredecessors = calculatePredecessors(tasksList);
    const result = JSON.parse(JSON.stringify(tasksWithPredecessors));
    
    // Calculer les dates au plus tôt (forward pass)
    result.forEach(task => {
      task.earliest = 0;
    });
    
    // Tri topologique pour le forward pass
    let sorted = [];
    let visited = new Set();
    let temp = new Set();
    
    const visit = (taskId) => {
      if (temp.has(taskId)) return; // Détection de cycle
      if (visited.has(taskId)) return;
      
      temp.add(taskId);
      const task = result.find(t => t.id === taskId);
      
      if (task && task.successors) {
        task.successors.forEach(successorId => visit(successorId));
      }
      
      temp.delete(taskId);
      visited.add(taskId);
      sorted.unshift(taskId);
    };
    
    // Commencer par le début
    visit('start');
    
    // Forward pass (early start/finish)
    sorted.forEach(taskId => {
      const task = result.find(t => t.id === taskId);
      
      if (task.predecessors && task.predecessors.length > 0) {
        task.earliest = Math.max(...task.predecessors.map(predId => {
          const pred = result.find(t => t.id === predId);
          return pred.earliest + pred.duration;
        }));
      } else {
        task.earliest = 0;
      }
    });
    
    // Calculer la durée totale du projet
    const endTask = result.find(t => t.id === 'fin');
    const projectDuration = endTask.earliest;
    
    // Calculer les dates au plus tard (backward pass)
    result.forEach(task => {
      task.latest = projectDuration;
    });
    
    // Backward pass (late start/finish)
    [...sorted].reverse().forEach(taskId => {
      const task = result.find(t => t.id === taskId);
      
      if (task.successors && task.successors.length > 0) {
        task.latest = Math.min(...task.successors.map(succId => {
          const succ = result.find(t => t.id === succId);
          return succ.latest - task.duration;
        }));
      } else {
        task.latest = projectDuration - task.duration;
      }
      
      // Calculer la marge de chaque tâche
      task.slack = task.latest - task.earliest;
    });
    
    // Identifier le chemin critique
    const critical = result.filter(task => task.slack === 0).map(task => task.id);
    
    return { updatedTasks: result, criticalPathIds: critical };
  }, [calculatePredecessors]);

  // Positionnement automatique des noeuds en couches
  const layoutNodes = useCallback((tasksList, criticalPathIds) => {
    // First we create a map of depth levels
    const depthMap = new Map();
    
    // Helper function to calculate node depth
    const calculateDepth = (taskId, visited = new Set(), depth = 0) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);
      
      // Update max depth for this task
      const currentMax = depthMap.get(taskId) || 0;
      depthMap.set(taskId, Math.max(currentMax, depth));
      
      // Process successors
      const task = tasksList.find(t => t.id === taskId);
      if (task && task.successors) {
        task.successors.forEach(succId => {
          calculateDepth(succId, new Set(visited), depth + 1);
        });
      }
    };

    // Calculate depth starting from start node
    calculateDepth('start');
    
    // Group tasks by depth level
    const levelGroups = {};
    depthMap.forEach((depth, taskId) => {
      if (!levelGroups[depth]) levelGroups[depth] = [];
      levelGroups[depth].push(taskId);
    });
    
    // Now create nodes with positions
    const nodesList = [];
    const spacingX = 250;
    const spacingY = 150;

    Object.entries(levelGroups).forEach(([depth, taskIds], depthIndex) => {
      const levelWidth = taskIds.length * spacingY;
      const startY = -(levelWidth / 2);
      
      taskIds.forEach((taskId, i) => {
        const task = tasksList.find(t => t.id === taskId);
        const isCritical = criticalPathIds.includes(taskId);
        
        nodesList.push({
          id: taskId,
          type: 'taskNode',
          position: { x: parseInt(depth) * spacingX, y: startY + i * spacingY },
          data: { 
            label: task.name, 
            duration: task.duration, 
            earliest: task.earliest,
            latest: task.latest,
            slack: task.slack,
            isCritical
          }
        });
      });
    });
    
    return nodesList;
  }, []);
  
  // Générer les arêtes à partir des relations de succession
  const generateEdges = useCallback((tasksList, criticalPathIds) => {
    const edgesList = [];
    
    tasksList.forEach(task => {
      if (task.successors) {
        task.successors.forEach(successorId => {
          const isCritical = criticalPathIds.includes(task.id) && criticalPathIds.includes(successorId);
          
          edgesList.push({
            id: `${task.id}-${successorId}`,
            source: task.id,
            target: successorId,
            label: task.duration.toString(),
            labelStyle: { fill: isCritical ? 'red' : 'black', fontWeight: isCritical ? 'bold' : 'normal' },
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
      // Calculer CPM et le chemin critique
      const { updatedTasks, criticalPathIds } = calculateCriticalPath(initialTasks);
      
      // Mettre à jour les états
      setTasks(updatedTasks);
      setCriticalPath(criticalPathIds);
      
      // Générer les nœuds et les arêtes
      const nodesList = layoutNodes(updatedTasks, criticalPathIds);
      const edgesList = generateEdges(updatedTasks, criticalPathIds);
      
      setNodes(nodesList);
      setEdges(edgesList);
      
      setIsInitialized(true);
    }
  }, [isInitialized, calculateCriticalPath, layoutNodes, generateEdges, setNodes, setEdges]);

  // Composant pour afficher le résumé du projet
  const ProjectSummary = () => {
    const endTask = tasks.find(t => t.id === 'fin');
    const projectDuration = endTask ? endTask.earliest : 0;
    
    return (
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', zIndex: 5 }}>
        <h3>Résumé du projet</h3>
        <p><strong>Durée totale:</strong> {projectDuration}</p>
        <p><strong>Chemin critique:</strong> {criticalPath.join(' → ')}</p>
      </div>
    );
  };

  // Définition des types de nœuds
  const nodeTypes = {
    taskNode: TaskNode
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
        <ProjectSummary />
      </ReactFlow>
    </div>
  );
};

export default CPMGraph;