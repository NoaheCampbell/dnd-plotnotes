'use client';

import React, { useState, useCallback, useEffect } from 'react';
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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNodeId = getNewNodeId();
    const newNode: Node = {
      id: newNodeId,
      type: 'default', // Can be customized later
      position: {
        x: Math.random() * (rfInstance?.getViewport().width || 400) - 100, // Position within viewport
        y: Math.random() * (rfInstance?.getViewport().height || 400) - 50,
      },
      data: { label: `Node ${id-1}` }, // id is already incremented by getNewNodeId
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, rfInstance]);

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

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    // Optionally apply label change on pane click if there was a pending edit
    // if (selectedNode && currentNodeLabel !== selectedNode.data.label) {
    //   applyNodeLabelUpdate(); 
    // }
  }, [selectedNode, currentNodeLabel]); // Removed selectedNode & currentNodeLabel from deps for this simplified version

  useEffect(() => {
    if (flowchartId) {
      loadFlowchart(flowchartId);
    }
  }, [flowchartId]);

  const loadFlowchart = async (idToLoad: string) => {
    try {
      const response = await fetch(`/api/flowcharts/${idToLoad}`);
      if (!response.ok) {
        throw new Error(`Failed to load flowchart: ${response.statusText}`);
      }
      const flowchart = await response.json();
      if (flowchart && flowchart.data && flowchart.data.nodes) {
        setNodes(flowchart.data.nodes || []);
        setEdges(flowchart.data.edges || []);
        setFlowchartName(flowchart.name || 'Flowchart');
        setCurrentFlowchartId(flowchart.id);
        // TODO: Restore viewport from flowchart.data.viewport if saved
        if (rfInstance && flowchart.data.viewport) {
            rfInstance.setViewport(flowchart.data.viewport);
        }
      } else {
        console.error('Loaded flowchart data is not in the expected format:', flowchart);
        // Initialize with default if format is bad
        setNodes(initialNodes);
        setEdges([]);
        setFlowchartName(initialName || 'New Flowchart (load failed)');
      }
    } catch (error) {
      console.error('Error loading flowchart:', error);
      alert('Error loading flowchart. See console for details.');
       // Initialize with default on error
       setNodes(initialNodes);
       setEdges([]);
       setFlowchartName(initialName || 'New Flowchart (load error)');
    }
  };

  const saveFlowchart = async () => {
    if (!campaignId && !currentFlowchartId) {
      alert('Cannot save: No campaign context for a new flowchart and no existing flowchart ID.');
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
        const errorData = response ? await response.json() : { error: 'Unknown error' };
        throw new Error(`Failed to save flowchart: ${response?.statusText} - ${errorData.error}`);
      }

      const savedFlowchart = await response.json();
      setCurrentFlowchartId(savedFlowchart.id); // Update ID if it was a new flowchart
      alert('Flowchart saved successfully!');
      
      if (onSaveSuccess) {
        onSaveSuccess(savedFlowchart);
      }

    } catch (error) {
      console.error('Error saving flowchart:', error);
      alert(`Error saving flowchart: ${error instanceof Error ? error.message : String(error)}`);
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
        <Button onClick={addNode} variant="outline" size="sm" className="text-amber-800 border-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-500 dark:hover:bg-stone-700">Add Node</Button>
        <Button onClick={saveFlowchart} variant="default" size="sm" className="bg-amber-800 text-amber-100 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">Save Flowchart</Button>
        
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
        onInit={setRfInstance}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        className="flex-grow"
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