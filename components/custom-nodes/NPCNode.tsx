'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react'; // Icon for NPCs
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';

interface NPCNodeData {
  label: string;
  // Potentially add npcId?: string or other NPC-specific data fields
}

// The `width` and `height` props are injected by React Flow when the node is resized.
const NPCNode: React.FC<NodeProps<NPCNodeData>> = ({ data, isConnectable, selected }) => {
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const npcNodeStyles = {
    light: {
      background: '#e0f2fe',  // Light sky blue
      borderColor: '#7dd3fc',  // Sky blue border
      textColor: '#0c4a6e',    // Dark sky blue text
      iconColor: 'text-sky-600'
    },
    dark: {
      background: '#082f49',  // Darker sky blue
      borderColor: '#0369a1',  // Medium sky blue border
      textColor: '#e0f2fe',    // Light sky blue text
      iconColor: 'text-sky-400'
    }
  };

  const currentStyle = isDarkMode ? npcNodeStyles.dark : npcNodeStyles.light;

  // Experimental: NodeResizer wraps the circular div.
  // The outer div provided by React Flow will take the size from NodeResizer.
  return (
    // The NodeResizer should make the overall node dimensions square due to keepAspectRatio.
    // This div then fills that square and uses CSS to maintain its own 1:1 aspect ratio for the visual circle.
    <div
      style={{
        width: '100%', // Fill the width React Flow gives the node (from NodeResizer)
        height: '0',     // CSS aspect ratio trick: height is 0
        paddingBottom: '100%', // CSS aspect ratio trick: padding-bottom makes height equal to width
        borderRadius: '50%',
        background: currentStyle.background,
        border: `2px solid ${currentStyle.borderColor}`,
        position: 'relative', // For positioning handles and internal content wrapper
        boxSizing: 'border-box',
        boxShadow: selected ? `0 0 0 2px ${currentStyle.borderColor}` : '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={40}  // Reduced min diameter
        minHeight={40} // Reduced min diameter
        keepAspectRatio={true}
        lineClassName="border-sky-500"
        handleClassName="bg-sky-500 h-2 w-2 rounded-sm"
      />
      {/* Absolutely positioned content wrapper to sit inside the padding-defined space */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '5px', // Slightly reduced padding for smaller sizes
        }}
      >
        <User size={16} className={currentStyle.iconColor} /> {/* Smaller icon for smaller node */}
        <strong
          className="font-semibold mt-1 text-xs break-words"
          // Max width adjusted to give a bit more breathing room relative to padding
          style={{ color: currentStyle.textColor, maxWidth: '90%' }} 
        >
          {data.label || 'NPC'}
        </strong>
      </div>
      {/* Handles are positioned relative to the main div */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#555', zIndex: 10, top: '-5px' }} // Adjusted for border/padding
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#555', zIndex: 10, bottom: '-5px' }} // Adjusted for border/padding
      />
    </div>
  );
};

export default NPCNode; 