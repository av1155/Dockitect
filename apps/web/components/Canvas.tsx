"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type OnConnect,
  type ReactFlowInstance,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";

import { useCanvasStore } from "@/lib/store";
// Note: Conversion from blueprint → nodes happens in store.setBlueprint.
// Canvas consumes nodes/edges from the store as the single source of truth.
import ServiceNode from "@/components/nodes/ServiceNode";
import NetworkNode from "@/components/nodes/NetworkNode";
import NodeDetailsPanel from "@/components/NodeDetailsPanel";
import CanvasControls from "@/components/CanvasControls";

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
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

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

  // Auto-fit view when nodes change (e.g., after file upload)
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      // Small delay to ensure nodes are rendered
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
      }, 50);
    }
  }, [nodes, reactFlowInstance]);

  // Fit view on window resize (debounced)
  useEffect(() => {
    if (!reactFlowInstance) return;

    let resizeTimer: number | undefined;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        // Ensure instance still exists
        try {
          reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
        } catch {}
      }, 200);
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [reactFlowInstance]);
 
  return (
     <div id="canvas-wrapper" className="w-full h-full min-h-0" aria-label="Blueprint canvas">
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
        elevateEdgesOnSelect
        attributionPosition="top-left"
        onInit={setReactFlowInstance}
      >
        <Background />
        <Controls showFitView={false} position="bottom-left" className="rounded-md" />
         <MiniMap
           position="bottom-right"
           pannable
           zoomable
           ariaLabel="Blueprint overview"
           className="rounded-md"
           style={{ width: 160, height: 110, zIndex: 10 }}
           bgColor="hsl(var(--card))"
           maskColor="rgba(0,0,0,0.4)"
           nodeColor={() => "hsl(var(--muted-foreground))"}
           nodeStrokeColor="transparent"
         />
         <CanvasControls />
       </ReactFlow>
      <NodeDetailsPanel />
    </div>
  );
}
