import { create } from "zustand";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import type { Blueprint } from "@dockitect/schema";

export type CanvasState = {
  nodes: Node[];
  edges: Edge[];
  blueprint: Blueprint | null;
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setBlueprint: (blueprint: Blueprint) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  blueprint: null,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  setBlueprint: (blueprint) => set({ blueprint }),

  addNode: (node) =>
    set({
      nodes: [...get().nodes, node],
    }),

  addEdge: (edge) =>
    set({
      edges: [...get().edges, edge],
    }),
}));
