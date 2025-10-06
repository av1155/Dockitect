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
import blueprintToNodes from "@/lib/blueprintToNodes";

export type CanvasState = {
  nodes: Node[];
  edges: Edge[];
  blueprint: Blueprint | null;
  selectedNode: Node | null;
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setBlueprint: (blueprint: Blueprint) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  setSelectedNode: (node: Node | null) => void;
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  blueprint: null,
  selectedNode: null,

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

  setBlueprint: (blueprint) => {
    const { nodes, edges } = blueprintToNodes(blueprint);
    set({ blueprint, nodes, edges });
  },

  addNode: (node) =>
    set({
      nodes: [...get().nodes, node],
    }),

  addEdge: (edge) =>
    set({
      edges: [...get().edges, edge],
    }),

  setSelectedNode: (node) => set({ selectedNode: node }),
}));
