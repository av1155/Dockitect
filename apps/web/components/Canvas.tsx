"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type OnConnect,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCanvasStore } from "@/lib/store";
import CanvasNode from "./CanvasNode";

const nodeTypes = {
  canvasNode: CanvasNode,
};

export default function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } =
    useCanvasStore();

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges(addEdge(connection, edges));
    },
    [edges, setEdges]
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
