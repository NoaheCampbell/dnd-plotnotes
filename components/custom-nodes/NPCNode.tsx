'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react'; // Changed back to User
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';

interface NPCNodeData {
  label: string;
  // Potentially add npcId?: string or other NPC-specific data fields
}

// The `width` and `height` props are injected by React Flow when the node is resized.
const NPCNode: React.FC<NodeProps<NPCNodeData>> = ({ data, isConnectable, selected }) => {
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  // NPC Styles
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

  const currentStyle = isDarkMode ? npcNodeStyles.dark : npcNodeStyles.light; // Use NPC styles
  const circularClipPath = 'circle(50% at 50% 50%)'; // Define circular clip-path

  const handleStyle = {
    width: 10,
    height: 10,
    background: '#555',
    border: `1.5px solid #fff`,
    borderRadius: '50%',
    zIndex: 10,
  };

  return (
    // This outer div is what React Flow controls (size, position). NodeResizer targets this.
    // It should be a simple rectangle, and NodeResizer will operate on it.
    <div 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative', // For positioning inner elements and handles
        overflow: 'visible', // Ensure resizer handles are visible
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={40} // NPC min width
        minHeight={40} // NPC min height
        keepAspectRatio={true} // Make it a circle
        lineClassName={`border-2 ${isDarkMode ? currentStyle.borderColor : currentStyle.borderColor}`}
        handleClassName={`h-3 w-3 rounded-full border-2 ${isDarkMode ? 'bg-sky-400 border-gray-800' : 'bg-sky-500 border-white'}`} // Adjusted resizer handle colors for NPC theme
      />
      {/* Handles are children of the outer div, positioned relative to it */}
      <Handle id="top" type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
      <Handle id="left" type="target" position={Position.Left} isConnectable={isConnectable} style={{...handleStyle, left: '-5px'}} />
      <Handle id="right" type="source" position={Position.Right} isConnectable={isConnectable} style={{...handleStyle, right: '-5px'}} />
      
      {/* This div is the "border" layer. Its background is the border color. */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: currentStyle.borderColor,
          clipPath: circularClipPath, // Apply circular clip-path
          position: 'relative',
          boxSizing: 'border-box',
          boxShadow: selected ? `0 0 0 1px ${currentStyle.borderColor}` : '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {/* This inner div is the actual content area, inset from the border layer */}
        <div 
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: currentStyle.background,
            clipPath: circularClipPath, // Apply circular clip-path
            padding: '10px', // Adjusted padding for circle
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            borderRadius: '50%', // Optional: helps with anti-aliasing of clip-path
          }}
        >
          <div className="flex items-center justify-center gap-x-1.5 w-full" style={{ minWidth: 0 }}>
            <User size={16} className={`${currentStyle.iconColor} flex-shrink-0`} /> {/* Icon back to User */}
            <strong
              className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-grow"
              style={{ color: currentStyle.textColor }}
              title={data.label || 'NPC'} // Default label to NPC
            >
              {data.label || 'NPC'} {/* Default label to NPC */}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPCNode; 