"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GenericEntityGrid from "@/components/generic-entity-grid";
import { useState, useEffect } from "react";
import { entitiesConfig } from "@/lib/entities-config";
import GenericEntityForm from "@/components/generic-entity-form";
import { getFullEntityConfig } from "@/lib/get-full-entity-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import FlowchartEditor from "@/components/flowchart-editor";
import { toast } from 'sonner';

// Helper to robustly stringify any value for rendering
function renderValue(val: any): string {
  if (val == null) return "N/A";
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return val.map(renderValue).join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return val.toString();
}

export default function CampaignDetailsClient({
  campaign,
  npcs,
  locations,
  items,
  notes,
  sessions,
  encounters,
  campaigns,
}: {
  campaign: any;
  npcs: any[];
  locations: any[];
  items: any[];
  notes: any[];
  sessions: any[];
  encounters: any[];
  campaigns: any[];
}) {
  // State for add modals and edit/delete modals per section
  const [open, setOpen] = useState<null | string>(null);
  const [editEntity, setEditEntity] = useState<{ [key: string]: any }>({});
  const [deleteEntity, setDeleteEntity] = useState<{ [key: string]: any }>({});
  // State for expanded sections (allow multiple open)
  const [expandedSections, setExpandedSections] = useState<string[]>(["npcs"]);
  // Local state for each section's data
  const [sectionData, setSectionData] = useState<{ [key: string]: any[] }>({
    npcs,
    locations,
    items,
    notes,
    sessions,
    encounters,
  });
  const [flowcharts, setFlowcharts] = useState<any[]>([]);
  const [loadingFlowcharts, setLoadingFlowcharts] = useState(true);
  const [showFlowchartEditor, setShowFlowchartEditor] = useState(false);
  const [editingFlowchart, setEditingFlowchart] = useState<any | null>(null);
  const [flowchartToDelete, setFlowchartToDelete] = useState<any | null>(null);

  useEffect(() => {
    async function fetchFlowcharts() {
      if (campaign && campaign.id) {
        setLoadingFlowcharts(true);
        try {
          const response = await fetch(`/api/campaigns/${campaign.id}/flowcharts`);
          if (response.ok) {
            const data = await response.json();
            setFlowcharts(data);
          } else {
            console.error("Failed to fetch flowcharts");
            setFlowcharts([]); // Set to empty on error
          }
        } catch (error) {
          console.error("Error fetching flowcharts:", error);
          setFlowcharts([]); // Set to empty on error
        } finally {
          setLoadingFlowcharts(false);
        }
      }
    }
    fetchFlowcharts();
  }, [campaign]);

  // Helper to open modal for a section
  const openModal = (section: string, entity: any = null) => {
    setOpen(section);
    if (entity) {
      setEditEntity(prev => ({ ...prev, [section]: entity }));
    } else {
       // Default entity for creation, e.g., for sessions
       const defaultEntity: { [key: string]: any } = { campaign_id: campaign.id };
       if (section === "sessions") {
         defaultEntity.date = new Date().toISOString().slice(0, 10);
       }
       setEditEntity(prev => ({ ...prev, [section]: defaultEntity }));
    }
  };
  const closeModal = () => {
    setOpen(null);
    // Clear all edit states
    setEditEntity({});
  };

  const handleFlowchartCreatedOrUpdated = (flowchart: any) => {
    setFlowcharts(prev => {
      const index = prev.findIndex(f => f.id === flowchart.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = flowchart;
        return updated;
      }
      return [...prev, flowchart];
    });
    setShowFlowchartEditor(false);
    setEditingFlowchart(null);
  };

  const handleNewFlowchart = () => {
    setEditingFlowchart({ name: "New Flowchart" }); // No ID for new
    setShowFlowchartEditor(true);
  };

  const handleEditFlowchart = (flowchart: any) => {
    setEditingFlowchart(flowchart);
    setShowFlowchartEditor(true);
  };
  
  const handleDeleteFlowchart = async (flowchartId: string) => {
    try {
      const response = await fetch(`/api/flowcharts/${flowchartId}`, { method: 'DELETE' });
      if (response.ok) {
        setFlowcharts(prev => prev.filter(f => f.id !== flowchartId));
        toast.success("Flowchart deleted successfully.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to delete flowchart:", response.status, errorData);
        toast.error(errorData.error || `Failed to delete flowchart: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("Error deleting flowchart:", error);
      toast.error(error.message || "An unexpected error occurred while deleting the flowchart.");
    }
    setFlowchartToDelete(null);
  };

  const sections = [
    { label: "NPCs", key: "npcs", data: sectionData.npcs, config: entitiesConfig.npcs },
    { label: "Locations", key: "locations", data: sectionData.locations, config: entitiesConfig.locations },
    { label: "Items", key: "items", data: sectionData.items, config: entitiesConfig.items },
    { label: "Notes", key: "notes", data: sectionData.notes, config: entitiesConfig.notes },
    { label: "Sessions", key: "sessions", data: sectionData.sessions, config: entitiesConfig.sessions },
    { label: "Encounters", key: "encounters", data: sectionData.encounters, config: entitiesConfig.encounters },
  ];

  async function handleDelete(sectionKey: string, entity: any) {
    try {
      const response = await fetch(`/api/${sectionKey}/${entity.id}`, { method: "DELETE" });

      if (response.ok) {
        // Update local state to remove the deleted entity
        setSectionData(prevSectionData => ({
          ...prevSectionData,
          [sectionKey]: prevSectionData[sectionKey].filter(item => item.id !== entity.id),
        }));
        // alert(`${entity.name || entity.title || 'Entity'} deleted successfully.`); // Optional success message
      } else {
        // Handle errors (e.g., show an error message)
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete entity. Unknown error.' }));
        console.error(`Failed to delete ${sectionKey}:`, response.status, errorData);
        alert(`Failed to delete ${entity.name || entity.title || 'Entity'}. Error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error(`Error during deletion of ${sectionKey}:`, error);
      alert(`An unexpected error occurred while deleting ${entity.name || entity.title || 'Entity'}. See console for details.`);
    }
    // window.location.reload(); // Removed the immediate reload
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="max-w-4xl w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 mb-8">
        {campaign.image_url && (
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-64 object-cover rounded-t-lg border-b border-amber-800/30"
          />
        )}
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-3xl">
            {campaign.title}
          </CardTitle>
        </CardHeader>
      </Card>
      <Accordion type="multiple" className="w-full space-y-4 mt-8" defaultValue={expandedSections} onValueChange={setExpandedSections}>
        {sections.map(section => {
          const isExpanded = expandedSections.includes(section.key);
          const currentEditEntity = editEntity[section.key];
          const currentOpenModal = open === section.key && !currentEditEntity; // True if "Add New" modal for this section
          const currentEditModal = open === section.key && !!currentEditEntity; // True if "Edit" modal for this section

          return (
            <AccordionItem value={section.key} key={section.key} className="border border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 rounded-md">
              <AccordionTrigger className="px-6 py-4 font-heading text-xl text-amber-900 dark:text-amber-200 hover:no-underline hover:bg-amber-50/30 dark:hover:bg-stone-700/30 rounded-t-md">
                {section.label}
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 border-t border-amber-800/20 dark:border-amber-800/30 bg-amber-50/10 dark:bg-stone-800/10 rounded-b-md">
                {isExpanded && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end mb-2">
                      <Button
                        className="bg-amber-800 text-amber-100 hover:bg-amber-700"
                        onClick={() => openModal(section.key)}
                      >
                        Add New {section.label.slice(0, -1)}
                      </Button>
                    </div>
                    <GenericEntityGrid
                      data={section.data}
                      config={section.config}
                      campaigns={campaigns}
                      wikiMode={true}
                      onEdit={item => openModal(section.key, item)}
                      onDelete={item => setDeleteEntity(prev => ({ ...prev, [section.key]: item }))}
                    />
                    <GenericEntityForm
                      open={currentOpenModal || currentEditModal}
                      setOpen={v => {
                        if (!v) {
                          closeModal();
                        }
                        // setOpen needs to be handled carefully if it's a string or boolean
                      }}
                      config={getFullEntityConfig(section.config, `/${section.key}`, campaigns)}
                      availableLocations={section.key === 'encounters' ? sectionData.locations : undefined}
                      onCreated={newEntity => {
                        setSectionData(prev => ({
                          ...prev,
                          [section.key]: currentEditEntity 
                            ? prev[section.key].map(e => e.id === newEntity.id ? newEntity : e) 
                            : [...prev[section.key], newEntity]
                        }));
                        closeModal();
                      }}
                      campaigns={campaigns}
                      entity={currentEditEntity || undefined}
                    />
                    {deleteEntity[section.key] && (
                      <Dialog open={!!deleteEntity[section.key]} onOpenChange={() => setDeleteEntity(prev => ({...prev, [section.key]: null}))}>
                        <DialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
                          <DialogHeader>
                            <DialogTitle className="text-amber-900 dark:text-amber-200">Delete {section.config.label.slice(0, -1)}</DialogTitle>
                          </DialogHeader>
                          <p className="text-amber-800 dark:text-amber-400">
                            Are you sure you want to delete "{deleteEntity[section.key]?.name || deleteEntity[section.key]?.title}"?
                          </p>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" className="text-amber-900 dark:text-amber-200 border-amber-800/30">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={async () => {
                                await handleDelete(section.key, deleteEntity[section.key]);
                                setDeleteEntity(prev => ({...prev, [section.key]: null}));
                            }}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}

        {/* Flowcharts Section */}
        <AccordionItem value="flowcharts" className="border border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 rounded-md">
          <AccordionTrigger className="px-6 py-4 font-heading text-xl text-amber-900 dark:text-amber-200 hover:no-underline hover:bg-amber-50/30 dark:hover:bg-stone-700/30 rounded-t-md">
            Flowcharts
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 border-t border-amber-800/20 dark:border-amber-800/30 bg-amber-50/10 dark:bg-stone-800/10 rounded-b-md">
            {expandedSections.includes("flowcharts") && (
              <div className="space-y-4">
                <div className="flex items-center justify-end mb-2">
                  <Button
                    className="bg-amber-800 text-amber-100 hover:bg-amber-700"
                    onClick={handleNewFlowchart}
                  >
                    New Flowchart
                  </Button>
                </div>
                {loadingFlowcharts ? (
                  <p className="text-amber-800 dark:text-amber-400">Loading flowcharts...</p>
                ) : flowcharts.length > 0 ? (
                  <ul className="space-y-2">
                    {flowcharts.map(fc => (
                      <li key={fc.id} className="flex items-center justify-between p-2 border border-amber-800/20 dark:border-amber-600/20 rounded-md bg-amber-50/50 dark:bg-stone-700/30">
                        <span className="text-amber-900 dark:text-amber-200">{fc.name}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-amber-800 border-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-500 dark:hover:bg-stone-600" onClick={() => handleEditFlowchart(fc)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => setFlowchartToDelete(fc)}>Delete</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-amber-800 dark:text-amber-400">No flowcharts created yet for this campaign.</p>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Flowchart Editor Dialog */}
      {showFlowchartEditor && (
        <Dialog open={showFlowchartEditor} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowFlowchartEditor(false);
            setEditingFlowchart(null);
          }
        }}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-parchment-light dark:bg-stone-800 border-amber-800/20 p-0">
            <DialogHeader className="p-4 border-b border-amber-800/20">
              <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">
                {editingFlowchart?.id ? `Edit Flowchart: ${editingFlowchart.name}` : "Create New Flowchart"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-hidden p-1"> {/* Added p-1 to prevent scrollbar overlap with border if any */}
              <FlowchartEditor
                campaignId={campaign.id}
                flowchartId={editingFlowchart?.id}
                initialName={editingFlowchart?.name}
                onSaveSuccess={handleFlowchartCreatedOrUpdated}
                // key={editingFlowchart?.id || 'new'} // To force re-mount if needed, or manage state reset internally
              />
            </div>
            {/* Footer can be added if explicit save/close from dialog is needed, but editor has its own save */}
            {/* <DialogFooter className="p-4 border-t border-amber-800/20">
              <Button variant="outline" onClick={() => { setShowFlowchartEditor(false); setEditingFlowchart(null); }}>Close</Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Flowchart Confirmation Dialog */}
      {flowchartToDelete && (
        <AlertDialog open={!!flowchartToDelete} onOpenChange={() => setFlowchartToDelete(null)}>
          <AlertDialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-amber-900 dark:text-amber-200">Are you sure you want to delete "{flowchartToDelete.name}"?</AlertDialogTitle>
              <AlertDialogDescription className="text-amber-700 dark:text-amber-400">
                This action cannot be undone. This will permanently delete the flowchart.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => setFlowchartToDelete(null)} 
                className="text-amber-900 dark:text-amber-200 border-amber-800/30"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDeleteFlowchart(flowchartToDelete.id)} 
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
} 