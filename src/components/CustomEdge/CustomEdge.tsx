import { BaseEdge, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import './CustomEdge.css';
import React from 'react';

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
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: data.isCritical ? '#ff0072' : '#b1b1b7',
          strokeWidth: selected ? 3 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className={"edge-label-container "}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <div className={"edge-label-content"+(data.isCritical ? ' critical-edge ' : '')}>
            <div className="edge-name">{data.name}</div>
            <div className="edge-duration">{data.duration}j</div>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}