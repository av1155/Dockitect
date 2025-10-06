import { toPng } from "html-to-image";

// Updated export to target the React Flow viewport and exclude UI chrome
export async function exportCanvasToPng(
  _deprecatedElementId: string, // kept for backward compatibility, ignored
  filename: string = "dockitect-canvas.png"
): Promise<void> {
  // Target the React Flow viewport (contains nodes and edges)
  const element = document.querySelector('.react-flow__viewport');
  if (!element) {
    console.error('Canvas viewport not found');
    return;
  }

  try {
    // Get the parent .react-flow container for proper bounds
    const container = element.closest('.react-flow') as HTMLElement;
    const bounds = container?.getBoundingClientRect();

    const dataUrl = await toPng(container || element, {
      cacheBust: true,
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--background').trim(),
      width: bounds?.width,
      height: bounds?.height,
      filter: (node) => {
        const classList = (node as Element).classList;
        if (!classList) return true;
        return !classList.contains('react-flow__controls') &&
               !classList.contains('react-flow__panel') &&
               !classList.contains('react-flow__minimap');
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export canvas:', error);
  }
}
