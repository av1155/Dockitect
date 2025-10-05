"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type OnConnect,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";

import { useCanvasStore } from "@/lib/store";
// Note: Conversion from blueprint → nodes happens in store.setBlueprint.
// Canvas consumes nodes/edges from the store as the single source of truth.
import ServiceNode from "@/components/nodes/ServiceNode";
import NetworkNode from "@/components/nodes/NetworkNode";

const nodeTypes = {
  serviceNode: ServiceNode,
  networkNode: NetworkNode,
};

export default function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useCanvasStore();

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges(addEdge(connection, edges));
    },
    [edges, setEdges]
  );

  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const updateColorMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setColorMode(isDark ? "dark" : "light");
    };
    updateColorMode();

    const observer = new MutationObserver(() => updateColorMode());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return (
     <div className="w-full h-full min-h-0" aria-label="Blueprint canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        colorMode={colorMode}
      >
        <Background />
        <Controls className="rounded-md" />
        <MiniMap
          bgColor="var(--card)"
          maskColor="rgba(0,0,0,0.4)"
          nodeColor={() => "var(--muted-foreground)"}
          nodeStrokeColor="transparent"
        />
      </ReactFlow>
    </div>
  );
}
