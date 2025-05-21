'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  Viewport,
  ReactFlowProvider, // Added for encapsulating React Flow context
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NPCNode from './custom-nodes/NPCNode'; // Import NPCNode
import LocationNode from './custom-nodes/LocationNode'; // Import LocationNode
import NoteNode from './custom-nodes/NoteNode'; // Import NoteNode
import EncounterNode from './custom-nodes/EncounterNode'; // Import EncounterNode
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import { toast } from 'sonner'; // Import sonner toast

interface FlowchartEditorProps {
  flowchartId?: string; // For loading an existing flowchart
  campaignId?: number;  // For creating a new flowchart linked to a campaign
  initialName?: string; // Optional initial name for a new flowchart
  onSaveSuccess?: (savedFlowchart: any) => void; // Callback for successful save
  syncTrigger?: number; // To trigger a manual sync from the parent
}

let id = 0;
const getNewNodeId = () => `dndnode_${id++}`;

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Start Node' }, position: { x: 250, y: 5 } },
];

const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ flowchartId, campaignId, initialName, onSaveSuccess, syncTrigger }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowchartName, setFlowchartName] = useState(initialName || 'New Flowchart');
  const [rfInstance, setRfInstance] = useState<any>(null); // To access React Flow instance for saving viewport
  const [currentFlowchartId, setCurrentFlowchartId] = useState<string | undefined>(flowchartId);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentNodeLabel, setCurrentNodeLabel] = useState<string>("");
  const [lastPaneClickFlowPosition, setLastPaneClickFlowPosition] = useState<{x: number, y: number} | null>(null);
  const [flowchartViewKey, setFlowchartViewKey] = useState<number>(1); // Key for forcing ReactFlow remount
  const blockLoadAfterSyncRef = useRef<boolean>(false); // Prevent loadFlowchart after sync using a ref

  // Define node types
  const nodeTypes = useMemo(() => ({
    npcNode: NPCNode, // Register NPCNode
    locationNode: LocationNode, // Register LocationNode
    noteNode: NoteNode, // Register NoteNode
    encounterNode: EncounterNode, // Register EncounterNode
    // We can add more custom node types here later
    // default: DefaultNode, // if you want to customize the default one too
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

      const yOffset = 50;
      const globalNodeSpacingY = 150; // General vertical spacing between nodes in a column
      const linkedNodeSpacingY = 50;  // Tighter vertical spacing for nodes linked to the same target

      const nodeDefaultSizes = {
        locationNode: { width: 120, height: 120 },
        npcNode: { width: 80, height: 80 },
        encounterNode: { width: 130, height: 120 },
        noteNode: { width: 150, height: 100 },
        default: { width: 150, height: 40} // Fallback size
      };
      
      const HORIZONTAL_SPACING = 150; // Horizontal space between columns / linked nodes

      // Define X positions for columns
      const UNLINKED_X = 50;
      const SOURCES_X = UNLINKED_X + (nodeDefaultSizes.default.width + HORIZONTAL_SPACING); 
      const TARGETS_X = SOURCES_X + (nodeDefaultSizes.default.width + HORIZONTAL_SPACING);

      // Trackers for Y positions within columns
      const yTrackers = {
        unlinked: yOffset,
        sources: yOffset, // Added for the SOURCES_X column
        targets: yOffset,
      };

      const unlinkedNpcData: any[] = [];
      const unlinkedEncounterData: any[] = [];
      const unlinkedNoteData: any[] = [];

      // Map to store next Y position for sources linking to a specific target node ID
      const targetLinkedYTracker = new Map<string, number>();
      const locationNodeMapByName = new Map<string, Node>(); // For finding location nodes by name
      const allCreatedNodesMap = new Map<string, Node>(); // To quickly find any node by its ID
      let globalZIndexCounter = 1; // Initialize z-index counter

      // 1. Process Locations (as Targets)
      apiData.locations?.forEach((locData: any) => {
        const nodeId = `location-${locData.id}`;
        const nodeSize = nodeDefaultSizes.locationNode || nodeDefaultSizes.default;
        const position = { x: TARGETS_X, y: yTrackers.targets };
        
        const locationNode: Node = {
          id: nodeId,
          type: 'locationNode',
          position,
          data: { label: locData.name || `Location ${locData.id}`, linkedNoteIds: locData.linked_note_ids || [] },
          style: { width: nodeSize.width, height: nodeSize.height },
          zIndex: globalZIndexCounter++,
        };
        newNodes.push(locationNode);
        allCreatedNodesMap.set(nodeId, locationNode);
        if (locData.name) {
          locationNodeMapByName.set(locData.name, locationNode);
        }
        yTrackers.targets += nodeSize.height + globalNodeSpacingY;
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
          });
          const npcNode: Node = {
            id: nodeId,
            type: 'npcNode',
            position,
            data: { label: npcData.name || `NPC ${npcData.id}`, linkedNoteIds: npcData.linked_note_ids || [] },
            style: { width: nodeSize.width, height: nodeSize.height },
            zIndex: globalZIndexCounter++,
          };
          newNodes.push(npcNode);
          allCreatedNodesMap.set(nodeId, npcNode);
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
            type: 'smoothstep', 
            animated: false,
            style: { stroke: '#A1A1AA', strokeWidth: 2 }, // Zinc color for associations
          });
        } else {
          
          // If still not linked, update yTracker for the UNLINKED_X column before placing the node
          yPos = yTrackers.unlinked; // Use current unlinked Y
          yTrackers.unlinked += getNodeSize('encounterNode').height + globalNodeSpacingY; // Increment for next unlinked
        }
        
        const encounterNode: Node = {
          id: currentEncounterNodeId,
          type: 'encounterNode',
          position: { x: xPos, y: yPos },
          data: { 
            label: encData.title || `Encounter ${encData.id}`, 
            linkedNoteIds: encData.linked_note_ids || [] 
          },
          style: getNodeSize('encounterNode'),
          zIndex: globalZIndexCounter++,
        };
        newNodes.push(encounterNode);
        allCreatedNodesMap.set(currentEncounterNodeId, encounterNode);

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
                  type: 'smoothstep',
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
      
      // 4. Process Notes (prioritizing linked ones)
      apiData.notes?.forEach((noteData: any) => {
        const nodeId = `note-${noteData.id}`;
        const nodeSize = getNodeSize('noteNode');
        let position;

        let targetNodeIdFromLink: string | undefined = undefined;
        if (noteData.linkedEntityType && noteData.linkedEntityId) {
          const prefix = String(noteData.linkedEntityType).toLowerCase();
          targetNodeIdFromLink = `${prefix}-${noteData.linkedEntityId}`;
        }
        
        const targetNode = targetNodeIdFromLink ? allCreatedNodesMap.get(targetNodeIdFromLink) : undefined;

        if (targetNode) {
           let noteXPosition = SOURCES_X; 
           let columnYTrackerRef = yTrackers.sources;

           if (targetNode.position.x === SOURCES_X) { 
             noteXPosition = UNLINKED_X; 
             columnYTrackerRef = yTrackers.unlinked;
           }

          let actualY;
          if (targetLinkedYTracker.has(targetNode.id)) {
            actualY = targetLinkedYTracker.get(targetNode.id)!;
          } else {
            actualY = Math.max(targetNode.position.y, columnYTrackerRef);
          }
          position = { x: noteXPosition, y: actualY };
          
          targetLinkedYTracker.set(targetNode.id, actualY + nodeSize.height + linkedNodeSpacingY);
          if (noteXPosition === SOURCES_X) {
            yTrackers.sources = actualY + nodeSize.height + globalNodeSpacingY;
          } else { // UNLINKED_X
            yTrackers.unlinked = actualY + nodeSize.height + globalNodeSpacingY;
          }
          
          newEdges.push({
            id: `edge-${nodeId}-${targetNode.id}`,
            source: nodeId,
            target: targetNode.id,
            sourceHandle: 'right',
            targetHandle: 'left',
          });
          const noteNode: Node = {
            id: nodeId,
            type: 'noteNode',
            position,
            data: { label: noteData.title || `Note ${noteData.id}` },
            style: { width: nodeSize.width, height: nodeSize.height },
            zIndex: globalZIndexCounter++,
          };
          newNodes.push(noteNode);
          allCreatedNodesMap.set(nodeId, noteNode);
        } else {
          unlinkedNoteData.push(noteData); // Defer processing
        }
      });

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

      // Process deferred unlinked NPCs
      unlinkedNpcData.forEach(npcData => {
        const nodeId = `npc-${npcData.id}`;
        const nodeSize = getNodeSize('npcNode');
        const position = { x: UNLINKED_X, y: yTrackers.unlinked };
        yTrackers.unlinked += nodeSize.height + globalNodeSpacingY;
        
        const npcNode: Node = {
          id: nodeId,
          type: 'npcNode',
          position,
          data: { label: npcData.name || `NPC ${npcData.id}`, linkedNoteIds: npcData.linked_note_ids || [] },
          style: { width: nodeSize.width, height: nodeSize.height },
          zIndex: globalZIndexCounter++,
        };
        newNodes.push(npcNode);
        allCreatedNodesMap.set(nodeId, npcNode);
      });

      // Process deferred unlinked Encounters
      unlinkedEncounterData.forEach(encData => {
        const nodeId = `encounter-${encData.id}`; 
        const nodeSize = getNodeSize('encounterNode');
        
        const unlinkedNodePosition = { x: UNLINKED_X, y: yTrackers.unlinked };
        
        yTrackers.unlinked += nodeSize.height + globalNodeSpacingY;
        
        const encounterNode: Node = {
          id: nodeId, 
          type: 'encounterNode',
          position: unlinkedNodePosition, 
          data: { 
            label: encData.title || `Encounter ${encData.id}`, 
            linkedNoteIds: encData.linked_note_ids || [] 
          },
          style: { width: nodeSize.width, height: nodeSize.height },
          zIndex: globalZIndexCounter++,
        };
        newNodes.push(encounterNode);
        allCreatedNodesMap.set(nodeId, encounterNode);
      });

      // Process deferred unlinked Notes
      unlinkedNoteData.forEach(noteData => {
        const nodeId = `note-${noteData.id}`;
        const nodeSize = getNodeSize('noteNode');
        const position = { x: UNLINKED_X, y: yTrackers.unlinked };
        yTrackers.unlinked += nodeSize.height + globalNodeSpacingY;
        
        const noteNode: Node = {
          id: nodeId,
          type: 'noteNode',
          position,
          data: { label: noteData.title || `Note ${noteData.id}` },
          style: { width: nodeSize.width, height: nodeSize.height },
          zIndex: globalZIndexCounter++,
        };
        newNodes.push(noteNode);
        allCreatedNodesMap.set(nodeId, noteNode);
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
      
      if (rfInstance) {
        // fitView might be better after nodes are confirmed to be rendered in their new positions
        setTimeout(() => {
          if (rfInstance) { // Re-check rfInstance just in case
            rfInstance.fitView({ padding: 0.2, duration: 200 }); 
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

  useEffect(() => {
    if (syncTrigger && syncTrigger > 0 && campaignId) {
      // Check campaignId to ensure it's available before syncing
      
      syncFlowchartWithCampaignData();
    }
  }, [syncTrigger, campaignId]); // Add campaignId to dependencies

  const addNpcNode = useCallback(() => {
    const newNodeId = getNewNodeId();
    let newNodePosition: { x: number, y: number };

    if (lastPaneClickFlowPosition) {
      newNodePosition = { ...lastPaneClickFlowPosition }; 
      setLastPaneClickFlowPosition(null); // Clear after use
    } else if (rfInstance) {
      // Fallback: Place 100px/100px (screen pixels) from viewport top-left
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.project(screenFallbackOffset);
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
    } else if (rfInstance) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.project(screenFallbackOffset);
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
    } else if (rfInstance) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.project(screenFallbackOffset);
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
    } else if (rfInstance) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.project(screenFallbackOffset);
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
    if (rfInstance && event.target === event.currentTarget) { // Ensure the click is on the pane itself
      const pane = event.currentTarget.getBoundingClientRect();
      const projectedPosition = rfInstance.project({
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
    try {
      const response = await fetch(`/api/flowcharts/${idToLoad}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load flowchart: ${response.statusText}`);
      }
      const flowchart = await response.json();
      if (flowchart && flowchart.data && flowchart.data.nodes) {
        const loadedNodes = flowchart.data.nodes || [];
        setNodes(loadedNodes);
        setEdges(flowchart.data.edges || []);
        setFlowchartName(flowchart.name || 'Flowchart');
        setCurrentFlowchartId(flowchart.id);

        // Update the global id counter based on loaded nodes
        let maxId = -1;
        loadedNodes.forEach((node: Node) => {
          if (node.id.startsWith('dndnode_')) {
            const numPart = parseInt(node.id.substring('dndnode_'.length), 10);
            if (!isNaN(numPart) && numPart > maxId) {
              maxId = numPart;
            }
          }
        });
        id = maxId + 1; // Set the global id to be one greater than the max found

        // Always fit view after loading, do not restore saved viewport for now
        if (rfInstance) {
          setTimeout(() => {
            if (rfInstance) { // Re-check rfInstance as it's in a timeout
              rfInstance.fitView({ padding: 0.2, duration: 200 });
            }
          }, 100); // 100ms delay
        }
      } else {
        console.error('Loaded flowchart data is not in the expected format:', flowchart);
        throw new Error('Flowchart data is malformed.');
      }
    } catch (error: any) {
      console.error('Error loading flowchart:', error);
      toast.error(error.message || 'Error loading flowchart. See console for details.');
      // Initialize with default on error
      setNodes(initialNodes);
      setEdges([]);
      setFlowchartName(initialName || 'New Flowchart (load error)');
    }
  }, [rfInstance, setNodes, setEdges, setFlowchartName, setCurrentFlowchartId, initialName, initialNodes]);

  useEffect(() => {
    if (blockLoadAfterSyncRef.current) {
      blockLoadAfterSyncRef.current = false; // Consume the flag, don't load this cycle
      return;
    }
    if (flowchartId) {
      loadFlowchart(flowchartId);
    }
  }, [flowchartId, loadFlowchart]); // Removed blockLoadAfterSync from deps, ref changes don't trigger effect

  const saveFlowchart = async () => {
    if (!campaignId && !currentFlowchartId) {
      toast.error('Cannot save: No campaign context or existing flowchart ID.');
      return;
    }

    const viewport = rfInstance?.getViewport();
    const flowchartData = {
      nodes,
      edges,
      viewport, // Save viewport for consistent loading
    };

    try {
      let response;
      if (currentFlowchartId) {
        // Update existing flowchart
        response = await fetch(`/api/flowcharts/${currentFlowchartId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: flowchartName, data: flowchartData }),
        });
      } else if (campaignId) {
        // Create new flowchart
        response = await fetch(`/api/campaigns/${campaignId}/flowcharts`, {
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
      toast.success('Flowchart saved successfully!');
      
      if (onSaveSuccess) {
        onSaveSuccess(savedFlowchart);
      }

    } catch (error: any) {
      console.error('Error saving flowchart:', error);
      toast.error(error.message || 'Error saving flowchart. See console for details.');
    }
  };

  return (
    <div style={{ height: '100%', width: '100%' }} className="bg-background dark:bg-stone-900/50 flex flex-col">
      <div 
        className="p-2 flex flex-wrap items-center gap-2 border-b border-amber-800/20 dark:border-stone-700"
      >
        <Input 
          type="text" 
          value={flowchartName} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowchartName(e.target.value)}
          placeholder="Flowchart Name"
          className="max-w-xs text-base h-9 bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
        />
        <Button onClick={addNpcNode} variant="outline" size="sm" className="text-sky-800 border-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:border-sky-500 dark:hover:bg-stone-700">Add NPC</Button>
        <Button onClick={addLocationNode} variant="outline" size="sm" className="text-green-800 border-green-700 hover:bg-green-100 dark:text-green-300 dark:border-green-500 dark:hover:bg-stone-700">Add Location</Button>
        <Button onClick={addNoteNode} variant="outline" size="sm" className="text-amber-800 border-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-500 dark:hover:bg-stone-700">Add Note</Button>
        <Button onClick={addEncounterNode} variant="outline" size="sm" className="text-red-800 border-red-700 hover:bg-red-100 dark:text-red-300 dark:border-red-500 dark:hover:bg-stone-700">Add Encounter</Button>
        <Button onClick={syncFlowchartWithCampaignData} variant="outline" size="sm" className="text-purple-800 border-purple-700 hover:bg-purple-100 dark:text-purple-300 dark:border-purple-500 dark:hover:bg-stone-700">Sync with Campaign</Button>
        <Button onClick={saveFlowchart} variant="default" size="sm" className="bg-amber-800 text-amber-100 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 ml-auto">Save Flowchart</Button>
        
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
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Controls />
        <Background />
      </ReactFlow>
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