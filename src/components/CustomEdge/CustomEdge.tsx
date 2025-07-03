import { getBezierPath, EdgeLabelRenderer, EdgeProps, Position } from '@xyflow/react';
import './CustomEdge.css';
import React from 'react';
import { useStep } from '../CPMGraph/CPMGraph';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: any;
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
} : CustomEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { step } = useStep();
  const isCritical = (step >= 3) && data.isCritical;

  const customMarkerEnd = `${id}-critical-arrow`

  return (
    <>
      <defs>
        <marker
          id={`${id}-critical-arrow`}
          markerWidth="12.5"
          markerHeight="12.5"
          viewBox="0 0 20 20"
          orient="auto-start-reverse"
          refX="10"
          refY="5"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={`${isCritical ? "#ff0072" : "#b1b1b7"}`} 
          />
        </marker>
      </defs>

      <path
        id={id}
        className={`react-flow__edge-path ${isCritical ? 'animated' : ''}`}
        d={edgePath}
        markerEnd={`url(#${customMarkerEnd})`}
        style={{
          stroke: isCritical ? '#ff0072' : '#b1b1b7',
          strokeWidth: selected ? 5 : 4,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="edge-label-container"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <div className={`edge-label-content ${isCritical ? 'critical-edge' : ''}`}>
            <div className="edge-name">{data.name}</div>
            <div className="edge-duration">{data.duration}</div>
          </div>

          {
            (step >= 5) && (!!data.name) && <div className='slack-renderer'>
              { data.slack }
            </div>
          }
        </div>
      </EdgeLabelRenderer>
    </>
  );
}