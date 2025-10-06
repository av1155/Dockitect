"use client";

import { Panel, useReactFlow } from "@xyflow/react";
import { Maximize2, Download, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/lib/store";
import { exportCanvasToPng } from "@/lib/exportCanvas";
import { blueprintToNodes } from "@/lib/blueprintToNodes";

export default function CanvasControls() {
  const { fitView } = useReactFlow();
  const { blueprint, setNodes, setEdges } = useCanvasStore();

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300 });
  };

  const handleExportPng = async () => {
    try {
      await exportCanvasToPng("canvas-wrapper", `dockitect-${Date.now()}.png`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleAutoLayout = () => {
    if (blueprint) {
      const { nodes, edges } = blueprintToNodes(blueprint);
      setNodes(nodes);
      setEdges(edges);
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
    }
  };

  return (
    <Panel position="top-right" className="m-4 max-w-[calc(100vw-2rem)]">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-card border border-border rounded-md shadow-lg p-1.5 sm:p-2">
        <Button
          onClick={handleFitView}
          variant="outline"
          size="sm"
          aria-label="Fit view to canvas"
          title="Fit View"
          className="text-xs sm:text-sm"
        >
          <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Fit View</span>
          <span className="inline sm:hidden">Fit</span>
        </Button>
        
        <Button
          onClick={handleExportPng}
          variant="outline"
          size="sm"
          aria-label="Export canvas as PNG"
          title="Export PNG"
          disabled={!blueprint}
          className="text-xs sm:text-sm"
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Export PNG</span>
          <span className="inline sm:hidden">Export</span>
        </Button>
        
        <Button
          onClick={handleAutoLayout}
          variant="outline"
          size="sm"
          aria-label="Re-apply auto-layout"
          title="Auto-layout"
          disabled={!blueprint}
          className="text-xs sm:text-sm"
        >
          <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Auto-layout</span>
          <span className="inline sm:hidden">Layout</span>
        </Button>
      </div>
    </Panel>
  );
}
