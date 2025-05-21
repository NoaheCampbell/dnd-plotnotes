"use client";

import FlowchartEditor from "@/components/flowchart-editor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface FlowchartWorkspaceProps {
  flowchartId?: string;      // Provided when editing an existing flowchart
  campaignIdForNew?: string; // Provided when creating a new flowchart
}

export default function FlowchartWorkspace({ flowchartId, campaignIdForNew }: FlowchartWorkspaceProps) {
  const router = useRouter();

  const [effectiveCampaignId, setEffectiveCampaignId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFlowchartId, setCurrentFlowchartId] = useState<string | undefined>(flowchartId);

  useEffect(() => {
    if (flowchartId) {
      // EDIT MODE: Fetch flowchart data to get its campaignId
      setIsLoading(true);
      fetch(`/api/flowcharts/${flowchartId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch flowchart data');
          }
          return res.json();
        })
        .then(data => {
          if (data && data.campaignId) {
            setEffectiveCampaignId(data.campaignId);
            setCurrentFlowchartId(data.id); // Ensure currentFlowchartId is set from loaded data
          } else {
            console.warn("Flowchart data loaded, but campaignId is missing.", data);
            toast("Could not determine the campaign for this flowchart. Some features might be limited.");
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching flowchart details:", err);
          setError(err.message || 'Could not load flowchart details.');
          toast.error(err.message || 'Could not load flowchart details.');
          setIsLoading(false);
        });
    } else if (campaignIdForNew) {
      // CREATE MODE: Use the provided campaignIdForNew
      const campIdNum = Number(campaignIdForNew);
      if (!isNaN(campIdNum)) {
        setEffectiveCampaignId(campIdNum);
      } else {
        console.error("Invalid campaignIdForNew provided:", campaignIdForNew);
        toast.error("Invalid campaign ID for new flowchart.");
        setError("Invalid campaign ID for new flowchart.");
      }
      setIsLoading(false); // Done "loading" as we have the campaignId or an error
    } else {
      // Invalid state: neither flowchartId nor campaignIdForNew provided
      console.error("FlowchartWorkspace requires either flowchartId or campaignIdForNew.");
      toast.error("Cannot load flowchart editor: Missing context.");
      setError("Cannot load flowchart editor: Missing context.");
      setIsLoading(false);
    }
  }, [flowchartId, campaignIdForNew]);

  const handleSaveSuccess = (savedFlowchart: any) => {
    const name = savedFlowchart.name || "Flowchart";
    const message = flowchartId 
      ? `Flowchart '${name}' updated successfully!`
      : `Flowchart '${name}' created successfully!`;
    toast.success(message);

    const redirectCampaignId = savedFlowchart.campaignId || effectiveCampaignId;
    if (redirectCampaignId) {
      router.push(`/campaigns/${redirectCampaignId}`);
    } else {
      // Fallback if campaignId still can't be determined (should be rare)
      toast("Save successful, but couldn't determine campaign to redirect to. Navigating to homepage.");
      router.push('/');
    }
  };

  const handleFlowchartLoaded = (loadedFlowchartData: any) => {
    // This could be used to update effectiveCampaignId if the editor itself loads/
    // changes campaign association, though current setup relies on initial props/fetch.
    if (loadedFlowchartData && loadedFlowchartData.campaignId && loadedFlowchartData.campaignId !== effectiveCampaignId) {
      console.warn("FlowchartEditor reported a campaignId different from FlowchartWorkspace's effectiveCampaignId.",{
        editorCampaignId: loadedFlowchartData.campaignId,
        workspaceCampaignId: effectiveCampaignId
      });
      // Potentially update: setEffectiveCampaignId(loadedFlowchartData.campaignId);
    }
    // If a new flowchart was saved, FlowchartEditor might pass back the new ID here too.
    if (!flowchartId && loadedFlowchartData && loadedFlowchartData.id) {
        setCurrentFlowchartId(loadedFlowchartData.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading flowchart editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }
  
  // Ensure we have a campaign context to proceed with rendering the editor
  if (effectiveCampaignId === null && !currentFlowchartId) {
    // This case should ideally be caught by the error state earlier if campaignIdForNew was invalid
    // or if flowchartId was provided but fetching failed to get a campaignId.
    return (
        <div className="flex flex-col justify-center items-center h-full">
            <p className="text-red-500">Error: Cannot determine campaign context for the flowchart.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
        </div>
    );
  }

  return (
    // The outer div structure (h-full, w-full, etc.) will be handled by the page component
    <FlowchartEditor 
      flowchartId={currentFlowchartId} // Use currentFlowchartId, which might be from prop or loaded data
      campaignId={effectiveCampaignId === null ? undefined : effectiveCampaignId}
      onSaveSuccess={handleSaveSuccess} 
      onFlowchartLoaded={handleFlowchartLoaded}
      // initialName could be passed down if needed, e.g., for new flowcharts 
      // initialName={flowchartId ? undefined : "New Flowchart"}
    />
  );
} 