"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GenericEntityGrid from "@/components/generic-entity-grid";
import { useState, useEffect } from "react";
import { entitiesConfig } from "@/lib/entities-config";
import GenericEntityForm from "@/components/generic-entity-form";
import { getFullEntityConfig } from "@/lib/get-full-entity-config";
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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
  const [flowchartToDelete, setFlowchartToDelete] = useState<any | null>(null);
  const [flowchartSyncTrigger, setFlowchartSyncTrigger] = useState(0);

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
            setFlowcharts([]);
            toast.error("Failed to load flowcharts for this campaign.");
          }
        } catch (error) {
          console.error("Error fetching flowcharts:", error);
          setFlowcharts([]);
          toast.error("An error occurred while fetching flowcharts.");
        } finally {
          setLoadingFlowcharts(false);
        }
      }
    }
    fetchFlowcharts();
  }, [campaign]);

  // Helper to open modal for a section
  const openModal = (section: string, entityToEdit: any = null) => {
    setOpen(section);
    if (entityToEdit) {
      const currentSectionConfig = sections.find(s => s.key === section)?.config;
      const plainDataEntity: { [key: string]: any } = {};

      if (currentSectionConfig && currentSectionConfig.fields) {
        if (entityToEdit.id !== undefined) {
          plainDataEntity.id = entityToEdit.id;
        }
        if (entityToEdit.campaign_id !== undefined) {
          plainDataEntity.campaign_id = entityToEdit.campaign_id;
        }

        currentSectionConfig.fields.forEach((field: { name: string }) => {
          if (entityToEdit.hasOwnProperty(field.name)) {
            if (!(field.name === 'id' && plainDataEntity.id !== undefined) && 
                !(field.name === 'campaign_id' && plainDataEntity.campaign_id !== undefined)) {
              plainDataEntity[field.name] = entityToEdit[field.name];
            }
          } else {
             if (field.name !== 'id' && field.name !== 'campaign_id') {
                console.warn(`CampaignDetailsClient: Configured field '${field.name}' not found as own property on entityToEdit for section ${section}. Entity:`, entityToEdit);
             }
          }
        });

        if (section === 'encounters') {
          if (entityToEdit.location !== undefined) {
            plainDataEntity.campaign_location_id = entityToEdit.location;
          } else if (plainDataEntity.campaign_location_id === undefined) {
            console.warn("Encounter entityToEdit is missing 'location' field for 'campaign_location_id'");
            plainDataEntity.campaign_location_id = ''; 
          }
          if (Array.isArray(entityToEdit.npcs)) { 
            plainDataEntity.npc_ids = entityToEdit.npcs.map((npc: any) => String(npc.id));
          } else if (Array.isArray(entityToEdit.npc_ids)) { 
             plainDataEntity.npc_ids = entityToEdit.npc_ids.map(String);
          } else if (plainDataEntity.npc_ids === undefined) {
            console.warn("Encounter entityToEdit does not have an 'npcs' array or 'npc_ids' array for NPC selection.");
            plainDataEntity.npc_ids = []; 
          }
        }
        if (section === 'notes' && entityToEdit.hasOwnProperty('entity_links')) {
          plainDataEntity.entity_links = entityToEdit.entity_links;
        }
        if (entityToEdit.hasOwnProperty('campaigns')) {
            plainDataEntity.campaigns = entityToEdit.campaigns;
        }
      } else {
        console.error(`Config not found for section ${section}. Falling back to shallow clone for entity:`, entityToEdit);
        Object.assign(plainDataEntity, { ...entityToEdit }); 
      }
      
      setEditEntity(prev => ({ ...prev, [section]: plainDataEntity }));

    } else {
       if (!campaign || !campaign.id) {
         toast.error("Cannot add new item: Campaign data is not fully loaded.");
         setOpen(null); 
         return;
       }
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

  const triggerFlowchartSync = () => {
    setFlowchartSyncTrigger(prev => prev + 1); 
  };

  const handleEntityUpdateSuccess = (sectionKey: string, updatedEntity: any, isNew: boolean) => {
    setSectionData(prevSectionData => {
      const currentSectionItems = prevSectionData[sectionKey] || [];
      if (isNew) {
        return {
          ...prevSectionData,
          [sectionKey]: [...currentSectionItems, updatedEntity],
        };
      } else {
        const updatedItems = currentSectionItems.map(item => 
          item.id === updatedEntity.id ? updatedEntity : item
        );
        setEditEntity(prevEditEntity => {
          if (prevEditEntity[sectionKey] && prevEditEntity[sectionKey].id === updatedEntity.id) {
            return {
              ...prevEditEntity,
              [sectionKey]: updatedEntity,
            };
          }
          return prevEditEntity;
        });
        return {
          ...prevSectionData,
          [sectionKey]: updatedItems,
        };
      }
    });
    if (isNew) {
      closeModal();
    } else {
      // For edits, GenericEntityForm calls setOpen(false) which calls closeModal via props.
      // No explicit closeModal() here to allow form to stay if needed, though current setup closes it.
    }
  };

  const handleNewFlowchart = () => {
    if (campaign && campaign.id) {
      router.push(`/new-flowchart/${campaign.id}`);
    } else {
      toast.error("Campaign ID is missing. Cannot create new flowchart.");
    }
  };

  const handleEditFlowchart = (flowchart: any) => {
    if (flowchart && flowchart.id) {
      router.push(`/flowchart-editor/${flowchart.id}`);
    } else {
      toast.error("Flowchart ID is missing. Cannot edit flowchart.");
    }
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

  async function handleDelete(sectionKey: string, entityToDelete: any) {
    const config = sections.find((s) => s.key === sectionKey)?.config;
    if (!config || !entityToDelete || !entityToDelete.id) {
      console.error(`Invalid arguments for handleDelete: sectionKey=${sectionKey}, entityId=${entityToDelete?.id}`);
      toast.error(`Error preparing to delete: Invalid data.`);
      return;
    }
    try {
      const response = await fetch(`${config.api}/${entityToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSectionData((prevData) => ({
          ...prevData,
          [sectionKey]: prevData[sectionKey].filter(
            (item) => item.id !== entityToDelete.id
          ),
        }));
        toast.success(`${config.label.slice(0, -1)} deleted successfully.`);
      } else {
        const errorData = await response.json().catch(() => ({})); 
        console.error(`Failed to delete ${config.label.slice(0, -1)}:`, response.status, errorData);
        toast.error(errorData.error || `Failed to delete ${config.label.slice(0, -1)}.`);
      }
    } catch (error: any) { 
      console.error(`Error deleting ${config.label.slice(0, -1)}:`, error);
      toast.error(error.message || `An unexpected error occurred while deleting the ${config.label.slice(0, -1)}.`);
    } finally {
      setDeleteEntity(prev => ({ ...prev, [sectionKey]: null }));
    }
  }

  async function handleDeleteWrapper(sectionKey: string, entity: any) {
    setDeleteEntity(prev => ({...prev, [sectionKey]: entity}));
  }

  async function confirmDelete(sectionKey: string) {
    const entity = deleteEntity[sectionKey];
    if (entity) {
      await handleDelete(sectionKey, entity);
    }
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
                        disabled={!campaign || !campaign.id}
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
                      onDelete={item => handleDeleteWrapper(section.key, item)}
                    />
                    <GenericEntityForm
                      key={currentEditEntity ? `edit-${section.key}-${currentEditEntity.id}` : `new-${section.key}`}
                      open={currentOpenModal || currentEditModal}
                      setOpen={v => {
                        if (!v) {
                          closeModal();
                        }
                        // setOpen needs to be handled carefully if it's a string or boolean
                      }}
                      config={getFullEntityConfig(section.config, `/${section.key}`, campaigns)}
                      availableLocations={(section.key === 'encounters' || section.key === 'npcs' || section.key === 'notes') ? sectionData.locations : undefined}
                      onCreated={newEntity => {
                        const isActuallyNew = !(currentEditEntity && currentEditEntity.id);
                        handleEntityUpdateSuccess(section.key, newEntity, isActuallyNew);
                      }}
                      campaigns={campaigns}
                      entity={currentEditEntity || undefined}
                      allNpcs={(section.key === 'encounters' || section.key === 'notes') ? sectionData.npcs : undefined}
                      allItems={(section.key === 'encounters' || section.key === 'notes') ? sectionData.items : undefined}
                      allEncounters={(section.key === 'notes') ? sectionData.encounters : undefined}
                      allLocations={section.key === 'locations' ? sectionData.locations : undefined}
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
                                await confirmDelete(section.key);
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

      {/* Generic Entity Form Modal for other entities */}
      {open && sections.find(s => s.key === open) && (
        <GenericEntityForm
          open={!!open}
          setOpen={(isOpen) => !isOpen && closeModal()}
          config={getFullEntityConfig(sections.find(s => s.key === open)!.config, `/${open}`, campaigns)}
          onCreated={(item) => {
            const sectionKey = open!;
            const isNew = !editEntity[sectionKey];
            handleEntityUpdateSuccess(sectionKey, item, isNew);
          }}
          campaigns={campaigns}
          entity={editEntity[open!] || { campaign_id: campaign.id }}
          availableLocations={locations} 
          allNpcs={sectionData.npcs}     
          allItems={sectionData.items}
          allEncounters={sectionData.encounters}
        />
      )}

      {/* Delete Confirmation Modals for generic entities */}
      {sections.map(section => deleteEntity[section.key] && (
        <AlertDialog key={`delete-alert-${section.key}`} open={!!deleteEntity[section.key]} onOpenChange={(isOpen) => !isOpen && setDeleteEntity(prev => ({...prev, [section.key]: null}))}>
          <AlertDialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-amber-900 dark:text-amber-200">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-amber-800 dark:text-amber-400">
                Are you sure you want to delete this {section.config.label.slice(0, -1).toLowerCase()}? This action cannot be undone.
                Name: {deleteEntity[section.key]?.name || deleteEntity[section.key]?.title || 'N/A'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-amber-800 dark:text-amber-300 border-amber-700 hover:bg-amber-100 dark:border-amber-500 dark:hover:bg-stone-700" onClick={() => setDeleteEntity(prev => ({...prev, [section.key]: null}))}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-800 hover:bg-red-700 text-amber-100" onClick={() => confirmDelete(section.key)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}

      {/* Delete Flowchart Confirmation Dialog */}
      {flowchartToDelete && (
        <AlertDialog open={!!flowchartToDelete} onOpenChange={(isOpen) => !isOpen && setFlowchartToDelete(null)}>
          <AlertDialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-amber-900 dark:text-amber-200">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-amber-800 dark:text-amber-400">
                Are you sure you want to delete the flowchart "{flowchartToDelete.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-amber-800 dark:text-amber-300 border-amber-700 hover:bg-amber-100 dark:border-amber-500 dark:hover:bg-stone-700" onClick={() => setFlowchartToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-800 hover:bg-red-700 text-amber-100" onClick={() => handleDeleteFlowchart(flowchartToDelete.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
} 