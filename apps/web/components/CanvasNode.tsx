import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type CanvasNodeData = {
  label: string;
};

function CanvasNode({ data }: NodeProps) {
  const nodeData = data as CanvasNodeData;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle type="target" position={Position.Top} />
      <div className="font-medium text-sm">{nodeData.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(CanvasNode);
