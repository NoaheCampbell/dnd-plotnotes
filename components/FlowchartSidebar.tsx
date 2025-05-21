import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";

interface Entity {
  id: number | string;
  name?: string; // For NPCs, Locations, Items
  title?: string; // For Notes, Encounters, Campaigns
  // Add other common fields if necessary, or handle specific ones in map
}

interface CampaignData {
  npcs?: Entity[];
  locations?: Entity[];
  notes?: Entity[];
  encounters?: Entity[];
  // We might not need items, sessions, etc. for draggable nodes initially
}

interface FlowchartSidebarProps {
  campaignData: CampaignData | null;
  loading?: boolean; // Add loading prop
  // onDragStart will be added later for DnD
}

const FlowchartSidebar: React.FC<FlowchartSidebarProps> = ({ campaignData, loading }) => {
  if (loading) {
    return (
      <div className="w-64 h-full border-r border-amber-800/20 dark:border-stone-700 bg-parchment-light dark:bg-stone-800/50 p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-amber-700 dark:text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!campaignData) {
    return <div className="w-64 h-full border-r border-amber-800/20 dark:border-stone-700 bg-parchment-light dark:bg-stone-800/50 p-4 text-sm text-slate-500 dark:text-slate-400">No campaign data.</div>;
  }

  const entityTypes: Array<{ key: keyof CampaignData; label: string; nodeType: string }> = [
    { key: 'npcs', label: 'NPCs', nodeType: 'npcNode' },
    { key: 'locations', label: 'Locations', nodeType: 'locationNode' },
    { key: 'notes', label: 'Notes', nodeType: 'noteNode' },
    { key: 'encounters', label: 'Encounters', nodeType: 'encounterNode' },
  ];

  const onDragStart = (event: React.DragEvent<HTMLLIElement>, entityType: string, entity: Entity) => {
    const dragData = {
      type: entityType, // This will be like 'npcNode', 'locationNode' etc.
      id: entity.id,
      name: entity.name || entity.title || `Unnamed ${entityType.replace('Node','')}`,
      // We can add more specific data if needed later, e.g. default size
    };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-full border-r border-amber-800/20 dark:border-stone-700 bg-parchment-light dark:bg-stone-800/50 p-2 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-amber-900 dark:text-amber-200 px-2">Campaign Entities</h3>
      <Accordion type="multiple" className="w-full">
        {entityTypes.map(entityType => {
          const entities = campaignData[entityType.key];
          if (!entities || entities.length === 0) {
            return null; // Don't render section if no entities of this type
          }
          return (
            <AccordionItem value={entityType.key} key={entityType.key} className="border-b-0 mb-1">
              <AccordionTrigger className="px-2 py-2 text-sm font-medium hover:no-underline hover:bg-amber-100/50 dark:hover:bg-stone-700/50 rounded-md text-amber-800 dark:text-amber-300">
                {entityType.label} ({entities.length})
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-0">
                <ul className="space-y-1 pl-2 pr-1 py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-400 dark:scrollbar-thumb-stone-600 scrollbar-track-transparent">
                  {entities.map(entity => (
                    <li 
                      key={`${entityType.key}-${entity.id}`}
                      className="p-1.5 text-xs rounded-md hover:bg-amber-200/50 dark:hover:bg-stone-600/50 cursor-grab text-amber-700 dark:text-amber-400"
                      draggable
                      onDragStart={(event) => onDragStart(event, entityType.nodeType, entity)}
                    >
                      {entity.name || entity.title || `Unnamed ${entityType.label.slice(0,-1)}`}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default FlowchartSidebar; 