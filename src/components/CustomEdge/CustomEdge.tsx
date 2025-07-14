import { getBezierPath, EdgeLabelRenderer, EdgeProps, Position } from '@xyflow/react';
import './CustomEdge.css';
import React from 'react';
import { useSelectedEdge, useStep } from '../CPMGraph/CPMGraph';
import { ArcType } from '../CPMGraph/types';
import { log } from 'console';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: {
    name: string;
    duration: number;
    isCritical: boolean;
    slack: number;
    confondus: ArcType[];
  };
  selected?: boolean;
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: CustomEdgeProps) {
  const { step } = useStep();
  const isCritical = (step >= 3) && data?.isCritical;
  const confondus = data?.confondus || [];
  
  // Calcul de la position relative dans le groupe d'edges confondus
  const edgeIndex = confondus.findIndex(edge => edge.id === id);
  const totalConfondus = confondus.length;

  const {selectedEdge} = useSelectedEdge();


  // Calcul du chemin avec courbure personnalisée
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const markerColor = isCritical ? "#ff0072" : "#b1b1b7";

  return (
    <>
      <defs>
        <marker
          id={`${id}-arrow`}
          markerWidth="12.5"
          markerHeight="12.5"
          viewBox="0 0 20 20"
          orient="auto-start-reverse"
          refX="10"
          refY="5"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={markerColor} />
        </marker>
      </defs>

      <path
        id={id}
        className={`react-flow__edge-path ${isCritical ? 'animated' : ''}`}
        d={edgePath}
        markerEnd={`url(#${id}-arrow)`}
        style={{
          stroke: markerColor,
          strokeWidth: (selectedEdge == id) ? 5 : 4,
          zIndex: (selectedEdge == id) ? 10 : 0, // Augmente le z-index si sélectionné
        }}
      />

      <EdgeLabelRenderer>
        <div
          className="edge-label-container"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: (selectedEdge == id) ? 11 : 1, // Z-index légèrement plus élevé que le path
          }}
        >
          <div className={`edge-label-content ${isCritical ? 'critical-edge' : ''}`}>
            <div className="edge-name">{data?.name}</div>
            <div className="edge-duration">{data?.duration}</div>
          </div>

          {(step >= 5) && (!!data?.name) && (
            <div className='slack-renderer'>
              {data?.slack}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}