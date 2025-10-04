"use client";

import { useState } from "react";
import Canvas from "@/components/Canvas";
import { FileUpload } from "@/components/FileUpload";

export default function Home() {
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleUploadSuccess = (fileName: string, serviceCount: number) => {
    setUploadSuccess(
      `Successfully imported ${serviceCount} service${serviceCount !== 1 ? "s" : ""} from ${fileName}`,
    );
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Dockitect</h1>
          <FileUpload onSuccess={handleUploadSuccess} />
        </div>
          {uploadSuccess && (
            <div
              className="mt-2 flex items-start justify-between gap-3 rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-900 dark:text-green-100"
              role="status"
              aria-live="polite"
              data-testid="upload-success"
            >
              <p className="flex-1">{uploadSuccess}</p>
              <button
                type="button"
                onClick={() => setUploadSuccess(null)}
                className="inline-flex shrink-0 items-center rounded-md p-1 text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:text-green-100 dark:hover:bg-green-800 dark:focus:ring-green-400 dark:focus:ring-offset-slate-900"
                aria-label="Close success message"
                data-testid="upload-success-close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          )}

      </div>
      <div className="flex-1">
        <Canvas />
      </div>
    </div>
  );
}
