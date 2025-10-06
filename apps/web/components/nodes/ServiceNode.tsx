"use client";

import { memo } from "react";
import type { KeyboardEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "@/lib/store";
import type { Service } from "@dockitect/schema";

type ServiceNodeData = {
  service: Service;
};

function ServiceNode({ data, id }: NodeProps) {
  const { service } = data as ServiceNodeData;
  const { setSelectedNode, nodes } = useCanvasStore();

  const handleClick = () => {
    const currentNode = nodes.find((n) => n.id === id);
    if (currentNode) {
      setSelectedNode(currentNode);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Service card for ${service.name}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="px-2 py-2 rounded-lg shadow-md bg-card border-2 border-primary cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Handle type="target" position={Position.Top} aria-label="Connect to service" />
      <div className="flex flex-col gap-2">
        <div className="text-foreground font-semibold text-sm">
          {service.name}
        </div>
        <div className="text-muted-foreground text-xs">
          {service.image}
        </div>
        <div className="text-muted-foreground text-xs" aria-label="Exposed ports count">
          Ports: {service.ports?.length ?? 0}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} aria-label="Connect from service" />
    </div>
  );
}

export default memo(ServiceNode);
