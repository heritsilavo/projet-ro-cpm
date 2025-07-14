import { getBezierPath, EdgeLabelRenderer, EdgeProps, Position } from '@xyflow/react';
import './CustomEdge.css';
import React from 'react';
import { useSelectedEdge, useStep } from '../CPMGraph/CPMGraph';
import { ArcType } from '../CPMGraph/types';

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
    edgeIndex: number;
    totalConfondus: number;
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
  const edgeIndex = data?.edgeIndex || 0;
  const totalConfondus = data?.totalConfondus || 1;

  // Calcul dynamique de l'offset en fonction du nombre d'edges confondus
  const baseOffset = 40; // Augmentation de la valeur de base
  const spacingFactor = 1.5; // Facteur d'espacement supplémentaire
  const offset = baseOffset * spacingFactor * Math.max(1, totalConfondus / 2);
  
  const middleIndex = (totalConfondus - 1) / 2;
  const curvature = (edgeIndex - middleIndex) * offset;

  // Ajustement de la courbure pour les edges extrêmes
  const curvatureFactor = 0.25 + (Math.abs(edgeIndex - middleIndex) / totalConfondus) * 0.1;

  // Calcul du chemin avec courbure personnalisée
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY: sourceY + curvature,
    sourcePosition,
    targetX,
    targetY: targetY + curvature,
    targetPosition,
    curvature: curvatureFactor
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
          strokeWidth: selected ? 5 : 4,
          zIndex: selected ? 10 : edgeIndex,
        }}
      />

      <EdgeLabelRenderer>
        <div
          className="edge-label-container"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + curvature}px)`,
            pointerEvents: 'all',
            zIndex: selected ? 11 : edgeIndex + 1,
            // Ajout d'un padding pour éviter les chevauchements de labels
            padding: `${Math.min(10, offset / 4)}px`,
            margin: `${Math.min(5, offset / 8)}px 0`
          }}
        >
          <div title={data?.name || ""} className={`edge-label-content ${isCritical ? 'critical-edge' : ''}`}>
            <div className="edge-name">{id.length == 1 ? id : ""}</div>
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