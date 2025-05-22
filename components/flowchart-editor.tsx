'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type Viewport,
  type NodeProps,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfigurableNode from './custom-nodes/ConfigurableNode';
import {
  npcNodeConfig,
  locationNodeConfig,
  noteNodeConfig,
  encounterNodeConfig,
  ConfigurableNodeData
} from './custom-nodes/node-configs';
import '@reactflow/node-resizer/dist/style.css';
import { toast } from 'sonner';
import { locations as Location } from '@prisma/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import FlowchartSidebar from './FlowchartSidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface FlowchartEditorProps {
  flowchartId?: string;
  campaignId?: number;
  initialName?: string;
  onSaveSuccess?: (savedFlowchart: any) => void;
  onFlowchartLoaded?: (loadedFlowchartData: any) => void;
  syncTrigger?: number;
}

let id = 0;
const getNewNodeId = () => `dndnode_${id++}`;

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Start Node' }, position: { x: 250, y: 5 } },
];

const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ flowchartId, campaignId, initialName, onSaveSuccess, onFlowchartLoaded, syncTrigger }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowchartName, setFlowchartName] = useState(initialName || 'New Flowchart');
  const rfInstance = useRef<any>(null);
  const [currentFlowchartId, setCurrentFlowchartId] = useState<string | undefined>(flowchartId);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentNodeLabel, setCurrentNodeLabel] = useState<string>("");
  const [lastPaneClickFlowPosition, setLastPaneClickFlowPosition] = useState<{x: number, y: number} | null>(null);
  const [flowchartViewKey, setFlowchartViewKey] = useState<number>(1);
  const blockLoadAfterSyncRef = useRef<boolean>(false);

  // State for save status indication
  type SaveState = 'idle' | 'saving' | 'success' | 'error';
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  // State for sidebar data
  const [sidebarData, setSidebarData] = useState<any>(null); // Using any for now, can be refined
  const [sidebarLoading, setSidebarLoading] = useState<boolean>(false); // For sidebar loading state
  const reactFlowWrapper = useRef<HTMLDivElement>(null); // Ref for the ReactFlow wrapper

  const [loadedCampaignId, setLoadedCampaignId] = useState<number | null>(null);

  const [playMode, setPlayMode] = useState(false);
  const [currentPlayNode, setCurrentPlayNode] = useState<Node | null>(null);

  const nodeDefaultSizes = useMemo(() => ({ 
    locationNode: { width: 120, height: 120 },
    npcNode: { width: 80, height: 80 },
    encounterNode: { width: 130, height: 120 },
    noteNode: { width: 150, height: 100 },
    default: { width: 150, height: 40 }
  }), []);

  const nodeTypes = useMemo(() => ({
    npcNode: (props: NodeProps<ConfigurableNodeData>) => <ConfigurableNode {...props} config={npcNodeConfig} />,
    locationNode: (props: NodeProps<ConfigurableNodeData>) => <ConfigurableNode {...props} config={locationNodeConfig} />,
    noteNode: (props: NodeProps<ConfigurableNodeData>) => <ConfigurableNode {...props} config={noteNodeConfig} />,
    encounterNode: (props: NodeProps<ConfigurableNodeData>) => <ConfigurableNode {...props} config={encounterNodeConfig} />,
  }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const isValidConnection = useCallback((connection: Connection) => {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);
    
    if (!sourceNode || !targetNode) {
      console.warn("isValidConnection: source or target node not found for the connection attempt.");
      return false;
    }

    const sourceType = sourceNode.type;
    const targetType = targetNode.type;
    const sourceHandle = connection.sourceHandle;
    const targetHandle = connection.targetHandle;

    // --- General Rule for Vertical "Segway" Connections (Bottom to Top) ---
    if (sourceHandle === 'bottom' && targetHandle === 'top') {
      return true;
    }

    // --- Rules for Horizontal/Side "Association" Connections ---
    // Rule 2: Location to Location (Horizontal)
    if (sourceType === 'locationNode' && targetType === 'locationNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // Rule 3: NPC to Location (Side connection)
    if (sourceType === 'npcNode' && targetType === 'locationNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // Rule 4: Note to Location (Side connection)
    if (sourceType === 'noteNode' && targetType === 'locationNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // Rule 5: Encounter to Location (Side connection)
    if (sourceType === 'encounterNode' && targetType === 'locationNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // --- Add new rules for Location -> Other Nodes (Side connections) ---
    // Rule 6: Location to NPC (Side connection)
    if (sourceType === 'locationNode' && targetType === 'npcNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // Rule 7: Location to Note (Side connection)
    if (sourceType === 'locationNode' && targetType === 'noteNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // Rule 8: Location to Encounter (Side connection)
    if (sourceType === 'locationNode' && targetType === 'encounterNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // --- Add new rules for Note <-> NPC --- 
    // Rule 9: Note to NPC (Side connection)
    if (sourceType === 'noteNode' && targetType === 'npcNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }
    // Rule 10: NPC to Note (Side connection)
    if (sourceType === 'npcNode' && targetType === 'noteNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // --- Add new rules for Encounter <-> NPC ---
    // Rule 11: Encounter to NPC (Side connection)
    if (sourceType === 'encounterNode' && targetType === 'npcNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }
    // Rule 12: NPC to Encounter (Side connection)
    if (sourceType === 'npcNode' && targetType === 'encounterNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    // --- Add new rules for NPC <-> NPC ---
    // Rule 13: NPC to NPC (Horizontal right-to-left)
    if (sourceType === 'npcNode' && targetType === 'npcNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }
    // Rule 14: NPC to NPC (Vertical bottom-to-top) - Covered by general segway rule
    // if (sourceType === 'npcNode' && targetType === 'npcNode' && sourceHandle === 'bottom' && targetHandle === 'top') {
    //    ("Allowing: NPC (bottom) -> NPC (top)");
    //   return true;
    // }

    // --- Add new rules for Encounter <-> Note ---
    // Rule 15: Encounter to Note (Side connection)
    if (sourceType === 'encounterNode' && targetType === 'noteNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }
    // Rule 16: Note to Encounter (Side connection)
    if (sourceType === 'noteNode' && targetType === 'encounterNode' && sourceHandle === 'right' && targetHandle === 'left') {
      return true;
    }

    toast.error(`Invalid connection: ${sourceType} (${sourceHandle || 'any'}) cannot connect to ${targetType} (${targetHandle || 'any'}) using these handles.`);
    return false;
  }, [nodes]);

  const syncFlowchartWithCampaignData = useCallback(async () => {
    if (!campaignId) {
      toast.error("No campaign selected to sync from.");
      return;
    }

    toast.info("Syncing flowchart with campaign data...");

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/sync-flowchart-data`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch campaign data: ${response.statusText}`);
      }
      const apiData = await response.json();

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const allCreatedNodesMap = new Map<string, Node>();
      let globalZIndexCounter = 1;
      const yOffset = 50; // Initial top margin for the Start Node
      const globalNodeSpacingY = 150;
      const linkedNodeSpacingY = 50;
      const HORIZONTAL_SPACING = 150;
      const nodeDefaultSize = nodeDefaultSizes.default; // Common default size
      
      const UNLINKED_X = 50;
      // Calculate X positions based on default node width to maintain consistency
      const SOURCES_X = UNLINKED_X + (nodeDefaultSize.width + HORIZONTAL_SPACING); 
      const TARGETS_X = SOURCES_X + (nodeDefaultSize.width + HORIZONTAL_SPACING);

      // Initialize yTrackers - these will be updated after Start Node is positioned
      const yTrackers = {
        unlinked: yOffset, 
        sources: yOffset,
        targets: yOffset,
        notesGeneral: yOffset,
      };
      
      const createAndRegisterNode = (nodeId: string, type: string, position: {x: number, y: number}, data: any, style: any) => {
        const node: Node = {
          id: nodeId,
          type,
          position,
          data,
          style,
          zIndex: globalZIndexCounter++,
        };
        newNodes.push(node);
        allCreatedNodesMap.set(nodeId, node);
        return node;
      };

      // --- Start Node Handling ---
      let startNode: Node | undefined;
      // Try to find an existing start node from the API data first
      const existingStartNodeFromApi = apiData.nodes?.find((n: Node) => n.type === 'input');
      const startNodeSizeDetails = nodeDefaultSizes.default; // Start node uses default size

      if (existingStartNodeFromApi) {
          // If found, use its properties but ensure it's registered in our new list
          // ALWAYS place the Start Node at the fixed TARGETS_X, yOffset position
          startNode = createAndRegisterNode(
              existingStartNodeFromApi.id || `start-node-api-${Date.now()}`, // Ensure ID
              'input',
              { x: TARGETS_X, y: yOffset }, // Always use fixed position in the target column
              existingStartNodeFromApi.data || { label: 'Start Node' },
              existingStartNodeFromApi.style || { width: startNodeSizeDetails.width, height: startNodeSizeDetails.height }
          );
      } else {
          // Create a new start node if not found in API data
          startNode = createAndRegisterNode(
              `start-node-sync-${Date.now()}`, // Unique ID for newly created start node
              'input',
              { x: TARGETS_X, y: yOffset }, // Standard position for new start node in the target column
              { label: 'Start Node' },
              { width: startNodeSizeDetails.width, height: startNodeSizeDetails.height }
          );
      }

      if (!startNode) { 
        toast.error("Critical: Start node could not be created/retrieved. Sync aborted.");
        setNodes(initialNodes); // Revert to a safe state
        setEdges([]);
        return;
      }

      // --- Initialize Y Trackers based on the Start Node's actual position and height ---
      const actualStartNodeHeight = (startNode.style?.height as number) || startNodeSizeDetails.height;
      const yBelowStartNode = startNode.position.y + actualStartNodeHeight + globalNodeSpacingY;

      yTrackers.unlinked = yBelowStartNode;
      yTrackers.sources = yBelowStartNode;
      yTrackers.targets = yBelowStartNode; // This will be the Y for the first Location/Target linked to StartNode
      yTrackers.notesGeneral = yBelowStartNode;


      const unlinkedNpcData: any[] = [];
      const unlinkedEncounterData: any[] = [];

      // Map to store next Y position for sources linking to a specific target node ID
      const targetLinkedYTracker = new Map<string, number>();
      const locationNodeMapByName = new Map<string, Node>(); // For finding location nodes by name

      interface LocationNodeInternal extends Location {
        children: number[];
        inDegree: number;
      }

      // 1. Process Locations (as Targets)
      // Topological sort for locations based on next_location_id
      const locations = apiData.locations || [];
      const locationMap = new Map<number, LocationNodeInternal>(locations.map((loc: any) => [loc.id, { ...loc, children: [], inDegree: 0 }]));
      const orderedLocations: LocationNodeInternal[] = [];
      
      locations.forEach((loc: any) => {
        if (loc.next_location_id && locationMap.has(loc.next_location_id)) {
          locationMap.get(loc.id)!.children.push(loc.next_location_id);
          locationMap.get(loc.next_location_id)!.inDegree++;
        }
      });

      const queue = locations.filter((loc: any) => locationMap.get(loc.id)!.inDegree === 0);
      
      while (queue.length > 0) {
        const currentLocId = queue.shift()!.id;
        const currentLocData = locationMap.get(currentLocId)!;
        orderedLocations.push(currentLocData); // Add the full data object

        currentLocData.children.forEach((childId: any) => {
          const childNode = locationMap.get(childId)!;
          childNode.inDegree--;
          if (childNode.inDegree === 0) {
            queue.push(childNode);
          }
        });
      }
      
      // If there are cycles, some nodes might not be added. Add them at the end.
      if (orderedLocations.length < locations.length) {
        locations.forEach((loc: any) => {
          if (!orderedLocations.find(ol => ol.id === loc.id)) {
            orderedLocations.push(locationMap.get(loc.id)!);
          }
        });
      }
      
      let firstTargetColumnNodeProcessed = false; // To link StartNode to the first location

      orderedLocations.forEach((locData: LocationNodeInternal) => {
        const nodeId = `location-${locData.id}`;
        const nodeSize = nodeDefaultSizes.locationNode || nodeDefaultSizes.default;
        let position: { x: number; y: number };
        
        if (!firstTargetColumnNodeProcessed && startNode) {
            // This is the first location node to be placed in the TARGETS_X column.
            // Position it relative to where yTrackers.targets was initialized (yBelowStartNode).
            position = { x: TARGETS_X, y: yTrackers.targets };

            const locationNode = createAndRegisterNode(
              nodeId, 
              'locationNode', 
              position, 
              { label: locData.name || `Location ${locData.id}` }, 
              { width: nodeSize.width, height: nodeSize.height }
            );
            if (locData.name) {
              locationNodeMapByName.set(locData.name, locationNode);
            }

            // Connect Start Node to this first location
            newEdges.push({
                id: `edge-${startNode.id}-to-${locationNode.id}`,
                source: startNode.id,
                target: locationNode.id,
                sourceHandle: 'bottom',
                targetHandle: 'top',
                type: 'straight',
                animated: false,
                style: { stroke: '#FFF', strokeWidth: 2, strokeDasharray: '5 5' }, // Style as per existing seq. loc.
                zIndex: 0,
            });
            
            // Update yTracker for the *next* location in this column
            yTrackers.targets = position.y + nodeSize.height + globalNodeSpacingY;
            firstTargetColumnNodeProcessed = true;
        } else {
            // Subsequent location nodes in the TARGETS_X column
            position = { x: TARGETS_X, y: yTrackers.targets };
            const locationNode = createAndRegisterNode(
              nodeId, 
              'locationNode', 
              position, 
              { label: locData.name || `Location ${locData.id}` }, 
              { width: nodeSize.width, height: nodeSize.height }
            );
            if (locData.name) {
              locationNodeMapByName.set(locData.name, locationNode);
            }
            yTrackers.targets += nodeSize.height + globalNodeSpacingY;
        }
      });

      // Create vertical edges between sequenced locations
      orderedLocations.forEach((locData: LocationNodeInternal) => {
        if (locData.next_location_id) {
          const sourceNodeId = `location-${locData.id}`;
          const targetNodeId = `location-${locData.next_location_id}`;
          if (allCreatedNodesMap.has(sourceNodeId) && allCreatedNodesMap.has(targetNodeId)) {
            newEdges.push({
              id: `edge-loc-seq-${locData.id}-${locData.next_location_id}`,
              source: sourceNodeId,
              target: targetNodeId,
              sourceHandle: 'bottom',
              targetHandle: 'top',
              type: 'straight',
              animated: false,
              style: { stroke: '#FFF', strokeWidth: 2, strokeDasharray: '5 5' }, // Dashed white line
              zIndex: 0, // Ensure it's behind nodes
            });
          }
        }
      });

      // Helper to get node size or default
      const getNodeSize = (type: string) => {
        switch(type) {
          case 'npcNode': return nodeDefaultSizes.npcNode;
          case 'encounterNode': return nodeDefaultSizes.encounterNode;
          case 'noteNode': return nodeDefaultSizes.noteNode;
          case 'locationNode': return nodeDefaultSizes.locationNode;
          default: return nodeDefaultSizes.default;
        }
      };
      
      // 2. Process NPCs (prioritizing linked ones)
      apiData.npcs?.forEach((npcData: any) => {
        const nodeId = `npc-${npcData.id}`;
        const nodeSize = getNodeSize('npcNode');
        let position;
        let targetLocationNode: Node | undefined = undefined;
        // The API provides npcData.locationName (from npc.location_name in DB)
        // This field might contain an ID (as a string/number) or a name string.
        
        if (npcData.locationName !== null && npcData.locationName !== undefined) {
          const locNameStr = String(npcData.locationName);
          // Attempt 1: Treat locationName as an ID string
          targetLocationNode = allCreatedNodesMap.get(`location-${locNameStr}`);

          // Attempt 2: Treat locationName as a Name string if ID lookup failed
          if (!targetLocationNode) {
            const npcLocationNameClean = locNameStr.trim().toLowerCase();
            const entry = Array.from(locationNodeMapByName.entries()).find(([nameInMap]) => nameInMap.trim().toLowerCase() === npcLocationNameClean);
            if (entry) {
              targetLocationNode = entry[1];
            }
          }
        }

        if (targetLocationNode) {
          let actualY;
          if (targetLinkedYTracker.has(targetLocationNode.id)) {
            actualY = targetLinkedYTracker.get(targetLocationNode.id)!;
          } else {
            actualY = Math.max(targetLocationNode.position.y, yTrackers.sources);
          }
          position = { x: SOURCES_X, y: actualY };
          
          targetLinkedYTracker.set(targetLocationNode.id, actualY + nodeSize.height + linkedNodeSpacingY);
          // Log for NPC setting targetLinkedYTracker
          if (targetLocationNode.data.label === 'dsfsdaf') {
            
          }
          yTrackers.sources = Math.max(yTrackers.sources, actualY + nodeSize.height + globalNodeSpacingY);
          
          newEdges.push({
            id: `edge-${nodeId}-${targetLocationNode.id}`,
            source: nodeId,
            target: targetLocationNode.id,
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'straight',
          });
          createAndRegisterNode(
            nodeId,
            'npcNode',
            position,
            { label: npcData.name || `NPC ${npcData.id}`, linkedNoteIds: npcData.linked_note_ids || [] },
            { width: nodeSize.width, height: nodeSize.height }
          );
        } else {
          unlinkedNpcData.push(npcData); // Defer processing
        }
      });

      // 3. Process Encounters
      // First, create all encounter nodes and map them
      // let remappedEncounterIds: { [originalId: string]: string } = {}; // This was unused

      apiData.encounters?.forEach((encData: any) => {
        let currentEncounterNodeId = `encounter-${encData.id}`;

        let xPos = UNLINKED_X;
        let yPos = yTrackers.unlinked;
        // let linkedToTarget = false; // This variable is not used

        // Try to link Encounter to Location
        let locationNodeForEncounter: Node | undefined = undefined;

        
        
        // Primary linking mechanism: Use location_id (foreign key from encounter to location)
        if (encData.location_id) {
          locationNodeForEncounter = allCreatedNodesMap.get(`location-${encData.location_id}`);
        }

        // Fallback linking mechanism: Use location name if ID-based linking failed or location_id was null
        // encData.location from the API is the location's name string.
        if (!locationNodeForEncounter && typeof encData.location === 'string' && encData.location.trim() !== '') {
          const locationNameFromEncounter = encData.location.trim();
          let foundByName = locationNodeMapByName.get(locationNameFromEncounter); // Try direct match first

          if (!foundByName) { // If direct match fails, try case-insensitive comparison
            const lowerCaseLocationName = locationNameFromEncounter.toLowerCase();
            for (const [nameInMap, node] of locationNodeMapByName.entries()) {
              if (nameInMap.trim().toLowerCase() === lowerCaseLocationName) {
                foundByName = node;
                break;
              }
            }
          }
          locationNodeForEncounter = foundByName;
        }
        
        if (locationNodeForEncounter) {
          // Log for Encounter checking targetLinkedYTracker
          const trackerHasKey = targetLinkedYTracker.has(locationNodeForEncounter.id);
          const trackerValue = trackerHasKey ? targetLinkedYTracker.get(locationNodeForEncounter.id) : 'N/A';
          
          xPos = SOURCES_X; // Position as a source to the location
          const targetNodeId = locationNodeForEncounter.id;

          // Determine yPos: if continuing a stack, use stack tracker; otherwise, consider target Y and column Y.
          if (targetLinkedYTracker.has(targetNodeId)) {
            yPos = targetLinkedYTracker.get(targetNodeId)!; // Non-null assertion as .has(targetNodeId) is true
          } else {
            yPos = Math.max(locationNodeForEncounter.position.y, yTrackers.sources);
          }

          // Log final yPos for problematic encounter/location
          if (locationNodeForEncounter.data.label === 'dsfsdaf') {
            
          }

          targetLinkedYTracker.set(targetNodeId, yPos + getNodeSize('encounterNode').height + linkedNodeSpacingY);
          yTrackers.sources = Math.max(yTrackers.sources, yPos + getNodeSize('encounterNode').height + globalNodeSpacingY);

          newEdges.push({
            id: `edge-${currentEncounterNodeId}-to-${targetNodeId}`,
            source: currentEncounterNodeId, // Use potentially modified ID
            target: targetNodeId,
            sourceHandle: 'right', 
            targetHandle: 'left',
            type: 'straight',
            animated: false,
            style: { stroke: '#A1A1AA', strokeWidth: 2 }, // Zinc color for associations
          });
        } else {
          
          // If still not linked, update yTracker for the UNLINKED_X column before placing the node
          yPos = yTrackers.unlinked; // Use current unlinked Y
          yTrackers.unlinked += getNodeSize('encounterNode').height + globalNodeSpacingY; // Increment for next unlinked
        }
        
        const encounterNode = createAndRegisterNode(
          currentEncounterNodeId,
          'encounterNode',
          { x: xPos, y: yPos },
          { 
            label: encData.title || `Encounter ${encData.id}`, 
            linkedNoteIds: encData.linked_note_ids || [] 
          },
          getNodeSize('encounterNode')
        );

        // NEW: Create edges from Encounter to its NPCs
        if (encData.npcs && Array.isArray(encData.npcs)) {
          encData.npcs.forEach((npcRef: { id: number }) => {
            const npcNodeId = `npc-${npcRef.id}`;
            const npcNode = allCreatedNodesMap.get(npcNodeId);

            if (npcNode) {
              const edgeExists = newEdges.some(
                edge => (edge.source === currentEncounterNodeId && edge.target === npcNodeId) ||
                        (edge.source === npcNodeId && edge.target === currentEncounterNodeId)
              );

              if (!edgeExists) {
                 newEdges.push({
                  id: `edge-${currentEncounterNodeId}-to-${npcNodeId}`,
                  source: currentEncounterNodeId, // Use potentially modified ID
                  target: npcNodeId,
                  sourceHandle: 'right',
                  targetHandle: 'left',
                  type: 'straight',
                  animated: false,
                  style: { stroke: '#71717A', strokeWidth: 1.5, strokeDasharray: '5,5' }, // Dashed line for NPC connection
                });
              }
            } else {
              console.warn(`Encounter-NPC Link: NPC node with ID ${npcNodeId} not found for encounter ${currentEncounterNodeId}`);
            }
          });
        }
      });
      
      // 4. Process Notes
      // This section will now create all note nodes first, then create edges based on entity_links.
      const NOTES_X = SOURCES_X - (nodeDefaultSizes.noteNode.width + HORIZONTAL_SPACING); // New column for notes, to the left of sources
      // yTrackers.notes = yOffset; // Remove this, use yTrackers.notesGeneral

      // New tracker for positioning notes in their column based on what they link to.
      // Key: targetNodeId (e.g., "npc-123")
      // Value: next available Y position in NOTES_X for a note linking to this target.
      const notesLinkedToTargetYTracker = new Map<string, number>();

      apiData.notes?.forEach((noteData: any) => {
        const nodeId = `note-${noteData.id}`;
        const nodeSize = getNodeSize('noteNode');
        let position;

        let primaryTargetNode: Node | undefined = undefined;
        if (noteData.entity_links && noteData.entity_links.length > 0) {
          // Use the first link as the primary anchor for positioning
          const firstLink = noteData.entity_links[0];
          const targetEntityType = String(firstLink.linked_entity_type).toLowerCase();
          const singularEntityType = targetEntityType.endsWith('s') && targetEntityType !== 'notes' ? targetEntityType.slice(0, -1) : targetEntityType;
          const targetNodeId = `${singularEntityType}-${firstLink.linked_entity_id}`;
          primaryTargetNode = allCreatedNodesMap.get(targetNodeId);
        }

        if (primaryTargetNode) {
          let desiredInitialY = primaryTargetNode.position.y;
          let actualY;

          if (notesLinkedToTargetYTracker.has(primaryTargetNode.id)) {
            // Already a stack of notes linking to this primaryTargetNode, continue that stack
            actualY = notesLinkedToTargetYTracker.get(primaryTargetNode.id)!;
          } else {
            // First note linking to this primaryTargetNode (or stack).
            // Align with target's Y, but not above the general flow of the notes column.
            actualY = Math.max(desiredInitialY, yTrackers.notesGeneral);
          }
          position = { x: NOTES_X, y: actualY };
          notesLinkedToTargetYTracker.set(primaryTargetNode.id, actualY + nodeSize.height + linkedNodeSpacingY);
          // Ensure yTrackers.notesGeneral advances past any group of notes linked to the same target
          yTrackers.notesGeneral = Math.max(yTrackers.notesGeneral, actualY + nodeSize.height + globalNodeSpacingY);
        } else {
          // Unlinked note or primary target not found
          position = { x: NOTES_X, y: yTrackers.notesGeneral };
          yTrackers.notesGeneral += nodeSize.height + globalNodeSpacingY;
        }
        
        createAndRegisterNode(
          nodeId,
          'noteNode',
          position, // Use the calculated position
          { label: noteData.title || `Note ${noteData.id}`, entity_links: noteData.entity_links || [] },
          { width: nodeSize.width, height: nodeSize.height }
        );

        // If the note has links, create edges (this logic remains the same)
        if (noteData.entity_links && Array.isArray(noteData.entity_links)) {
          noteData.entity_links.forEach((link: { linked_entity_id: number, linked_entity_type: string }) => {
            const targetEntityType = String(link.linked_entity_type).toLowerCase();
            // Adjust for potential pluralization in entity_type string (e.g., "npcs" vs "npc")
            const singularEntityType = targetEntityType.endsWith('s') && targetEntityType !== 'notes' ? targetEntityType.slice(0, -1) : targetEntityType;
            const targetNodeId = `${singularEntityType}-${link.linked_entity_id}`;
            const targetEntityNode = allCreatedNodesMap.get(targetNodeId);

            if (targetEntityNode) {
              newEdges.push({
                id: `edge-${nodeId}-to-${targetNodeId}`,
                source: nodeId,
                target: targetNodeId,
                sourceHandle: 'right', // Assuming NoteNode has a 'right' handle
                targetHandle: 'left',  // Assuming target nodes have a 'left' handle
                type: 'straight',
                animated: false,
                style: { stroke: '#F59E0B', strokeWidth: 1.5 }, // Amber color for note links
              });

              // Potentially adjust note's Y position to be near its first linked target if not already placed optimally.
              // This is a complex layout problem. For now, we keep initial column placement.
              // A more sophisticated approach might involve iterative adjustments or a layout algorithm.

            } else {
              console.warn(`Sync: Note ${nodeId} links to ${targetEntityType} ${link.linked_entity_id}, but target node ${targetNodeId} not found.`);
            }
          });
        } else {
          // If a note has no links, it will be effectively "unlinked"
          // Its position is already set in the NOTES_X column.
          // We could move it to UNLINKED_X if preferred, but a dedicated notes column might be clearer.
        }
      });
      
      // Section 5 (Create edges from Entities ... to their linked Notes) is now largely handled by the above.
      // The old logic relied on `linkedNoteIds` on NPCs/Locations etc. which is deprecated.
      // We can remove or comment out this section.
      /*
      // 5. Create edges from Entities (NPCs, Locations, Encounters) to their linked Notes
      allCreatedNodesMap.forEach(sourceNode => {
        // Check if the sourceNode is one of the types that can have linked notes
        if (sourceNode.type === 'npcNode' || sourceNode.type === 'locationNode' || sourceNode.type === 'encounterNode') {
          if (sourceNode.data && sourceNode.data.linkedNoteIds && Array.isArray(sourceNode.data.linkedNoteIds)) {
            sourceNode.data.linkedNoteIds.forEach((rawNoteId: string | number) => {
              const targetNoteNodeId = `note-${rawNoteId}`;
              const targetNoteNode = allCreatedNodesMap.get(targetNoteNodeId);

              if (targetNoteNode) {
                const edgeExists = newEdges.some(
                  edge => (edge.source === sourceNode.id && edge.target === targetNoteNodeId) ||
                          (edge.source === targetNoteNodeId && edge.target === sourceNode.id)
                );

                if (!edgeExists) {
                  newEdges.push({
                    id: `edge-assoc-${sourceNode.id}-to-${targetNoteNodeId}`,
                    source: sourceNode.id,
                    target: targetNoteNodeId,
                    sourceHandle: 'right',
                    targetHandle: 'left',
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#6B7280', strokeWidth: 1.5, strokeDasharray: '4,4' }, // Gray-600, dashed
                  });
                }
              } 
              // else {
              //   console.warn(`Sync: Entity ${sourceNode.id} lists note ID ${rawNoteId}, but note node ${targetNoteNodeId} not found.`);
              // }
            });
          }
        }
      });
      */

      // Process deferred unlinked NPCs
      unlinkedNpcData.forEach(npcData => {
        const nodeId = `npc-${npcData.id}`;
        const nodeSize = getNodeSize('npcNode');
        const position = { x: UNLINKED_X, y: yTrackers.unlinked };
        yTrackers.unlinked += nodeSize.height + globalNodeSpacingY;
        
        createAndRegisterNode(
          nodeId,
          'npcNode',
          position,
          { label: npcData.name || `NPC ${npcData.id}`, linkedNoteIds: npcData.linked_note_ids || [] },
          { width: nodeSize.width, height: nodeSize.height }
        );
      });

      // Process deferred unlinked Encounters
      unlinkedEncounterData.forEach(encData => {
        const nodeId = `encounter-${encData.id}`; 
        const nodeSize = getNodeSize('encounterNode');
        
        const unlinkedNodePosition = { x: UNLINKED_X, y: yTrackers.unlinked };
        
        yTrackers.unlinked += nodeSize.height + globalNodeSpacingY;
        
        createAndRegisterNode(
          nodeId, 
          'encounterNode',
          unlinkedNodePosition, 
          { 
            label: encData.title || `Encounter ${encData.id}`, 
            linkedNoteIds: encData.linked_note_ids || [] 
          },
          { width: nodeSize.width, height: nodeSize.height }
        );
      });

      // Sort nodes by their Y position then X to improve rendering order for overlapping nodes
      newNodes.sort((a, b) => {
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x; // Secondary sort by X if Y is the same
      });

      // Increment key to force ReactFlow to remount and re-render with new nodes/edges
      setFlowchartViewKey(prevKey => prevKey + 1);
      blockLoadAfterSyncRef.current = true; // Signal that a sync just happened

      // Set nodes and edges directly now
      setNodes(newNodes);
      setEdges(newEdges);
      
      if (rfInstance.current) {
        // fitView might be better after nodes are confirmed to be rendered in their new positions
        setTimeout(() => {
          if (rfInstance.current) { // Re-check rfInstance just in case
            rfInstance.current.fitView({ padding: 0.2, duration: 200 }); 
          }
        }, 50); // Short delay for fitView after nodes are set
      }
      setFlowchartName(`Synced: ${new Date().toLocaleString()}`);
      toast.success("Flowchart synced with campaign data using new layout!");

    } catch (error: any) {
      console.error("Error syncing flowchart:", error);
      toast.error(error.message || "Failed to sync flowchart.");
    }
  }, [campaignId, setNodes, setEdges, rfInstance, setFlowchartName]);

  // useEffect to load data for the sidebar
  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!campaignId) {
        setSidebarData(null); // Clear sidebar if no campaignId
        return;
      }
      setSidebarLoading(true);
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/sync-flowchart-data`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch sidebar data: ${response.statusText}`);
        }
        const apiData = await response.json();
        setSidebarData(apiData);
      } catch (error: any) {
        console.error("Error fetching sidebar data:", error);
        toast.error(error.message || "Failed to load entities for sidebar.");
        setSidebarData(null); // Clear on error
      }
      setSidebarLoading(false);
    };

    fetchSidebarData();
  }, [campaignId]); // Re-fetch when campaignId changes

  useEffect(() => {
    if (syncTrigger && syncTrigger > 0 && campaignId && !flowchartId) { 
      // Only auto-sync via trigger if there's a campaign, a trigger,
      // AND we are not loading a specific existing flowchartId.
      // If flowchartId is present, loadFlowchart takes precedence, and manual sync is available.
      syncFlowchartWithCampaignData();
    }
  }, [syncTrigger, campaignId, flowchartId, syncFlowchartWithCampaignData]); // Added flowchartId and syncFlowchartWithCampaignData to deps

  const addNpcNode = useCallback(() => {
    const newNodeId = getNewNodeId();
    let newNodePosition: { x: number, y: number };

    if (lastPaneClickFlowPosition) {
      newNodePosition = { ...lastPaneClickFlowPosition }; 
      setLastPaneClickFlowPosition(null); // Clear after use
    } else if (rfInstance.current) {
      // Fallback: Place 100px/100px (screen pixels) from viewport top-left
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.current.project(screenFallbackOffset);
    } else {
      // Absolute fallback if rfInstance is not available
      newNodePosition = { x: Math.random() * 200, y: Math.random() * 100 };
    }

    // Add a small random offset to prevent perfect stacking
    newNodePosition.x += (Math.random() - 0.5) * 10; 
    newNodePosition.y += (Math.random() - 0.5) * 10;

    const newNode: Node = {
      id: newNodeId,
      type: 'npcNode',
      position: newNodePosition,
      data: { label: `NPC ${id-1}` },
      style: { width: 80, height: 80 }, // Default initial size for NPCNode (square for circle)
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, rfInstance, lastPaneClickFlowPosition, setLastPaneClickFlowPosition]);

  const addLocationNode = useCallback(() => {
    const newNodeId = getNewNodeId();
    let newNodePosition: { x: number, y: number };

    if (lastPaneClickFlowPosition) {
      newNodePosition = { ...lastPaneClickFlowPosition }; 
      setLastPaneClickFlowPosition(null); 
    } else if (rfInstance.current) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.current.project(screenFallbackOffset);
    } else {
      newNodePosition = { x: Math.random() * 200, y: Math.random() * 100 };
    }

    newNodePosition.x += (Math.random() - 0.5) * 10; 
    newNodePosition.y += (Math.random() - 0.5) * 10;

    const newNode: Node = {
      id: newNodeId,
      type: 'locationNode',
      position: newNodePosition,
      data: { label: `Location ${id-1}` },
      style: { width: 120, height: 120 }, 
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, rfInstance, lastPaneClickFlowPosition, setLastPaneClickFlowPosition]);

  const addNoteNode = useCallback(() => {
    const newNodeId = getNewNodeId();
    let newNodePosition: { x: number, y: number };

    if (lastPaneClickFlowPosition) {
      newNodePosition = { ...lastPaneClickFlowPosition }; 
      setLastPaneClickFlowPosition(null); 
    } else if (rfInstance.current) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.current.project(screenFallbackOffset);
    } else {
      newNodePosition = { x: Math.random() * 200, y: Math.random() * 100 };
    }

    newNodePosition.x += (Math.random() - 0.5) * 10; 
    newNodePosition.y += (Math.random() - 0.5) * 10;

    const newNode: Node = {
      id: newNodeId,
      type: 'noteNode',
      position: newNodePosition,
      data: { label: `Note ${id-1}` },
      style: { width: 150, height: 100 }, 
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, rfInstance, lastPaneClickFlowPosition, setLastPaneClickFlowPosition]);

  const addEncounterNode = useCallback(() => {
    const newNodeId = getNewNodeId();
    let newNodePosition: { x: number, y: number };

    if (lastPaneClickFlowPosition) {
      newNodePosition = { ...lastPaneClickFlowPosition }; 
      setLastPaneClickFlowPosition(null); 
    } else if (rfInstance.current) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.current.project(screenFallbackOffset);
    } else {
      newNodePosition = { x: Math.random() * 200, y: Math.random() * 100 };
    }

    newNodePosition.x += (Math.random() - 0.5) * 10; 
    newNodePosition.y += (Math.random() - 0.5) * 10;

    const newNode: Node = {
      id: newNodeId,
      type: 'encounterNode',
      position: newNodePosition,
      data: { label: `Encounter ${id-1}` },
      style: { width: 130, height: 120 }, 
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, rfInstance, lastPaneClickFlowPosition, setLastPaneClickFlowPosition]);

  useEffect(() => {
    if (selectedNode) {
      setCurrentNodeLabel(selectedNode.data.label || '');
    } else {
      setCurrentNodeLabel('');
    }
  }, [selectedNode]);

  const handleNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNodeLabel(e.target.value);
  };

  const applyNodeLabelUpdate = () => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return { ...node, data: { ...node.data, label: currentNodeLabel } };
          }
          return node;
        })
      );
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    setSelectedNode(null);
    if (rfInstance.current && event.target === event.currentTarget) { // Ensure the click is on the pane itself
      const pane = event.currentTarget.getBoundingClientRect();
      const projectedPosition = rfInstance.current.project({
        x: event.clientX - pane.left,
        y: event.clientY - pane.top,
      });
      setLastPaneClickFlowPosition(projectedPosition);
    } else {
      // Click was on a node or control, not the pane directly, or rfInstance not ready
      // Optionally clear the last click position or leave it as is depending on desired UX
      // For now, let's clear it if the click wasn't on the pane to avoid unintended placement
      if (event.target !== event.currentTarget) {
         setLastPaneClickFlowPosition(null);
      }
    }
  }, [rfInstance, setSelectedNode, setLastPaneClickFlowPosition]);

  const loadFlowchart = useCallback(async (idToLoad: string) => {
    if (!idToLoad) return; // Should not happen if called correctly
    setSaveState('idle');
    try {
      const response = await fetch(`/api/flowcharts/${idToLoad}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load flowchart: ${response.statusText}`);
      }
      const flowchart = await response.json();
      if (flowchart && flowchart.data) {
        const { nodes: loadedNodes, edges: loadedEdges, viewport } = flowchart.data;
        setNodes(loadedNodes || initialNodes); // Fallback to initialNodes if loadedNodes is null/undefined
        setEdges(loadedEdges || []);
        if (rfInstance.current && viewport) {
          rfInstance.current.setViewport(viewport);
        }
        setFlowchartName(flowchart.name || (initialName || 'New Flowchart'));
        setCurrentFlowchartId(flowchart.id); // Ensure currentFlowchartId is the loaded one
        setLoadedCampaignId(flowchart.campaignId || null);
        if (onFlowchartLoaded) {
          onFlowchartLoaded(flowchart);
        }
      } else {
        // Case: Flowchart exists in DB (has idToLoad) but has no data or data is empty/invalid
        // This could be an old flowchart or one saved in a bad state.
        // Initialize with default nodes/edges but keep the existing ID and name if available.
        toast("Flowchart data missing or invalid, starting with a default layout.");
        setNodes(initialNodes);
        setEdges([]);
        setFlowchartName( (flowchart && flowchart.name) || initialName || 'New Flowchart');
        // currentFlowchartId is already idToLoad
        setLoadedCampaignId( (flowchart && flowchart.campaignId) || campaignId || null);
        if (onFlowchartLoaded) {
          onFlowchartLoaded({ 
            id: idToLoad,
            name: (flowchart && flowchart.name) || initialName || 'New Flowchart',
            campaignId: (flowchart && flowchart.campaignId) || campaignId,
            nodes: initialNodes, 
            edges: [] 
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading flowchart:', error);
      toast.error(error.message || 'Error loading flowchart. See console for details.');
      setNodes(initialNodes);
      setEdges([]);
      setFlowchartName(initialName || 'New Flowchart (load error)');
      setLoadedCampaignId(null);
    }
  }, [flowchartId, initialName, campaignId, setNodes, setEdges, setFlowchartName, onFlowchartLoaded]);

  // Effect for loading flowchart data or setting up a new one
  useEffect(() => {
    if (!currentFlowchartId) {
      // NEW FLOWCHART LOGIC
      setNodes(initialNodes);
      setEdges([]);
      setFlowchartName(initialName || 'New Flowchart');
      setCurrentFlowchartId(undefined); // Explicitly ensure it's undefined
      setLoadedCampaignId(campaignId || null); 
      if (onFlowchartLoaded) {
        onFlowchartLoaded({ 
          name: initialName || 'New Flowchart', 
          campaignId: campaignId, 
          nodes: initialNodes, 
          edges: [] 
        });
      }
      // Important: Early return for new flowchart setup
      return; 
    }

    // EXISTING FLOWCHART LOGIC (currentFlowchartId is present)
    if (!blockLoadAfterSyncRef.current) {
      loadFlowchart(currentFlowchartId);
    } else {
      // Reset the flag if a load was blocked by sync
      blockLoadAfterSyncRef.current = false;
    }
  }, [currentFlowchartId, initialName, campaignId, flowchartId, loadFlowchart, onFlowchartLoaded, setNodes, setEdges, setFlowchartName, setCurrentFlowchartId, setLoadedCampaignId]);

  const saveFlowchart = async () => {
    const currentCampaignId = flowchartId ? loadedCampaignId : campaignId;

    if (!currentCampaignId && !currentFlowchartId) {
      toast.error('Cannot save: No campaign context or existing flowchart ID.');
      setSaveState('error');
      setSaveMessage('Cannot save: No campaign context or existing flowchart ID.');
      return;
    }

    setSaveState('saving');
    setSaveMessage('');

    const viewport = rfInstance.current?.getViewport();
    const flowchartData = {
      nodes,
      edges,
      viewport,
    };

    try {
      let response;
      if (currentFlowchartId) {
        response = await fetch(`/api/flowcharts/${currentFlowchartId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: flowchartName, data: flowchartData, campaignId: currentCampaignId }),
        });
      } else if (currentCampaignId) {
        response = await fetch(`/api/campaigns/${currentCampaignId}/flowcharts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: flowchartName, data: flowchartData }),
        });
      }

      if (!response || !response.ok) {
        const errorData = response ? await response.json().catch(() => ({})) : { error: 'Unknown error' };
        throw new Error(errorData.error || `Failed to save flowchart: ${response?.statusText}`);
      }

      const savedFlowchart = await response.json();
      setCurrentFlowchartId(savedFlowchart.id);
      if (!flowchartId && savedFlowchart.campaignId) {
        setLoadedCampaignId(savedFlowchart.campaignId);
      }
      toast.success('Flowchart saved successfully!');
      setSaveState('success');
      setSaveMessage('Saved successfully!');
      
      if (onSaveSuccess) {
        onSaveSuccess(savedFlowchart);
      }

    } catch (error: any) {
      console.error('Error saving flowchart:', error);
      toast.error(error.message || 'Error saving flowchart. See console for details.');
      setSaveState('error');
      setSaveMessage(error.message || 'Error saving flowchart. See console for details.');
    }
  };

  // Effect to reset save state after a short delay for success/error messages
  useEffect(() => {
    if (saveState === 'success' || saveState === 'error') {
      const timer = setTimeout(() => {
        setSaveState('idle');
        setSaveMessage('');
      }, 3000); // Display message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!rfInstance.current || !reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataString = event.dataTransfer.getData('application/reactflow');
      
      if (!dataString) {
        console.warn("onDrop: No data found in dataTransfer object.");
        return;
      }

      let draggedData;
      try {
        draggedData = JSON.parse(dataString);
      } catch (e) {
        console.error("onDrop: Failed to parse dragged data", e);
        return;
      }

      const { type: nodeType, name: nodeName, id: entityId } = draggedData;

      if (!nodeType) {
        console.warn("onDrop: Dragged data is missing 'type'.");
        return;
      }
      
      // Adjust position to be relative to the React Flow pane
      const position = rfInstance.current.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNodeId = `${nodeType}-${entityId}-${getNewNodeId()}`; // Ensure unique ID, incorporate original entity ID

      const defaultSize = nodeDefaultSizes[nodeType as keyof typeof nodeDefaultSizes] || nodeDefaultSizes.default;

      const newNode: Node = {
        id: newNodeId,
        type: nodeType,
        position,
        data: { label: nodeName || `New ${nodeType}` }, // Use dragged name or a default
        style: { width: defaultSize.width, height: defaultSize.height },
        // zIndex can be managed if needed, or let React Flow handle it.
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`Added ${nodeName || nodeType} to flowchart.`);
    },
    [rfInstance, setNodes, nodeDefaultSizes] // Correct: nodeDefaultSizes is in scope and included in deps
  );

  // Effect to update currentFlowchartId if the prop changes (e.g., navigating between editors)
  useEffect(() => {
    setCurrentFlowchartId(flowchartId);
  }, [flowchartId]);

  useEffect(() => {
    if (rfInstance.current && !currentFlowchartId) {
      // For new flowcharts, ensure fitView is called once instance is available
      const timer = setTimeout(() => {
        if (rfInstance.current) {
          rfInstance.current.fitView();
        }
      }, 100); // Small delay to ensure canvas is ready
      return () => clearTimeout(timer);
    }
  }, [rfInstance.current, currentFlowchartId]); // Rerun if instance or ID changes

  // Find the play path (start node + locations in order)
  const getPlayPath = useCallback(() => {
    // Find the start node (type 'input')
    const startNode = nodes.find(n => n.type === 'input');
    if (!startNode) return []; // Return empty array, handlePlay will check length

    // This function's original purpose was to find a linear path.
    // For the new play mode, we only need the actual start node.
    // The original more complex path finding can be simplified or removed if only the start node is needed.
    // For now, just returning the start node in an array to satisfy existing checks.
    return [startNode];
  }, [nodes, edges]);

  // Start play mode
  const handlePlay = () => {
    const startNode = nodes.find(n => n.type === 'input');
    if (startNode) {
      setCurrentPlayNode(startNode);
      setPlayMode(true);
    } else {
      toast.error("No Start Node found to begin play mode.");
    }
  };

  const goToNode = (nodeId: string) => {
    const targetNode = nodes.find(n => n.id === nodeId);
    if (targetNode) {
      setCurrentPlayNode(targetNode);
    } else {
      toast.error(`Node ${nodeId} not found.`);
      setPlayMode(false); // Optionally close play mode if target is invalid
    }
  };

  // Helper to get connected sequential locations for "Go to" buttons
  const getSequentialNextLocations = useCallback(() => {
    if (!currentPlayNode) return [];
    if (currentPlayNode.type !== 'input' && currentPlayNode.type !== 'locationNode') return [];

    return edges
      .filter(edge => edge.source === currentPlayNode.id && edge.sourceHandle === 'bottom')
      .map(edge => nodes.find(n => n.id === edge.target && n.type === 'locationNode' && edge.targetHandle === 'top'))
      .filter(node => !!node) as Node[];
  }, [nodes, edges, currentPlayNode]);

  // Helper to get associated entities for the current location
  const getAssociatedEntities = useCallback(() => {
    if (!currentPlayNode || currentPlayNode.type !== 'locationNode') {
      return { npcs: [], notes: [], encounters: [] };
    }

    const associatedNpcs: Node[] = [];
    const associatedNotes: Node[] = [];
    const associatedEncounters: Node[] = [];

    edges.forEach(edge => {
      let entityNode: Node | undefined = undefined;
      let isAssociated = false;

      // Case 1: Entity links TO current location (e.g., NPC's right handle to Location's left)
      if (edge.target === currentPlayNode.id && (edge.targetHandle === 'left' || !edge.targetHandle)) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode && (sourceNode.type === 'npcNode' || sourceNode.type === 'noteNode' || sourceNode.type === 'encounterNode')) {
          entityNode = sourceNode;
          isAssociated = true;
        }
      }
      // Case 2: Current location links TO entity (e.g., Location's right handle to NPC's left)
      else if (edge.source === currentPlayNode.id && (edge.sourceHandle === 'right' || !edge.sourceHandle)) {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode && (targetNode.type === 'npcNode' || targetNode.type === 'noteNode' || targetNode.type === 'encounterNode')) {
          entityNode = targetNode;
          isAssociated = true;
        }
      }
      
      if (isAssociated && entityNode) {
        if (entityNode.type === 'npcNode' && !associatedNpcs.find(n => n.id === entityNode!.id)) {
          associatedNpcs.push(entityNode);
        } else if (entityNode.type === 'noteNode' && !associatedNotes.find(n => n.id === entityNode!.id)) {
          associatedNotes.push(entityNode);
        } else if (entityNode.type === 'encounterNode' && !associatedEncounters.find(n => n.id === entityNode!.id)) {
          associatedEncounters.push(entityNode);
        }
      }
    });

    return { 
      npcs: associatedNpcs, 
      notes: associatedNotes, 
      encounters: associatedEncounters 
    };
  }, [nodes, edges, currentPlayNode]);

  const sequentialNextLocations = getSequentialNextLocations();
  const associatedEntities = getAssociatedEntities();

  return (
    <div style={{ height: '100%', width: '100%' }} className="bg-background dark:bg-stone-900/50 flex flex-col">
      <div 
        className="p-2 flex flex-wrap items-center gap-2 border-b border-amber-800/20 dark:border-stone-700"
      >
        <Input 
          type="text" 
          value={flowchartName} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFlowchartName(e.target.value);
            setSaveState('idle'); // Reset save state on name change
            setSaveMessage('');
          }}
          placeholder="Flowchart Name"
          className="max-w-xs text-base h-9 bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
        />
        <Button onClick={handlePlay} variant="default" size="sm" className="bg-green-700 text-white hover:bg-green-800">▶ Play</Button>
        <Button onClick={addNpcNode} variant="outline" size="sm" className="text-sky-800 border-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:border-sky-500 dark:hover:bg-stone-700">Add NPC</Button>
        <Button onClick={addLocationNode} variant="outline" size="sm" className="text-green-800 border-green-700 hover:bg-green-100 dark:text-green-300 dark:border-green-500 dark:hover:bg-stone-700">Add Location</Button>
        <Button onClick={addNoteNode} variant="outline" size="sm" className="text-amber-800 border-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-500 dark:hover:bg-stone-700">Add Note</Button>
        <Button onClick={addEncounterNode} variant="outline" size="sm" className="text-red-800 border-red-700 hover:bg-red-100 dark:text-red-300 dark:border-red-500 dark:hover:bg-stone-700">Add Encounter</Button>
        <Button onClick={syncFlowchartWithCampaignData} variant="outline" size="sm" className="text-purple-800 border-purple-700 hover:bg-purple-100 dark:text-purple-300 dark:border-purple-500 dark:hover:bg-stone-700">Sync with Campaign</Button>
        
        <div className="flex items-center gap-2 ml-auto">
          {saveState === 'saving' && (
            <Loader2 className="h-5 w-5 text-amber-700 dark:text-amber-400 animate-spin" />
          )}
          {saveState === 'success' && (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
          )}
          {saveState === 'error' && (
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
          )}
          {saveMessage && (
            <span className={`text-xs ${saveState === 'error' ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
              {saveMessage}
            </span>
          )}
          <Button 
            onClick={saveFlowchart} 
            variant="default" 
            size="sm" 
            className="bg-amber-800 text-amber-100 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
            disabled={saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Saving...' : 'Save Flowchart'}
          </Button>
        </div>
        
        {selectedNode && (
          <div className="flex items-center gap-2 ml-auto border-l border-amber-800/20 dark:border-stone-700 pl-2">
            <label htmlFor="nodeLabelInput" className="text-sm font-medium text-amber-800 dark:text-amber-300">Node Label:</label>
            <Input 
              id="nodeLabelInput"
              type="text"
              value={currentNodeLabel}
              onChange={handleNodeLabelChange}
              onBlur={applyNodeLabelUpdate} // Apply changes when input loses focus
              className="h-9 bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
            />
          </div>
        )}
      </div>
      {/* Main content area with sidebar and flowchart */}
      <div className="flex flex-1 overflow-hidden"> 
        <FlowchartSidebar campaignData={sidebarData} loading={sidebarLoading} />
        <div className="flex-grow h-full" ref={reactFlowWrapper}>
          <ReactFlow
            key={flowchartViewKey}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={(instance) => rfInstance.current = instance}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
      {/* Play Mode Modal */}
      <Dialog open={playMode} onOpenChange={setPlayMode}>
        <DialogContent className="max-w-3xl flex flex-col sm:flex-row min-h-[60vh] dark:bg-stone-800">
          {/* Left Pane: Main Location Info & Navigation */}
          <div className="flex-grow p-4 flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-amber-700 dark:text-amber-400">
                {currentPlayNode?.type === 'input' ? 'Start Your Adventure' : currentPlayNode?.data?.label || 'Current Location'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4 flex-grow text-stone-700 dark:text-stone-300">
              {currentPlayNode?.type === 'input' && (
                <p>Welcome! Choose your first destination.</p>
              )}
              {currentPlayNode?.type === 'locationNode' && (
                <p>You are at <span className="font-semibold">{currentPlayNode.data.label}</span>.</p>
                // Placeholder for future location description
              )}
            </div>

            {sequentialNextLocations.length > 0 && (
              <div className="space-y-2 mt-auto mb-4">
                <p className="text-sm text-stone-600 dark:text-stone-400">Next destinations:</p>
                {sequentialNextLocations.map(locationNode => (
                  <Button 
                    key={locationNode.id} 
                    onClick={() => goToNode(locationNode.id)}
                    variant="outline"
                    className="w-full justify-start border-amber-600 text-amber-700 hover:bg-amber-100 dark:border-amber-500 dark:text-amber-300 dark:hover:bg-amber-700/30"
                  >
                    Go to {locationNode.data.label}
                  </Button>
                ))}
              </div>
            )}
            
            <DialogFooter className="pt-4 border-t border-stone-200 dark:border-stone-700">
              <Button onClick={() => setPlayMode(false)} variant="ghost" className="text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700">End Play Mode</Button>
            </DialogFooter>
          </div>

          {/* Right Pane: Associated Entities (Sidebar) */}
          {currentPlayNode?.type === 'locationNode' && (
            <div className="w-full sm:w-2/5 p-4 border-t sm:border-t-0 sm:border-l border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-3 text-sky-700 dark:text-sky-400">Associated Information</h3>
              
              {associatedEntities.npcs.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-sky-600 dark:text-sky-300 mb-1">NPCs:</h4>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    {associatedEntities.npcs.map(npc => (
                      <li key={npc.id} className="text-sm text-stone-700 dark:text-stone-300">{npc.data.label}</li>
                    ))}
                  </ul>
                </div>
              )}

              {associatedEntities.notes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-orange-600 dark:text-orange-400 mb-1">Notes:</h4>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    {associatedEntities.notes.map(note => (
                      <li key={note.id} className="text-sm text-stone-700 dark:text-stone-300">{note.data.label}</li>
                    ))}
                  </ul>
                </div>
              )}

              {associatedEntities.encounters.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-red-600 dark:text-red-400 mb-1">Encounters:</h4>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    {associatedEntities.encounters.map(encounter => (
                      <li key={encounter.id} className="text-sm text-stone-700 dark:text-stone-300">{encounter.data.label}</li>
                    ))}
                  </ul>
                </div>
              )}

              {associatedEntities.npcs.length === 0 && associatedEntities.notes.length === 0 && associatedEntities.encounters.length === 0 && (
                <p className="text-sm text-stone-500 dark:text-stone-400">No specific NPCs, notes, or encounters are directly linked to this location on the map.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap with ReactFlowProvider for components that use React Flow hooks internally (if any custom nodes/edges did)
// For a top-level editor like this, it is often good practice.
const FlowchartEditorWithProvider: React.FC<FlowchartEditorProps> = (props) => (
  <ReactFlowProvider>
    <FlowchartEditor {...props} />
  </ReactFlowProvider>
);

export default FlowchartEditorWithProvider; 