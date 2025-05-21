"use client"

import { useParams } from "next/navigation"
import FlowchartWorkspace from "@/components/FlowchartWorkspace"

export default function NewFlowchartPage() {
  const params = useParams()
  const campaignId = params.campaignId as string

  // Basic validation for campaignId
  if (!campaignId || typeof campaignId !== 'string' || isNaN(Number(campaignId))) {
    console.error("NewFlowchartPage: Invalid or missing campaignId from params.")
    // return <p>Invalid Campaign ID for new flowchart.</p>; // Optional immediate error
  }

  return (
    <div className="flex flex-col h-full w-full p-0 m-0">
      {/* Optional: Add a header here if needed, outside of the flex-grow area */}
      {/* <div className="p-4 border-b"> */}
      {/*   <h1 className="text-xl font-bold">Create New Flowchart for Campaign {campaignId}</h1> */}
      {/* </div> */}
      <div className="flex-grow overflow-hidden">
        {/* Render FlowchartWorkspace, passing only the campaignIdForNew */}
        {/* It will handle setup, loading/error states, and rendering FlowchartEditor */}
        <FlowchartWorkspace campaignIdForNew={campaignId} />
      </div>
    </div>
  )
} 