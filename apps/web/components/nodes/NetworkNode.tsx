"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Net } from "@dockitect/schema";

type NetworkNodeData = {
  network: Net;
};

function NetworkNode({ data }: NodeProps) {
  const { network } = data as NetworkNodeData;

  return (
    <div
      role="group"
      aria-label={`Network card for ${network.name}`}
      className="px-2 py-2 rounded-lg shadow-md bg-card border-2 border-[color:var(--success)]"
    >
      <Handle type="target" position={Position.Top} aria-label="Connect to network" />
      <div className="flex flex-col gap-2">
        <div className="text-foreground font-semibold text-sm">
          {network.name}
        </div>
        <div className="text-muted-foreground text-xs">
          {network.driver ?? "bridge"}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} aria-label="Connect from network" />
    </div>
  );
}

export default memo(NetworkNode);
