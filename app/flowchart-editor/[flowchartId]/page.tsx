'use client';

import { useParams } from "next/navigation";
import FlowchartWorkspace from "@/components/FlowchartWorkspace"; // Corrected import path

export default function EditFlowchartPage() {
  const params = useParams();
  const flowchartId = params.flowchartId as string;

  // Basic validation for flowchartId, though FlowchartWorkspace will also handle errors.
  if (!flowchartId || typeof flowchartId !== 'string') {
    // Optionally, redirect or show a more immediate error before FlowchartWorkspace mounts
    // For now, letting FlowchartWorkspace handle its loading/error states.
    // You could return a simple loading/error message here too if preferred.
    console.error("EditFlowchartPage: Invalid or missing flowchartId from params.");
    // return <p>Invalid Flowchart ID.</p>; 
  }

  return (
    <div className="flex flex-col h-full w-full p-0 m-0">
      <div className="flex-grow overflow-hidden">
        {/* Render FlowchartWorkspace, passing only the flowchartId */}
        {/* It will handle fetching data, loading/error states, and rendering FlowchartEditor */}
        <FlowchartWorkspace flowchartId={flowchartId} />
      </div>
    </div>
  );
} 