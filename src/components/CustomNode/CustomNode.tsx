import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import React from "react";
import { EventType } from "../CPMGraph/types";
import "./CustomNode.css"
import { useStep } from "../CPMGraph/CPMGraph";

type CustomNodePropsType = { data: { event: EventType, isCritical: boolean }, isConnectable: boolean }

export const CustomNode: React.FC<CustomNodePropsType> = memo(({ data, isConnectable }) => {
  const { event, isCritical } = data;
  const { id, name, erliest, latests } = event;

  const { step, setStep } = useStep()

  const isDeb = event.name == "deb";
  const isFin = event.name == "fin";

  const displayName = (name: string) => {
    if (name.includes("_")) {
      const taskIds = name.split("_").map(e => e.split("-")[1]).join("-");
      return "debut-" + taskIds
    } else return name;
  }

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
        (isDeb || isFin || step < 2) ?
          <div className={`custom-node-content ${(isDeb || isFin) ? " is-deb-or-fin " : ""}`}>{displayName(event.name)}</div>
          :
          <div title={name} className={`custom-node-content ${(step >= 3 && isCritical) ? " is-critical " : ""}`}>
            <div className="flex-1 w-full relative flex">
              <div className={`erliest ${(step >= 3 && isCritical) ? " border-red-600 " : ""}`}> {(step >= 2) && erliest} </div>
              {
                (step >= 4) && <div className="latests-container">
                  {
                    latests.map(({ taskId, latest }, index) => (
                      <div className={`latest-item ${(step >= 3 && isCritical) ? " border-red-600 " : ""}`} key={index}>

                        {latests.length > 1 && <div className="latest-task-badge"> {taskId} </div>}

                        {latest}
                      </div>
                    ))
                  }
                </div>
              }
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