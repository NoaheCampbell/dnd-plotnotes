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
  const circularClipPath = 'circle(50% at 50% 50%)';

  const handleStyle = {
    width: 10,
    height: 10,
    background: '#555',
    border: `1.5px solid #fff`,
    borderRadius: '50%',
    zIndex: 10,
  };

  return (
    // Outermost container for NodeResizer and Handles
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible', // Important for handles if they are slightly offset
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={40}
        keepAspectRatio={true} // Keep it circular
        lineClassName={`border-2 ${isDarkMode ? 'border-sky-400' : 'border-sky-500'}`}
        handleClassName={`h-3 w-3 rounded-full border-2 ${isDarkMode ? 'bg-sky-400 border-gray-800' : 'bg-sky-500 border-white'}`}
      />
      
      {/* Handles are direct children of the resizable container */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{...handleStyle, left: '-5px'}} />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{...handleStyle, right: '-5px'}} />

      {/* Border layer div */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: currentStyle.borderColor,
          clipPath: circularClipPath,
          position: 'relative', // For positioning the content div
          boxSizing: 'border-box',
          boxShadow: selected ? `0 0 0 1px ${currentStyle.borderColor}` : '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {/* Content layer div (inset for border) */}
        <div
          style={{
            position: 'absolute',
            top: '2px', // Border thickness
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: currentStyle.background,
            clipPath: circularClipPath, // Content area also needs to be clipped
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '5px', // Padding for content inside the circle
            boxSizing: 'border-box',
            borderRadius: '50%', // Helps if clipPath is not perfectly anti-aliased
          }}
        >
          <User size={16} className={currentStyle.iconColor} />
          <strong
            className="font-semibold mt-1 text-xs break-words"
            style={{ color: currentStyle.textColor, maxWidth: '90%' }}
          >
            {data.label || 'NPC'}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default NPCNode; 