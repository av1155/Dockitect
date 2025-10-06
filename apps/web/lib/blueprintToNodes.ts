import type { Node, Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import type { Blueprint } from "@dockitect/schema";

export function blueprintToNodes(
  blueprint: Blueprint
): { nodes: Node[]; edges: Edge[] } {
  // Hierarchical top-to-bottom layout
  // - Services at the top in a grid
  // - Networks below services, horizontally centered
  // - Edges flow downward from services to networks
  const spacing = 200;
  const serviceCount = blueprint.services.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, serviceCount))));
  const maxServiceRows = Math.ceil(serviceCount / cols);

  // Services at top (y: 0 to maxServiceRows * spacing)
  const serviceNodes: Node[] = blueprint.services.map((service, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      id: `service-${service.id}`,
      type: "serviceNode",
      position: { x: col * spacing, y: row * spacing },
      data: { service },
    } as Node;
  });

  // Networks BELOW services (with spacing gap)
  const networkGap = 150; // Extra space between layers
  const networkY = maxServiceRows * spacing + networkGap;

  // Center networks horizontally based on the overall service grid width
  const totalServiceWidth = cols * spacing;
  const networkCount = blueprint.networks.length;
  // Better centering calculation
  const networkStartX = networkCount > 1
    ? Math.max(0, (totalServiceWidth - (networkCount - 1) * spacing) / 2)
    : totalServiceWidth / 2 - 100;

  const networkNodes: Node[] = blueprint.networks.map((network, index) => ({
    id: `network-${network.id}`,
    type: "networkNode",
    position: {
      x: networkStartX + index * spacing,
      y: networkY,
    },
    data: { network },
  })) as Node[];

  // Styled edges connecting services to their networks
  const edges: Edge[] = blueprint.services.flatMap((service) =>
    (service.networks ?? []).map((netId) => ({
      id: `edge-${service.id}-${netId}`,
      source: `service-${service.id}`,
      target: `network-${netId}`,
      type: "bezier",
      style: { stroke: "var(--success)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--success)" },
      animated: false,
    }))
  );

  return { nodes: [...serviceNodes, ...networkNodes], edges };
}

export default blueprintToNodes;
