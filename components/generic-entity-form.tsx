import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface GenericEntityFormProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  config: any;
  onCreated: (item: any) => void;
  campaigns?: any[];
  entity?: any;
  availableLocations?: Array<{ id: any; name: string; campaign_id?: any; [key: string]: any; }>;
  allNpcs?: Array<{ id: any; name: string; campaign_id?: any; [key: string]: any; }>;
  allItems?: Array<{ id: any; name: string; campaign_id?: any; [key: string]: any; }>;
  allEncounters?: Array<{ id: any; title: string; campaign_id?: any; [key: string]: any; }>;
}

export default function GenericEntityForm({ 
  open, 
  setOpen, 
  config, 
  onCreated, 
  campaigns = [],
  entity,
  availableLocations,
  allNpcs,
  allItems,
  allEncounters,
}: GenericEntityFormProps) {
  const formElementRef = useRef<HTMLFormElement>(null);
  const [formDomIsReady, setFormDomIsReady] = useState(false);

  const fields = config.fields;

  // State for dynamic entity linking (for Notes)
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [availableEntitiesForLink, setAvailableEntitiesForLink] = useState<any[]>([]);
  const [selectedLinkedEntityId, setSelectedLinkedEntityId] = useState<string | number>(''); // Store as string to match select value, parse on submit
  const [isLoadingLinkedEntities, setIsLoadingLinkedEntities] = useState<boolean>(false);

  // State for Encounter NPC selection
  const [selectedEncounterLocationId, setSelectedEncounterLocationId] = useState<string | number>('');
  const [filteredNpcsForEncounter, setFilteredNpcsForEncounter] = useState<Array<{ id: any; name: string; }>>([]);
  const [npcSelectPopoverOpen, setNpcSelectPopoverOpen] = useState(false);
  const [selectedNpcIdsForForm, setSelectedNpcIdsForForm] = useState<Set<string>>(new Set());

  // Effect to initialize form state for editing a Note with a linked entity
  useEffect(() => {
    if (config.label === 'Notes' && entity && open) {
      const initialEntityType = entity.linked_entity_type || '';
      setSelectedEntityType(initialEntityType);
      setSelectedLinkedEntityId(entity.linked_entity_id || '');
      // The actual list for availableEntitiesForLink will be populated by the next effect
      // based on initialEntityType
    } else if (!open) {
      // Reset state when dialog closes
      setSelectedEntityType('');
      setAvailableEntitiesForLink([]);
      setSelectedLinkedEntityId('');
      // Reset Encounter specific state too
      setSelectedEncounterLocationId('');
      setFilteredNpcsForEncounter([]);
      setNpcSelectPopoverOpen(false);
      setSelectedNpcIdsForForm(new Set());
    }
  }, [entity, open, config.label]);

  // Effect to update the list of available entities when entity type changes or on initial load for edit
  useEffect(() => {
    if (config.label !== 'Notes' || !selectedEntityType) {
      setAvailableEntitiesForLink([]);
      // If not a Note or no entity type selected, also clear the ID unless it was pre-filled from 'entity'
      // This part is tricky: if entity.linked_entity_id was set, we want to keep it until type changes
      // For now, let's clear if type is cleared:
      if (!selectedEntityType) setSelectedLinkedEntityId('');
      return;
    }

    setIsLoadingLinkedEntities(true);
    let entities: any[] = [];
    switch (selectedEntityType) {
      case 'campaign':
        entities = campaigns || [];
        break;
      case 'location':
        entities = availableLocations || [];
        break;
      case 'npc':
        entities = allNpcs || [];
        break;
      case 'item':
        entities = allItems || [];
        break;
      case 'encounter':
        entities = allEncounters || [];
        break;
      default:
        entities = [];
        break;
    }
    setAvailableEntitiesForLink(entities);
    setIsLoadingLinkedEntities(false);

    // If the initially loaded entity.linked_entity_id doesn't match the new list of entities for the selected type,
    // clear it. This avoids an invalid selection if the type was changed after initial load.
    // However, if selectedLinkedEntityId was already set from the entity prop and matches the current selectedEntityType,
    // we should try to keep it. This logic might need refinement based on desired UX.
    // For now, if the selectedEntityType changes, we might want to clear selectedLinkedEntityId unless it's the initial load.
    // The first useEffect already sets selectedLinkedEntityId from entity.
    // So this effect primarily populates the list. We don't clear selectedLinkedEntityId here to allow pre-selection.

  }, [selectedEntityType, campaigns, availableLocations, allNpcs, allItems, allEncounters, config.label]);

  // Log props/state just before the NPC filtering effect for Encounters
  if (config.label === 'Encounters') {
    console.log('[GenericEntityForm Encounter Render Check] selectedEncounterLocationId:', selectedEncounterLocationId, 'allNpcs available:', !!allNpcs, 'allNpcs length:', allNpcs?.length);
  }

  // Effect to filter NPCs for Encounters when selected location changes or allNpcs are loaded
  useEffect(() => {
    if (config.label === 'Encounters' && selectedEncounterLocationId && allNpcs) {
      console.log("Filtering NPCs for location ID:", selectedEncounterLocationId);
      console.log("All NPCs available for filtering:", allNpcs);
      const filtered = allNpcs.filter(npc => {
        // Assuming npc.location_name reliably holds the ID of the location.
        // If npc.location_name can be null/undefined, add checks.
        const npcLocationId = npc.location_name; 
        console.log(`NPC: ${npc.name}, its location_name: ${npcLocationId}, Comparing with: ${selectedEncounterLocationId}`);
        return String(npcLocationId) === String(selectedEncounterLocationId);
      });
      console.log("Filtered NPCs:", filtered);
      setFilteredNpcsForEncounter(filtered);
    } else if (config.label === 'Encounters') {
      // If no location selected or not an encounter form, or no NPCs, clear the list
      setFilteredNpcsForEncounter([]);
      if (!allNpcs && config.label === 'Encounters') {
        console.log("allNpcs is not available for encounter NPC filtering.");
      }
      if (!selectedEncounterLocationId && config.label === 'Encounters') {
        console.log("No encounter location selected for NPC filtering.");
      }
    }
  }, [selectedEncounterLocationId, allNpcs, config.label]);

  const measuredRef = useCallback((node: HTMLFormElement | null) => {
    formElementRef.current = node;
    setFormDomIsReady(!!node);
  }, []);

  useEffect(() => {
    if (!formElementRef.current || !formDomIsReady) {
      return;
    }

    if (entity && open) {
      fields.forEach((field: any) => {
        const element = formElementRef.current?.elements.namedItem(field.name) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | RadioNodeList | null);
        if (element || field.type === 'multiselect-npc') {
          const valueToSet = entity[field.name];
          
          if (config.label === 'Encounters' && field.name === 'campaign_location_id') {
            if (element instanceof HTMLSelectElement) element.value = valueToSet || '';
            setSelectedEncounterLocationId(valueToSet || '');
            console.log("Encounter form: Initial location ID set to:", valueToSet || '');
          } else if (field.type === 'multiselect-npc' && config.label === 'Encounters') {
            if (Array.isArray(valueToSet)) {
              setSelectedNpcIdsForForm(new Set(valueToSet.map(String)));
            } else {
              setSelectedNpcIdsForForm(new Set());
            }
          } else if (field.type === "select" || field.type === "select-location") {
            if (element instanceof HTMLSelectElement) element.value = valueToSet || '';
          } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            if (field.type === 'date' && valueToSet) {
              element.value = valueToSet instanceof Date 
                ? valueToSet.toISOString().slice(0,10)
                : typeof valueToSet === 'string' 
                  ? valueToSet.slice(0,10) 
                  : '';
            } else {
              element.value = valueToSet instanceof Date 
                ? valueToSet.toISOString() 
                : valueToSet || '';
            }
          }
          if (element instanceof HTMLSelectElement) {
          } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          }

        } else {
          console.warn(`GenericEntityForm: Element not found in form for field name: '${field.name}'`);
        }
      });
    } else if (!open) {
      formElementRef.current.reset();
    } else {
      if (formElementRef.current) {
        formElementRef.current.reset();
      }
    }
  }, [entity, open, fields, formDomIsReady]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // If this is a Note and an entity is selected, add its ID and Name to formData
    if (config.label === 'Notes' && selectedEntityType && selectedLinkedEntityId) {
      formData.set('linked_entity_id', String(selectedLinkedEntityId));
      const selectedEntity = availableEntitiesForLink.find(e => String(e.id) === String(selectedLinkedEntityId));
      if (selectedEntity) {
        formData.set('linked_entity_name', selectedEntity.name || selectedEntity.title || '');
      } else {
        formData.set('linked_entity_name', ''); // Should not happen if selectedLinkedEntityId is valid
      }
    } else if (config.label === 'Notes') {
      // If it's a note but no entity type is selected or no specific entity is selected, ensure these fields are empty or not set
      formData.delete('linked_entity_id');
      formData.delete('linked_entity_name');
      // linked_entity_type will be set to "" if "None" was selected, which is fine.
    }
    
    // Handle npc_ids for Encounters from selectedNpcIdsForForm state
    if (config.label === 'Encounters') {
      // Clear any existing npc_ids from FormData (in case there was a native element with that name)
      formData.delete('npc_ids'); 
      selectedNpcIdsForForm.forEach(npcId => {
        formData.append('npc_ids', npcId);
      });
      console.log("Submitting npc_ids:", Array.from(selectedNpcIdsForForm));
    }
    
    const isEdit = entity && entity.id;
    const url = isEdit ? `${config.api}/${entity.id}` : config.api;
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(
      url,
      {
        method,
        body: formData,
      }
    );
    
    if (res.ok) {
      setOpen(false);
      form.reset();
      const newItem = await res.json();
      onCreated(newItem);
    } else {
      alert(`Failed to ${entity ? 'update' : 'add'} ${config.label.slice(0, -1)}`);
    }
  };

  const groupedFields = fields.reduce((acc: any[], field: any) => {
    const lastGroup = acc[acc.length - 1];
    const width = field.layout?.width || "full";
    
    if (width === "full" || !lastGroup || lastGroup.some((f: any) => f.layout?.width === "full")) {
      acc.push([field]);
    } else {
      const currentWidth = lastGroup.reduce((sum: number, f: any) => {
        const w = f.layout?.width || "full";
        return sum + (w === "half" ? 0.5 : w === "third" ? 0.33 : 1);
      }, 0);
      
      if (currentWidth + (width === "half" ? 0.5 : width === "third" ? 0.33 : 1) <= 1) {
        lastGroup.push(field);
      } else {
        acc.push([field]);
      }
    }
    return acc;
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl bg-parchment-light dark:bg-stone-800 border-amber-800/20 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">
            {entity ? 'Edit' : 'Add'} {config.label.slice(0, -1)}
          </DialogTitle>
        </DialogHeader>
        <form ref={measuredRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {groupedFields.map((row: any[], rowIndex: number) => (
              <div key={rowIndex} className="flex gap-4">
                {row.map((field: any) => {
                  return (
                    <div 
                      key={field.name} 
                      className={`space-y-2 ${
                        field.layout?.width === "half" ? "w-1/2" :
                        field.layout?.width === "third" ? "w-1/3" :
                        "w-full"
                      }`}
                    >
                      <Label htmlFor={field.name} className="text-amber-900 dark:text-amber-200">
                        {field.label}
                      </Label>
                      {field.type === "text" && (
                        <Input
                          id={field.name}
                          name={field.name}
                          type="text"
                          required={field.required}
                          className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                        />
                      )}
                      {field.type === "longtext" && (
                        <Textarea
                          id={field.name}
                          name={field.name}
                          required={field.required}
                          rows={field.layout?.rows || 3}
                          className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                        />
                      )}
                      {field.type === "date" && (
                        <Input
                          id={field.name}
                          name={field.name}
                          type="date"
                          required={field.required}
                          className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                        />
                      )}
                      {field.type === "select" && (
                        <select
                          id={field.name}
                          name={field.name}
                          required={field.required}
                          value={field.name === 'linked_entity_type' && config.label === 'Notes' ? selectedEntityType : undefined}
                          onChange={e => {
                            if (field.name === 'linked_entity_type' && config.label === 'Notes') {
                              setSelectedEntityType(e.target.value);
                              setSelectedLinkedEntityId('');
                            }
                          }}
                          className="w-full rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option: any) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {config.label === 'Encounters' && field.type === 'select-location' && field.name === 'campaign_location_id' ? (
                        <select 
                          id={field.name} 
                          name={field.name} 
                          required={field.required}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-sm text-amber-900 ring-offset-background placeholder:text-amber-700/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                          onChange={(e) => {
                            setSelectedEncounterLocationId(e.target.value);
                            console.log("Encounter location changed to:", e.target.value);
                          }}
                        >
                          <option value="">Select Location</option>
                          {availableLocations?.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      ) : field.type === "select-location" ? (
                        <select 
                          id={field.name} 
                          name={field.name} 
                          required={field.required}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-sm text-amber-900 ring-offset-background placeholder:text-amber-700/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                        >
                          <option value="">Select Location</option>
                          {availableLocations?.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      ) : field.type === "multiselect-npc" && config.label === 'Encounters' ? (
                        <Popover open={npcSelectPopoverOpen} onOpenChange={setNpcSelectPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={npcSelectPopoverOpen}
                              className="w-full justify-between bg-amber-50/50 border-amber-800/30 text-amber-900 hover:text-amber-900 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:hover:text-amber-200 min-h-10 h-auto py-2"
                            >
                              <span className="flex flex-wrap gap-1">
                                {selectedNpcIdsForForm.size === 0 && "Select NPCs..."}
                                {Array.from(selectedNpcIdsForForm).map(npcId => {
                                  const npc = allNpcs?.find(n => String(n.id) === npcId);
                                  return npc ? (
                                    <Badge
                                      key={npc.id}
                                      variant="secondary"
                                      className="bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100 flex items-center"
                                    >
                                      {npc.name}
                                      <span 
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Remove ${npc.name}`}
                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                        onClick={(e) => { 
                                          e.stopPropagation(); // Prevent popover from closing and parent button click
                                          e.preventDefault(); // Prevent any default span behavior if any
                                          setSelectedNpcIdsForForm(prev => {
                                            const next = new Set(prev);
                                            next.delete(String(npc.id));
                                            return next;
                                          });
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setSelectedNpcIdsForForm(prev => {
                                              const next = new Set(prev);
                                              next.delete(String(npc.id));
                                              return next;
                                            });
                                          }
                                        }}
                                      >
                                        <XIcon className="h-3 w-3" />
                                      </span>
                                    </Badge>
                                  ) : null;
                                })}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-parchment-light dark:bg-stone-800">
                            <Command>
                              <CommandInput placeholder="Search NPCs..." className="h-9 text-amber-900 dark:text-amber-200 placeholder:text-amber-700/50 dark:placeholder:text-amber-600/50" />
                              <CommandList>
                                <CommandEmpty className="py-6 text-center text-sm text-amber-800 dark:text-amber-300">No NPCs found.</CommandEmpty>
                                <CommandGroup>
                                  {filteredNpcsForEncounter.map(npc => (
                                    <CommandItem
                                      key={npc.id}
                                      value={npc.name}
                                      onSelect={() => {
                                        setSelectedNpcIdsForForm(prev => {
                                          const next = new Set(prev);
                                          if (next.has(String(npc.id))) {
                                            next.delete(String(npc.id));
                                          } else {
                                            next.add(String(npc.id));
                                          }
                                          return next;
                                        });
                                      }}
                                      className="text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-stone-700 aria-selected:bg-amber-200 dark:aria-selected:bg-stone-600"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedNpcIdsForForm.has(String(npc.id)) ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {npc.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : field.type === "file" ? (
                        <Input
                          id={field.name}
                          name={field.name}
                          type="file"
                          accept="image/*"
                          className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                        />
                      ) : field.type === "time" ? (
                        <Input
                          id={field.name}
                          name={field.name}
                          type="time"
                          required={field.required}
                          className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                        />
                      ) : null }
                      {config.label === 'Notes' && field.name === 'linked_entity_type' && selectedEntityType && !isLoadingLinkedEntities && availableEntitiesForLink.length > 0 && (
                        <div className="space-y-2 mt-2 w-full">
                          <Label htmlFor="linked_entity_id" className="text-amber-900 dark:text-amber-200">
                            Link To {selectedEntityType.charAt(0).toUpperCase() + selectedEntityType.slice(1)}
                          </Label>
                          <select
                            id="linked_entity_id"
                            name="linked_entity_id_select"
                            value={selectedLinkedEntityId}
                            onChange={e => setSelectedLinkedEntityId(e.target.value)}
                            required
                            className="w-full rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                          >
                            <option value="">Select {selectedEntityType.charAt(0).toUpperCase() + selectedEntityType.slice(1)}</option>
                            {availableEntitiesForLink.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name || item.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {config.label === 'Notes' && field.name === 'linked_entity_type' && selectedEntityType && isLoadingLinkedEntities && (
                        <p className="mt-2 text-amber-700 dark:text-amber-400">Loading entities...</p>
                      )}
                      {config.label === 'Notes' && field.name === 'linked_entity_type' && selectedEntityType && !isLoadingLinkedEntities && availableEntitiesForLink.length === 0 && (
                        <p className="mt-2 text-amber-700 dark:text-amber-400">No {selectedEntityType}s available to link.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4 pt-4 border-t border-amber-800/20">
            <DialogClose asChild>
              <Button variant="outline" className="text-amber-900 dark:text-amber-200 border-amber-800/30">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-amber-800 text-amber-100 hover:bg-amber-700">
              {entity ? 'Update' : 'Add'} {config.label.slice(0, -1)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 