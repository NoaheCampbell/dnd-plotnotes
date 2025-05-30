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
import { Checkbox } from "@/components/ui/checkbox";

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
  allLocations?: Array<{ id: number | string; name: string; [key: string]: any }>;
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
  allLocations,
}: GenericEntityFormProps) {
  const formElementRef = useRef<HTMLFormElement>(null);
  const [formDomIsReady, setFormDomIsReady] = useState(false);

  const fields = config.fields;

  // State for dynamic entity linking (for Notes)
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [availableEntitiesForLink, setAvailableEntitiesForLink] = useState<any[]>([]);
  const [selectedLinkedEntityId, setSelectedLinkedEntityId] = useState<string | number>('');
  const [isLoadingLinkedEntities, setIsLoadingLinkedEntities] = useState<boolean>(false);

  // State for Encounter NPC selection
  const [selectedEncounterLocationId, setSelectedEncounterLocationId] = useState<string | number>('');
  const [filteredNpcsForEncounter, setFilteredNpcsForEncounter] = useState<Array<{ id: any; name: string; }>>([]);
  const [npcSelectPopoverOpen, setNpcSelectPopoverOpen] = useState(false);
  const [selectedNpcIdsForForm, setSelectedNpcIdsForForm] = useState<Set<string>>(new Set());

  // State for the new polymorphic multi-link UI for Notes
  const [currentLinks, setCurrentLinks] = useState<Array<{ linked_entity_id: number; linked_entity_type: string; display_name?: string; }>>([]);
  const [linkEntityTypeToAdd, setLinkEntityTypeToAdd] = useState<string>('');
  const [linkEntityIdToAdd, setLinkEntityIdToAdd] = useState<string | number>('');
  const [availableEntitiesForNewLink, setAvailableEntitiesForNewLink] = useState<any[]>([]);

  // State for Next Location selection
  const [selectedNextLocationIds, setSelectedNextLocationIds] = useState<string[]>([]);
  const [nextLocationPopoverOpen, setNextLocationPopoverOpen] = useState(false);

  const getEntityDisplayName = useCallback((entityType: string, entityId: number | string): string => {
    let list: any[] = [];
    let nameKey = 'name';
    let idKey = 'id';

    switch (entityType) {
      case 'campaign': 
        list = campaigns || []; 
        nameKey = 'title';
        break;
      case 'location': 
        list = allLocations || availableLocations || []; // Use allLocations if available for note linking context
        break;
      case 'npc': 
        list = allNpcs || []; 
        break;
      case 'item': 
        list = allItems || []; 
        break;
      case 'encounter': 
        list = allEncounters || []; 
        nameKey = 'title'; 
        break;
      default: return `Unknown Type: ${entityType}`;
    }
    const foundEntity = list.find(e => String(e[idKey]) === String(entityId));
    return foundEntity ? foundEntity[nameKey] : `ID: ${entityId} (Not found)`;
  }, [campaigns, availableLocations, allNpcs, allItems, allEncounters, allLocations]); // Added allLocations

  // Effect to initialize form state for editing
  useEffect(() => {
    if (config.api === '/api/notes' && entity && open) {
      if (Array.isArray(entity.entity_links)) {
        const initialLinks = entity.entity_links.map((link: any) => ({
          linked_entity_id: Number(link.linked_entity_id),
          linked_entity_type: link.linked_entity_type,
          display_name: getEntityDisplayName(link.linked_entity_type, Number(link.linked_entity_id))
        }));
        setCurrentLinks(initialLinks);
      } else {
        setCurrentLinks([]);
      }
    } else if (config.api === '/api/locations' && entity && open) {
      if (entity.sequential_next_location_ids && Array.isArray(entity.sequential_next_location_ids)) {
        setSelectedNextLocationIds(entity.sequential_next_location_ids.map((id: any) => String(id)));
      } else if (entity.next_location_id) { // Fallback for old single ID if necessary
        setSelectedNextLocationIds([String(entity.next_location_id)]);
      } else {
        setSelectedNextLocationIds([]);
      }
    }

    if (!open) { // Reset all relevant states when dialog closes
      setSelectedEntityType(''); 
      setAvailableEntitiesForLink([]); 
      setSelectedLinkedEntityId(''); 
      setSelectedEncounterLocationId('');
      setFilteredNpcsForEncounter([]);
      setNpcSelectPopoverOpen(false);
      setSelectedNpcIdsForForm(new Set());
      // Reset new note link states
      setCurrentLinks([]);
      setLinkEntityTypeToAdd('');
      setLinkEntityIdToAdd('');
      setAvailableEntitiesForNewLink([]);
      setSelectedNextLocationIds([]);
      setNextLocationPopoverOpen(false); 
    }
  }, [entity, open, config.api, getEntityDisplayName]); 

  // useEffect to populate availableEntitiesForNewLink based on linkEntityTypeToAdd
  useEffect(() => {
    if (!linkEntityTypeToAdd) {
      setAvailableEntitiesForNewLink([]);
      setLinkEntityIdToAdd(''); 
      return;
    }
    let entities: any[] = [];
    switch (linkEntityTypeToAdd) {
      case 'campaign': entities = campaigns || []; break;
      case 'location': entities = allLocations || availableLocations || []; break; // Use allLocations if available
      case 'npc': entities = allNpcs || []; break;
      case 'item': entities = allItems || []; break;
      case 'encounter': entities = allEncounters || []; break;
      default: entities = []; break;
    }
    setAvailableEntitiesForNewLink(entities);
  }, [linkEntityTypeToAdd, campaigns, availableLocations, allNpcs, allItems, allEncounters, allLocations]); // Added allLocations

  // Effect to update the list of available entities when entity type changes or on initial load for edit
  useEffect(() => {
    if (config.label !== 'Notes' || !selectedEntityType) {
      setAvailableEntitiesForLink([]);
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
        entities = allLocations || availableLocations || []; // Use allLocations if available
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
  }, [selectedEntityType, campaigns, availableLocations, allNpcs, allItems, allEncounters, config.label, allLocations]); // Added allLocations

  // Effect to filter NPCs for Encounters when selected location changes or allNpcs are loaded
  useEffect(() => {
    if (config.label === 'Encounters' && selectedEncounterLocationId && allNpcs) {
      const filtered = allNpcs.filter(npc => {
        const npcLocationId = npc.location_name; 
        return String(npcLocationId) === String(selectedEncounterLocationId);
      });
      setFilteredNpcsForEncounter(filtered);
    } else if (config.label === 'Encounters') {
      setFilteredNpcsForEncounter([]);
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
          
          if (config.api === '/api/locations' && field.name === 'next_location_id') {
            // This field is handled by specific state (selectedNextLocationIds), not direct element manipulation here.
          } else if (config.label === 'Encounters' && field.name === 'campaign_location_id') {
            if (element instanceof HTMLSelectElement) element.value = valueToSet || '';
            setSelectedEncounterLocationId(valueToSet || '');
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
        } else {
          console.warn(`GenericEntityForm: Element not found in form for field name: '${field.name}'`);
        }
      });
    } else if (!open && formElementRef.current) { // Ensure current exists before reset
      formElementRef.current.reset();
    } else if (open && formElementRef.current) { // If open and no entity (create mode), also reset
      formElementRef.current.reset();
    }
  }, [entity, open, fields, formDomIsReady, config.api, config.label]); // Added config.api and config.label

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formElementRef.current) return;
    const formData = new FormData(formElementRef.current);
    
    if (config.api === '/api/encounters') {
      const npcIds = Array.from(selectedNpcIdsForForm);
      formData.append('npc_ids_json_string', JSON.stringify(npcIds));
    } else if (config.api === '/api/notes') {
      const linksToSubmit = currentLinks.map(link => ({
        linked_entity_id: Number(link.linked_entity_id),
        linked_entity_type: link.linked_entity_type,
      }));
      formData.append('entity_links_json_string', JSON.stringify(linksToSubmit));
    } else if (config.api === '/api/locations') {
      if (formData.has('next_location_id')) {
        formData.delete('next_location_id');
      }
      if (selectedNextLocationIds.length > 0) {
        formData.append('sequential_next_location_ids', selectedNextLocationIds.join(','));
      } else {
        formData.append('sequential_next_location_ids', ''); 
      }
    }

    const isEdit = entity && entity.id;
    const url = isEdit ? `${config.api}/${entity.id}` : config.api;
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(
        url,
        {
          method,
          body: formData,
        }
      );
    
      if (res.ok) {
        setOpen(false);
        const newItem = await res.json();
        if (typeof onCreated === 'function') {
          onCreated(newItem);
        }
      } else {
        const errorData = await res.text();
        console.error("GenericEntityForm: API call failed.", errorData);
        alert(`Failed to ${entity ? 'update' : 'add'} ${config.label.slice(0, -1)}. Error: ${errorData}`);
      }
    } catch (error) {
      console.error('GenericEntityForm: Error during fetch operation:', error);
      alert(`An unexpected error occurred. See console for details.`);
    }
  };

  const handleAddLink = () => {
    if (!linkEntityTypeToAdd || !linkEntityIdToAdd) {
      console.warn("Please select an entity type and an entity to link.");
      return;
    }

    const numericEntityId = Number(linkEntityIdToAdd);
    const alreadyLinked = currentLinks.some(
      link => link.linked_entity_id === numericEntityId && link.linked_entity_type === linkEntityTypeToAdd
    );

    if (alreadyLinked) {
      console.warn("This entity is already linked.");
      return;
    }

    const displayName = getEntityDisplayName(linkEntityTypeToAdd, numericEntityId);

    setCurrentLinks(prevLinks => [
      ...prevLinks,
      {
        linked_entity_id: numericEntityId,
        linked_entity_type: linkEntityTypeToAdd,
        display_name: displayName
      }
    ]);

    setLinkEntityTypeToAdd('');
    setLinkEntityIdToAdd('');
    setAvailableEntitiesForNewLink([]);
  };

  const handleRemoveLink = (indexToRemove: number) => {
    setCurrentLinks(prevLinks => prevLinks.filter((_, index) => index !== indexToRemove));
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
      
      if (currentWidth + (width === "half" ? 0.5 : width === "third" ? 0.33 : 1) <= 1.01) { // Allow for slight float imprecision
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
                      className={`space-y-2 ${field.layout?.width === "half" ? "w-1/2" : field.layout?.width === "third" ? "w-1/3" : "w-full"}`}>
                      <Label htmlFor={field.name} className="text-amber-900 dark:text-amber-200">
                        {field.label}
                      </Label>
                      {field.type === "text" && (
                        <Input id={field.name} name={field.name} type="text" required={field.required} className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50" />
                      )}
                      {field.type === "longtext" && (
                        <Textarea id={field.name} name={field.name} required={field.required} rows={field.layout?.rows || 3} className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50" />
                      )}
                      {field.type === "date" && (
                        <Input id={field.name} name={field.name} type="date" required={field.required} className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50" />
                      )}
                      {field.type === "select" && field.name !== 'linked_entity_type' && (
                        <select id={field.name} name={field.name} required={field.required} className="w-full rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50">
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option: any) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                      {config.label === 'Encounters' && field.type === 'select-location' && field.name === 'campaign_location_id' ? (
                        <select  id={field.name} name={field.name} required={field.required} className="flex h-10 w-full items-center justify-between rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-sm text-amber-900 ring-offset-background placeholder:text-amber-700/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50" value={selectedEncounterLocationId} onChange={(e) => setSelectedEncounterLocationId(e.target.value)}>
                          <option value="">Select Location</option>
                          {availableLocations?.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      ) : field.type === "select-location" ? (
                        <select id={field.name} name={field.name} required={field.required} className="flex h-10 w-full items-center justify-between rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-sm text-amber-900 ring-offset-background placeholder:text-amber-700/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50">
                          <option value="">Select Location</option>
                          {availableLocations?.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      ) : field.type === "multiselect-npc" && config.label === 'Encounters' ? (
                        <Popover open={npcSelectPopoverOpen} onOpenChange={setNpcSelectPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={npcSelectPopoverOpen} className="w-full justify-between bg-amber-50/50 border-amber-800/30 text-amber-900 hover:text-amber-900 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:hover:text-amber-200 min-h-10 h-auto py-2">
                              <span className="flex flex-wrap gap-1">
                                {selectedNpcIdsForForm.size === 0 && "Select NPCs..."}
                                {Array.from(selectedNpcIdsForForm).map(npcId => {
                                  const npc = allNpcs?.find(n => String(n.id) === npcId);
                                  return npc ? (
                                    <Badge key={npc.id} variant="secondary" className="bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100 flex items-center">
                                      {npc.name}
                                      <span role="button" tabIndex={0} aria-label={`Remove ${npc.name}`} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSelectedNpcIdsForForm(prev => { const next = new Set(prev); next.delete(String(npc.id)); return next; }); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); setSelectedNpcIdsForForm(prev => { const next = new Set(prev); next.delete(String(npc.id)); return next; }); } }}>
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
                                    <CommandItem key={npc.id} value={npc.name} onSelect={() => { setSelectedNpcIdsForForm(prev => { const next = new Set(prev); if (next.has(String(npc.id))) { next.delete(String(npc.id)); } else { next.add(String(npc.id)); } return next; }); }} className="text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-stone-700 aria-selected:bg-amber-200 dark:aria-selected:bg-stone-600">
                                      <Check className={cn("mr-2 h-4 w-4", selectedNpcIdsForForm.has(String(npc.id)) ? "opacity-100" : "opacity-0")} />
                                      {npc.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : field.type === "file" ? (
                        <Input id={field.name} name={field.name} type="file" accept="image/*" className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50" />
                      ) : field.type === "time" ? (
                        <Input id={field.name} name={field.name} type="time" required={field.required} className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50" />
                      ) : null }
                    </div>
                  );
                })}
              </div>
            ))}

            {config.api === '/api/notes' && (
              <div className="space-y-4 border-t border-amber-800/20 dark:border-amber-700/30 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-3">Linked Entities</h3>
                <div className="flex items-end gap-3 p-3 border border-amber-800/20 dark:border-amber-700/40 rounded-lg bg-amber-50/30 dark:bg-stone-700/20 shadow-sm">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="link-entity-type" className="text-xs font-medium text-amber-800 dark:text-amber-300">Entity Type</Label>
                    <select id="link-entity-type" value={linkEntityTypeToAdd} onChange={e => setLinkEntityTypeToAdd(e.target.value)} className="w-full rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200">
                      <option value="">Select Type...</option>
                      <option value="npc">NPC</option>
                      <option value="location">Location</option>
                      <option value="item">Item</option>
                      <option value="encounter">Encounter</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="link-entity-id" className="text-sm text-amber-800 dark:text-amber-300">Specific Entity</Label>
                    <select id="link-entity-id" value={linkEntityIdToAdd} onChange={e => setLinkEntityIdToAdd(e.target.value)} disabled={!linkEntityTypeToAdd || availableEntitiesForNewLink.length === 0} className="w-full rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 disabled:opacity-50">
                      <option value="">Select {linkEntityTypeToAdd ? linkEntityTypeToAdd.charAt(0).toUpperCase() + linkEntityTypeToAdd.slice(1) : 'Entity'}...</option>
                      {availableEntitiesForNewLink.map(entity => (
                        <option key={entity.id} value={entity.id}>{entity.name || entity.title}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="button" onClick={handleAddLink} disabled={!linkEntityTypeToAdd || !linkEntityIdToAdd} className="h-9 bg-amber-700 hover:bg-amber-600 text-amber-100">Add Link</Button>
                </div>
                {currentLinks.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-amber-800/20 dark:border-amber-700/30 bg-amber-50/20 dark:bg-stone-700/10 p-4 rounded-lg shadow-inner">
                    <h4 className="text-md font-semibold text-amber-800 dark:text-amber-300 mb-3">Currently Linked:</h4>
                    <div className="space-y-2">
                      {currentLinks.map((link, index) => (
                        <div key={`${link.linked_entity_type}-${link.linked_entity_id}-${index}`} className="flex items-center justify-between p-2.5 border border-amber-800/10 dark:border-amber-700/30 rounded-md bg-amber-50/40 dark:bg-stone-700/30 shadow-sm">
                          <span className="text-sm text-amber-900 dark:text-amber-200">{link.display_name || `(${link.linked_entity_type} ID: ${link.linked_entity_id})`}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveLink(index)} className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 px-1 py-0 h-auto">Remove</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* START: Next Location Selection for Locations */}
            {(() => { // IIFE for logging
              return config.api === '/api/locations' && allLocations;
            })() && (
              <div className="space-y-2 border-t border-amber-800/20 dark:border-amber-600/30 pt-4 mt-4">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Link Next Locations in Sequence</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 p-1 rounded-md border border-amber-800/20 dark:border-amber-600/30">
                  {(allLocations || [])
                    .filter(loc => String(loc.id) !== String(entity?.id)) 
                    .map((loc) => {
                      const locIdStr = String(loc.id);
                      return (
                        <div key={locIdStr} className="flex items-center space-x-2 p-2 rounded hover:bg-amber-50 dark:hover:bg-stone-700/50">
                          <Checkbox
                            id={`next-loc-${locIdStr}`}
                            checked={selectedNextLocationIds.includes(locIdStr)}
                            onCheckedChange={(checked) => {
                              setSelectedNextLocationIds(prev => {
                                if (checked) {
                                  return prev.includes(locIdStr) ? prev : [...prev, locIdStr];
                                } else {
                                  return prev.filter(id => id !== locIdStr);
                                }
                              });
                            }}
                            className="border-amber-700 data-[state=checked]:bg-amber-700 data-[state=checked]:text-amber-100"
                          />
                          <Label htmlFor={`next-loc-${locIdStr}`} className="text-sm font-normal text-amber-800 dark:text-amber-300 cursor-pointer">
                            {loc.name}
                          </Label>
                        </div>
                      );
                  })}
                  {(allLocations || []).filter(loc => String(loc.id) !== String(entity?.id)).length === 0 && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 px-2 py-2">No other locations available to link.</p>
                  )}
                </div>
              </div>
            )}
            {/* END: Next Location Selection for Locations */}
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