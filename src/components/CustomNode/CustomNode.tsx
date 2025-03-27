import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import React from "react";
import { EventType } from "../CPMGraph/types";
import "./CustomNode.css"

type CustomNodePropsType = { data: { event: EventType, isCritical: boolean }, isConnectable: boolean }

export const CustomNode: React.FC<CustomNodePropsType> = memo(({ data, isConnectable }) => {
  const { event, isCritical } = data;
  const {id, name, erliest, latests} = event;

  const isDeb = event.name == "deb";
  const isFin = event.name == "fin"

  return (
    <div>

      <Handle
        key={`target-${event.id}`}
        id={`target-${event.id}`}
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />

      {
        (isDeb || isFin) ?
          <div className="custom-node-content is-deb-or-fin">{event.name}</div>
          :
          <div title={name} className={`custom-node-content ${isCritical?" is-critical ":""}`}>
            {/* <p className="w-full text-center font-bold text-gray-600"> {name} </p> */}
            <div className="flex-1 w-full relative flex">
                <div className={`erliest ${isCritical? " border-red-600 ": ""}`}> {erliest} </div>
                <div className="latests-container">
                  {
                    latests.map(({taskId, latest}, index) => (
                      <div className={`latest-item ${isCritical? " border-red-600 ": ""}`} key={index}>
                          
                          { latests.length > 1 && <div className="latest-task-badge"> {taskId} </div> }

                          {latest}
                      </div>
                    ))
                  }
                </div>
            </div>
          </div>
      }

      <Handle
        key={`source-${event.id}`}
        id={`source-${event.id}`}
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
});