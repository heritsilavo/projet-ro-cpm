import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

export const CustomNode = memo(({ data, isConnectable }) => {
  const { label, duration, earliest, latest, slack, isCritical, predecessors = [], successors = [] } = data;

  return (
    <div
      style={{
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
        borderColor: isCritical ? 'red' : '#999',
      }}
    >
      {/* Handles pour les connexions entrantes (à gauche) */}
      {predecessors.map((predId, index) => (
        <Handle
          key={`target-${predId}-${index}`}
          id={`target-${predId}-${index}`} // Identifiant unique pour le Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{ top: `${(index + 1) * 20}px` }}
        />
      ))}

      {/* Contenu du nœud */}
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

      {/* Handles pour les connexions sortantes (à droite) */}
      {successors.map((succId, index) => (
  <Handle
    key={`source-${succId}-${index}`}
    id={`source-${succId}-${index}`} // Identifiant cohérent avec generateEdges
    type="source"
    position={Position.Right}
    isConnectable={isConnectable}
    style={{ top: `${(index + 1) * 20}px` }}
  />
))}
    </div>
  );
});