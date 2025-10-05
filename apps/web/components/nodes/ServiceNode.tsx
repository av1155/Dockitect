"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Service } from "@dockitect/schema";

type ServiceNodeData = {
  service: Service;
};

function ServiceNode({ data }: NodeProps) {
  const { service } = data as ServiceNodeData;

  return (
    <div
      role="group"
      aria-label={`Service card for ${service.name}`}
      className="px-2 py-2 rounded-lg shadow-md bg-card border-2 border-blue-600 dark:border-blue-500"
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
