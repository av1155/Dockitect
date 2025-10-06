"use client";

import { memo } from "react";
import type { KeyboardEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "@/lib/store";
import type { Net } from "@dockitect/schema";

type NetworkNodeData = {
  network: Net;
};

function NetworkNode({ data, id }: NodeProps) {
  const { network } = data as NetworkNodeData;
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
      aria-label={`Network card for ${network.name}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="px-2 py-2 rounded-lg shadow-md bg-card border-2 border-[hsl(var(--success))] cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
