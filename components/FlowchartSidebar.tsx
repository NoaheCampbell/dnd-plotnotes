import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Users, MapPin, FileText, Swords, GripVertical } from "lucide-react";
import { Resizable } from "re-resizable";

// Icon SVG path data
const ICON_PATHS = {
  npcNode: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
  locationNode: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>`,
  noteNode: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`,
  encounterNode: `<path d="M14.5 17.5c-2.4-2.4-2.4-6.3 0-8.7l1-1c2.4-2.4 6.3-2.4 8.7 0c.6.6 1 1.3 1.3 2.1c-.7.3-1.4.8-2.1 1.3l-1.6 1.6A5.04 5.04 0 0 1 16 13c0 2.8 2.2 5 5 5c.7 0 1.3-.1 1.9-.4l1.6 1.6c.5.5 1 .9 1.6 1.3c-.8.3-1.5.7-2.1 1.3c-2.4 2.4-6.3 2.4-8.7 0l-1-1Z"></path><path d="m22 2-2.5 2.5"></path><path d="m11.5 2.5-1 1c-2.4 2.4-2.4 6.3 0 8.7L12 13.7c.6.6 1.3 1 2.1 1.3c-.7.3-1.4.8-2.1 1.3l-1.6 1.6a5.04 5.04 0 0 1-4.4-1.5C2.2 12.2 2 6.5 2 6.5s4.3-.2 8.2 3.7c.2.2.3.3.5.5l1.3-1.3c2.4-2.4 6.3-2.4 8.7 0Z"></path>`
};

// const DRAG_PREVIEW_ID = 'custom-drag-preview'; // No longer primary method

interface Entity {
  id: number | string;
  name?: string;
  title?: string;
}

interface CampaignData {
  npcs?: Entity[];
  locations?: Entity[];
  notes?: Entity[];
  encounters?: Entity[];
}

interface FlowchartSidebarProps {
  campaignData: CampaignData | null;
  loading?: boolean;
}

const FlowchartSidebar: React.FC<FlowchartSidebarProps> = ({ campaignData, loading }) => {
  const [width, setWidth] = React.useState<number | string>(280);
  const dragPreviewRef = React.useRef<HTMLDivElement>(null); // UNCOMMENTED

  if (loading) {
    return (
      <div style={{ width: typeof width === 'number' ? `${width}px` : width }} className="h-full border-r border-amber-800/20 dark:border-stone-700 bg-parchment-light dark:bg-stone-800/50 p-4 flex items-center justify-center flex-shrink-0">
        <Loader2 className="h-6 w-6 text-amber-700 dark:text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div style={{ width: typeof width === 'number' ? `${width}px` : width }} className="h-full border-r border-amber-800/20 dark:border-stone-700 bg-parchment-light dark:bg-stone-800/50 p-4 text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
        No campaign data available to display in the sidebar.
      </div>
    );
  }

  const entityTypes: Array<{ key: keyof CampaignData; label: string; nodeType: string; icon: React.ElementType }> = [
    { key: 'npcs', label: 'NPCs', nodeType: 'npcNode', icon: Users },
    { key: 'locations', label: 'Locations', nodeType: 'locationNode', icon: MapPin },
    { key: 'notes', label: 'Notes', nodeType: 'noteNode', icon: FileText },
    { key: 'encounters', label: 'Encounters', nodeType: 'encounterNode', icon: Swords },
  ];

  const onDragStart = (event: React.DragEvent<HTMLLIElement>, entityType: string, entity: Entity) => {
    const entityDisplayName = entity.name || entity.title || `Unnamed ${entityType.replace('Node','')}`;
    const dragData = {
      type: entityType,
      id: entity.id,
      name: entityDisplayName,
    };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'move';

    const nodeTypeText = entityType.replace('Node', '');
    
    const escapeSVGText = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const svgTextContent = escapeSVGText(`${nodeTypeText}: ${entityDisplayName.substring(0, 20)}${entityDisplayName.length > 20 ? '...' : ''}`);
    const approxTextWidth = svgTextContent.length * 7 + 20;
    const imageWidth = Math.max(120, approxTextWidth);
    const imageHeight = 40;

    // Get the icon path for this entity type
    const iconPath = ICON_PATHS[entityType as keyof typeof ICON_PATHS] || '';

    // Define shapes for each node type
    const shapes = {
      npcNode: `<circle cx="20" cy="20" r="20" fill="#7dd3fc" stroke="#0369a1" stroke-width="1" />`,
      locationNode: `<polygon points="20,0 40,20 20,40 0,20" fill="#4ade80" stroke="#15803d" stroke-width="1" />`,
      noteNode: `<rect x="0" y="0" width="40" height="40" fill="#fde68a" stroke="#d97706" stroke-width="1" />`,
      encounterNode: `<polygon points="20,0 40,10 40,30 20,40 0,30 0,10" fill="#fca5a5" stroke="#ef4444" stroke-width="1" />`
    };

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}">
        ${shapes[entityType as keyof typeof shapes]}
        <g transform="translate(10, ${imageHeight/2}) scale(0.8)">
          ${iconPath}
        </g>
        <text x="35" y="${imageHeight / 2}" font-family="sans-serif" font-size="12" fill="black" dominant-baseline="middle">
          ${svgTextContent}
        </text>
      </svg>
    `;

    if (dragPreviewRef.current) {
      dragPreviewRef.current.innerHTML = svg;
      
      try {
        event.dataTransfer.setDragImage(dragPreviewRef.current, 10, 10);
      } catch (e) {
        console.error("[FlowchartSidebar] Error setting drag image (div method):", e);
      }
    } else {
      console.warn("[FlowchartSidebar] dragPreviewRef.current is null. Cannot set drag image.");
    }
  };

  return (
    <>
      <Resizable
        defaultSize={{
          width: width,
          height: '100%',
        }}
        minWidth={200}
        maxWidth={600}
        enable={{ right: true }}
        className="h-full border-r border-amber-800/20 dark:border-stone-700 bg-parchment-light dark:bg-stone-800/50 flex-shrink-0"
        handleClasses={{
          right: 'fixed top-0 right-0 h-full w-2 cursor-col-resize bg-stone-400/30 dark:bg-stone-600/30 hover:bg-stone-500/50 dark:hover:bg-stone-500/50 z-10'
        }}
        onResizeStop={(e, direction, ref, d) => {
          setWidth(ref.style.width);
        }}
      >
        <div className="h-full p-2 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3 text-amber-900 dark:text-amber-200 px-2">Campaign Entities</h3>
          <Accordion type="multiple" className="w-full">
            {entityTypes.map(entityTypeItem => {
              const entities = campaignData[entityTypeItem.key];
              if (!entities || entities.length === 0) {
                return null;
              }
              return (
                <AccordionItem value={entityTypeItem.key} key={entityTypeItem.key} className="border-b-0 mb-1">
                  <AccordionTrigger className="px-2 py-2 text-sm font-medium hover:no-underline hover:bg-amber-100/50 dark:hover:bg-stone-700/50 rounded-md text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <entityTypeItem.icon className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                    <span>{entityTypeItem.label} ({entities.length})</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <ul className="space-y-1 pl-2 pr-1 py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-400 dark:scrollbar-thumb-stone-600 scrollbar-track-transparent">
                      {entities.map(entity => (
                        <li
                          key={`${entityTypeItem.key}-${entity.id}`}
                          className="p-1.5 text-xs rounded-md hover:bg-amber-200/50 dark:hover:bg-stone-600/50 cursor-grab text-amber-700 dark:text-amber-400 flex items-center gap-1.5"
                          draggable
                          onDragStart={(event) => onDragStart(event, entityTypeItem.nodeType, entity)}
                        >
                          <GripVertical className="h-4 w-4 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                          <span className="flex-grow">{entity.name || entity.title || `Unnamed ${entityTypeItem.label.slice(0,-1)}`}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </Resizable>
      <div
        ref={dragPreviewRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          zIndex: 1000, 
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

export default FlowchartSidebar; 