import type { Node, Edge } from "@xyflow/react";
import type { Blueprint } from "@dockitect/schema";

export function blueprintToNodes(
  blueprint: Blueprint
): { nodes: Node[]; edges: Edge[] } {
  const spacing = 200;
  const serviceCount = blueprint.services.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, serviceCount))));
  const rows = Math.max(1, Math.ceil(serviceCount / cols));

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

  const networkY = Math.max(rows * spacing + 150, 300); // place networks below services (>= 300px total)
  const networkNodes: Node[] = blueprint.networks.map((network, index) => ({
    id: `network-${network.id}`,
    type: "networkNode",
    position: { x: index * spacing, y: networkY },
    data: { network },
  })) as Node[];

  const edges: Edge[] = blueprint.services.flatMap((service) =>
    (service.networks ?? []).map((netId) => ({
      id: `edge-${service.id}-${netId}`,
      source: `service-${service.id}`,
      target: `network-${netId}`,
    }))
  );

  return { nodes: [...serviceNodes, ...networkNodes], edges };
}

export default blueprintToNodes;
