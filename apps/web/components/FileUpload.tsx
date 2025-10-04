"use client";

import { useRef, useState } from "react";
import { importDockerCompose } from "@dockitect/importer";
import { useCanvasStore } from "@/lib/store";

type FileUploadProps = {
  onSuccess?: (fileName: string, serviceCount: number) => void;
};

export function FileUpload({ onSuccess }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setBlueprint = useCanvasStore((state) => state.setBlueprint);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type by extension (.yml/.yaml only)
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || (ext !== "yml" && ext !== "yaml")) {
      setError("Unsupported file type. Please upload a .yml or .yaml file.");
      // Reset to allow re-uploading the same file
      inputEl.value = "";
      return;
    }

    // Validate file size (max 2MB)
    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File is too large (${sizeMB} MB). Maximum size is 2 MB.`);
      inputEl.value = "";
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const blueprint = importDockerCompose(text);
      setBlueprint(blueprint);

      onSuccess?.(file.name, blueprint.services.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse file";
      setError(`Could not import the Compose file. ${message}`);
    } finally {
      setLoading(false);
      // Reset to allow re-uploading the same file
      inputEl.value = "";
    }
  };

  const handleButtonClick = () => {
    if (loading) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading}
          aria-busy={loading || undefined}
          aria-disabled={loading || undefined}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Parsing..." : "Upload Compose file"}
        </button>
        <input
          type="file"
          accept=".yml,.yaml"
          onChange={handleFileChange}
          disabled={loading}
          ref={inputRef}
          aria-label="Upload Compose file"
          className="sr-only"
        />
      </div>

      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-900 dark:text-red-100"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-testid="upload-error"
        >
          <p className="font-medium">Upload failed</p>
          <p className="mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
