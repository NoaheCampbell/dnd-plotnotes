'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
}

let id = 0;
const getNewNodeId = () => `dndnode_${id++}`;

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Start Node' }, position: { x: 250, y: 5 } },
];

const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ flowchartId, campaignId, initialName, onSaveSuccess }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowchartName, setFlowchartName] = useState(initialName || 'New Flowchart');
  const [rfInstance, setRfInstance] = useState<any>(null); // To access React Flow instance for saving viewport
  const [currentFlowchartId, setCurrentFlowchartId] = useState<string | undefined>(flowchartId);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentNodeLabel, setCurrentNodeLabel] = useState<string>("");
  const [lastPaneClickFlowPosition, setLastPaneClickFlowPosition] = useState<{x: number, y: number} | null>(null);

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
    console.log("isValidConnection raw connection object:", connection); // Log the raw connection object

    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    // Log found nodes for verification
    console.log("isValidConnection found sourceNode:", sourceNode ? { id: sourceNode.id, type: sourceNode.type, data: sourceNode.data } : null);
    console.log("isValidConnection found targetNode:", targetNode ? { id: targetNode.id, type: targetNode.type, data: targetNode.data } : null);

    if (!sourceNode || !targetNode) {
      console.warn("isValidConnection: source or target node not found for the connection attempt.");
      return false;
    }

    const sourceType = sourceNode.type;
    const targetType = targetNode.type;
    const sourceHandle = connection.sourceHandle;
    const targetHandle = connection.targetHandle;

    console.log(`Attempting: ${sourceType} (${sourceHandle}) -> ${targetType} (${targetHandle})`);

    // REMOVE TEMPORARY DEBUG RULE
    // if (sourceType === 'npcNode' && targetType === 'locationNode') {
    //   console.log("TEMP RULE: Allowing ANY NPC -> Location connection for debugging.");
    //   return true;
    // }

    // --- General Rule for Vertical "Segway" Connections (Bottom to Top) ---
    if (sourceHandle === 'bottom' && targetHandle === 'top') {
      console.log(`Allowing Segway: ${sourceType} (bottom) -> ${targetType} (top)`);
      return true;
    }

    // --- Rules for Horizontal/Side "Association" Connections ---
    // Rule 2: Location to Location (Horizontal)
    if (sourceType === 'locationNode' && targetType === 'locationNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Location (right) -> Location (left)");
      return true;
    }

    // Rule 3: NPC to Location (Side connection)
    if (sourceType === 'npcNode' && targetType === 'locationNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: NPC (right) -> Location (left)");
      return true;
    }

    // Rule 4: Note to Location (Side connection)
    if (sourceType === 'noteNode' && targetType === 'locationNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Note (right) -> Location (left)");
      return true;
    }

    // Rule 5: Encounter to Location (Side connection)
    if (sourceType === 'encounterNode' && targetType === 'locationNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Encounter (right) -> Location (left)");
      return true;
    }

    // --- Add new rules for Location -> Other Nodes (Side connections) ---
    // Rule 6: Location to NPC (Side connection)
    if (sourceType === 'locationNode' && targetType === 'npcNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Location (right) -> NPC (left)");
      return true;
    }

    // Rule 7: Location to Note (Side connection)
    if (sourceType === 'locationNode' && targetType === 'noteNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Location (right) -> Note (left)");
      return true;
    }

    // Rule 8: Location to Encounter (Side connection)
    if (sourceType === 'locationNode' && targetType === 'encounterNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Location (right) -> Encounter (left)");
      return true;
    }

    // --- Add new rules for Note <-> NPC --- 
    // Rule 9: Note to NPC (Side connection)
    if (sourceType === 'noteNode' && targetType === 'npcNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Note (right) -> NPC (left)");
      return true;
    }
    // Rule 10: NPC to Note (Side connection)
    if (sourceType === 'npcNode' && targetType === 'noteNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: NPC (right) -> Note (left)");
      return true;
    }

    // --- Add new rules for Encounter <-> NPC ---
    // Rule 11: Encounter to NPC (Side connection)
    if (sourceType === 'encounterNode' && targetType === 'npcNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Encounter (right) -> NPC (left)");
      return true;
    }
    // Rule 12: NPC to Encounter (Side connection)
    if (sourceType === 'npcNode' && targetType === 'encounterNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: NPC (right) -> Encounter (left)");
      return true;
    }

    // --- Add new rules for NPC <-> NPC ---
    // Rule 13: NPC to NPC (Horizontal right-to-left)
    if (sourceType === 'npcNode' && targetType === 'npcNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: NPC (right) -> NPC (left)");
      return true;
    }
    // Rule 14: NPC to NPC (Vertical bottom-to-top) - Covered by general segway rule
    // if (sourceType === 'npcNode' && targetType === 'npcNode' && sourceHandle === 'bottom' && targetHandle === 'top') {
    //   console.log("Allowing: NPC (bottom) -> NPC (top)");
    //   return true;
    // }

    // --- Add new rules for Encounter <-> Note ---
    // Rule 15: Encounter to Note (Side connection)
    if (sourceType === 'encounterNode' && targetType === 'noteNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Encounter (right) -> Note (left)");
      return true;
    }
    // Rule 16: Note to Encounter (Side connection)
    if (sourceType === 'noteNode' && targetType === 'encounterNode' && sourceHandle === 'right' && targetHandle === 'left') {
      console.log("Allowing: Note (right) -> Encounter (left)");
      return true;
    }

    console.log(`Disallowing connection: ${sourceType} (${sourceHandle}) -> ${targetType} (${targetHandle})`);
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
      const globalNodeSpacingY = 100; // General vertical spacing between nodes in a column
      const linkedNodeSpacingY = 30;  // Tighter vertical spacing for nodes linked to the same target

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
        targets: yOffset,
        // Y positions for sources linking to specific targets will be managed by targetLinkedYTracker
      };

      // Map to store next Y position for sources linking to a specific target node ID
      const targetLinkedYTracker = new Map<string, number>();
      const locationNodeMapByName = new Map<string, Node>(); // For finding location nodes by name
      const allCreatedNodesMap = new Map<string, Node>(); // To quickly find any node by its ID

      // 1. Process Locations (as Targets)
      apiData.locations?.forEach((locData: any) => {
        const nodeId = `location-${locData.id}`;
        const nodeSize = nodeDefaultSizes.locationNode || nodeDefaultSizes.default;
        const position = { x: TARGETS_X, y: yTrackers.targets };
        
        const locationNode: Node = {
          id: nodeId,
          type: 'locationNode',
          position,
          data: { label: locData.name || `Location ${locData.id}` },
          style: { width: nodeSize.width, height: nodeSize.height },
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
      
      // 2. Process NPCs
      apiData.npcs?.forEach((npcData: any) => {
        const nodeId = `npc-${npcData.id}`;
        const nodeSize = getNodeSize('npcNode');
        let position;
        let isLinked = false;

        // Assuming npcs might link to locations by name (e.g., npcData.locationName)
        // Modify this if NPCs link differently or not at all in your data
        const targetLocationNode = npcData.locationName ? locationNodeMapByName.get(npcData.locationName) : undefined;

        if (targetLocationNode) {
          isLinked = true;
          const targetY = targetLocationNode.position.y;
          const nextYForTarget = targetLinkedYTracker.get(targetLocationNode.id) || targetY;
          
          position = { x: SOURCES_X, y: nextYForTarget };
          targetLinkedYTracker.set(targetLocationNode.id, nextYForTarget + nodeSize.height + linkedNodeSpacingY);
          
          newEdges.push({
            id: `edge-${nodeId}-${targetLocationNode.id}`,
            source: nodeId,
            target: targetLocationNode.id,
            sourceHandle: 'right',
            targetHandle: 'left',
          });
        } else {
          // Unlinked NPC
          position = { x: UNLINKED_X, y: yTrackers.unlinked };
          yTrackers.unlinked += nodeSize.height + globalNodeSpacingY;
        }
        
        const npcNode: Node = {
          id: nodeId,
          type: 'npcNode',
          position,
          data: { label: npcData.name || `NPC ${npcData.id}` },
          style: { width: nodeSize.width, height: nodeSize.height },
        };
        newNodes.push(npcNode);
        allCreatedNodesMap.set(nodeId, npcNode);
      });

      // 3. Process Encounters
      apiData.encounters?.forEach((encData: any) => {
        const nodeId = `encounter-${encData.id}`;
        const nodeSize = getNodeSize('encounterNode');
        let position;
        let isLinked = false;

        const targetLocationNode = encData.location ? locationNodeMapByName.get(encData.location) : undefined;

        if (targetLocationNode) {
          isLinked = true;
          const targetY = targetLocationNode.position.y;
          // Start stacking linked nodes from the target's Y position
          const nextYForTarget = targetLinkedYTracker.get(targetLocationNode.id) || targetY;
          
          position = { x: SOURCES_X, y: nextYForTarget };
          // Update the Y tracker for the next node linking to this *same* target
          targetLinkedYTracker.set(targetLocationNode.id, nextYForTarget + nodeSize.height + linkedNodeSpacingY);
          
          newEdges.push({
            id: `edge-${nodeId}-${targetLocationNode.id}`,
            source: nodeId,
            target: targetLocationNode.id,
            sourceHandle: 'right',
            targetHandle: 'left',
          });
        } else {
          // Unlinked Encounter
          position = { x: UNLINKED_X, y: yTrackers.unlinked };
          yTrackers.unlinked += nodeSize.height + globalNodeSpacingY;
        }
        
        const encounterNode: Node = {
          id: nodeId,
          type: 'encounterNode',
          position,
          data: { label: encData.title || `Encounter ${encData.id}` },
          style: { width: nodeSize.width, height: nodeSize.height },
        };
        newNodes.push(encounterNode);
        allCreatedNodesMap.set(nodeId, encounterNode);
      });
      
      // 4. Process Notes
      apiData.notes?.forEach((noteData: any) => {
        const nodeId = `note-${noteData.id}`;
        const nodeSize = getNodeSize('noteNode');
        let position;
        let isLinked = false;

        // Example: Notes link to locations by name (e.g., noteData.locationName)
        // Modify if Notes link to other types or via IDs
        const targetNodeId = noteData.linkedLocationName ? locationNodeMapByName.get(noteData.linkedLocationName)?.id : undefined;
        // Or if linking to any node type by ID: const targetNodeId = noteData.linkedEntityId ? allCreatedNodesMap.get(noteData.linkedEntityId)?.id : undefined;
        
        const targetNode = targetNodeId ? allCreatedNodesMap.get(targetNodeId) : undefined;

        if (targetNode) {
           // Determine if target is in TARGETS_X or SOURCES_X to place note correctly
           let noteXPosition = SOURCES_X; // Default for notes linking to main targets
           if (targetNode.position.x === SOURCES_X) { // If target is already a source, place note further left
             noteXPosition = UNLINKED_X; // Or a new dedicated column if many such links
           }

          isLinked = true;
          const targetY = targetNode.position.y;
          const nextYForTarget = targetLinkedYTracker.get(targetNode.id) || targetY;
          
          position = { x: noteXPosition, y: nextYForTarget };
          targetLinkedYTracker.set(targetNode.id, nextYForTarget + nodeSize.height + linkedNodeSpacingY);
          
          newEdges.push({
            id: `edge-${nodeId}-${targetNode.id}`,
            source: nodeId,
            target: targetNode.id,
            sourceHandle: 'right',
            targetHandle: 'left', // Assuming Note.right -> Target.left
          });
        } else {
          // Unlinked Note
          position = { x: UNLINKED_X, y: yTrackers.unlinked };
          yTrackers.unlinked += nodeSize.height + globalNodeSpacingY;
        }
        
        const noteNode: Node = {
          id: nodeId,
          type: 'noteNode',
          position,
          data: { label: noteData.title || `Note ${noteData.id}` },
          style: { width: nodeSize.width, height: nodeSize.height },
        };
        newNodes.push(noteNode);
        allCreatedNodesMap.set(nodeId, noteNode);
      });

      // Sort nodes by their Y position then X to improve rendering order for overlapping nodes (optional)
      // newNodes.sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);

      setNodes(newNodes);
      setEdges(newEdges);
      
      if (rfInstance) {
        setTimeout(() => {
          if (rfInstance) { // Re-check rfInstance just in case
            rfInstance.fitView({ padding: 0.2, duration: 200 }); // Added padding and a short animation duration
          }
        }, 100); // Increased delay to 100ms
      }
      setFlowchartName(`Synced: ${new Date().toLocaleString()}`);
      toast.success("Flowchart synced with campaign data using new layout!");

    } catch (error: any) {
      console.error("Error syncing flowchart:", error);
      toast.error(error.message || "Failed to sync flowchart.");
    }
  }, [campaignId, setNodes, setEdges, rfInstance, setFlowchartName]);

  const addNpcNode = useCallback(() => {
    const newNodeId = getNewNodeId();
    let newNodePosition: { x: number, y: number };

    if (lastPaneClickFlowPosition) {
      newNodePosition = { ...lastPaneClickFlowPosition }; 
      console.log('Using lastPaneClickFlowPosition:', newNodePosition);
      setLastPaneClickFlowPosition(null); // Clear after use
    } else if (rfInstance) {
      // Fallback: Place 100px/100px (screen pixels) from viewport top-left
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.project(screenFallbackOffset);
      console.log('Using viewport fallback. Screen offset:', screenFallbackOffset, 'Projected to:', newNodePosition);
    } else {
      // Absolute fallback if rfInstance is not available
      newNodePosition = { x: Math.random() * 200, y: Math.random() * 100 };
      console.log('Using absolute fallback position:', newNodePosition);
    }

    // Add a small random offset to prevent perfect stacking
    newNodePosition.x += (Math.random() - 0.5) * 10; 
    newNodePosition.y += (Math.random() - 0.5) * 10;
    console.log('Final position for new NPC node:', newNodePosition);

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
      console.log('Using lastPaneClickFlowPosition:', newNodePosition);
      setLastPaneClickFlowPosition(null); 
    } else if (rfInstance) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.project(screenFallbackOffset);
      console.log('Using viewport fallback. Screen offset:', screenFallbackOffset, 'Projected to:', newNodePosition);
    } else {
      newNodePosition = { x: Math.random() * 200, y: Math.random() * 100 };
      console.log('Using absolute fallback position:', newNodePosition);
    }

    newNodePosition.x += (Math.random() - 0.5) * 10; 
    newNodePosition.y += (Math.random() - 0.5) * 10;
    console.log('Final position for new Location node:', newNodePosition);

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
      console.log('Using lastPaneClickFlowPosition:', newNodePosition);
      setLastPaneClickFlowPosition(null); 
    } else if (rfInstance) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.project(screenFallbackOffset);
      console.log('Using viewport fallback. Screen offset:', screenFallbackOffset, 'Projected to:', newNodePosition);
    } else {
      newNodePosition = { x: Math.random() * 200, y: Math.random() * 100 };
      console.log('Using absolute fallback position:', newNodePosition);
    }

    newNodePosition.x += (Math.random() - 0.5) * 10; 
    newNodePosition.y += (Math.random() - 0.5) * 10;
    console.log('Final position for new Note node:', newNodePosition);

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
      console.log('Using lastPaneClickFlowPosition:', newNodePosition);
      setLastPaneClickFlowPosition(null); 
    } else if (rfInstance) {
      const screenFallbackOffset = { x: 100, y: 100 }; 
      newNodePosition = rfInstance.project(screenFallbackOffset);
      console.log('Using viewport fallback. Screen offset:', screenFallbackOffset, 'Projected to:', newNodePosition);
    } else {
      newNodePosition = { x: Math.random() * 200, y: Math.random() * 100 };
      console.log('Using absolute fallback position:', newNodePosition);
    }

    newNodePosition.x += (Math.random() - 0.5) * 10; 
    newNodePosition.y += (Math.random() - 0.5) * 10;
    console.log('Final position for new Encounter node:', newNodePosition);

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
      console.log('Pane clicked. Projected position:', projectedPosition);
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
    if (flowchartId) {
      loadFlowchart(flowchartId);
    }
  }, [flowchartId, loadFlowchart]);

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