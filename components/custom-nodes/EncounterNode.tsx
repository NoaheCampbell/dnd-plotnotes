'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Swords } from 'lucide-react';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';

interface EncounterNodeData {
  label: string;
}

const EncounterNode: React.FC<NodeProps<EncounterNodeData>> = ({ data, isConnectable, selected }) => {
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const nodeStyles = {
    light: {
      background: '#fee2e2', // Light red (red-100)
      borderColor: '#fca5a5', // red-300
      textColor: '#991b1b',    // red-800
      iconColor: 'text-red-600'
    },
    dark: {
      background: '#450a0a',  // Dark red (red-950)
      borderColor: '#ef4444',  // red-500
      textColor: '#fecaca',    // red-200
      iconColor: 'text-red-400'
    }
  };

  const currentStyle = isDarkMode ? nodeStyles.dark : nodeStyles.light;

  const handleStyle = {
    width: 10,
    height: 10,
    background: '#555',
    border: `1.5px solid #fff`,
    borderRadius: '50%',
    zIndex: 10,
  };
  
  // Hexagon clip-path
  const clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={90} 
        minHeight={80} 
        keepAspectRatio={false} 
        lineClassName={`border-2 ${isDarkMode ? 'border-red-500' : 'border-red-400'}`}
        handleClassName={`h-3 w-3 rounded-full border-2 ${isDarkMode ? 'bg-red-500 border-gray-800' : 'bg-red-400 border-white'}`}
      />
      {/* <Handle id="top" type="target" position={Position.Top} isConnectable={isConnectable} style={{...handleStyle, top: '-5px'}} /> */}
      {/* <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={isConnectable} style={{...handleStyle, bottom: '-5px'}} /> */}
      <Handle id="top" type="target" position={Position.Top} isConnectable={isConnectable} style={{...handleStyle, top: '-5px'}} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={isConnectable} style={{...handleStyle, bottom: '-5px'}} />
      <Handle id="left" type="target" position={Position.Left} isConnectable={isConnectable} style={{...handleStyle, left: '-5px'}} />
      <Handle id="right" type="source" position={Position.Right} isConnectable={isConnectable} style={{...handleStyle, right: '-5px'}} />
      
      {/* This div is the "border" layer. Its background is the border color. */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: currentStyle.borderColor,
          clipPath: clipPath,
          position: 'relative', // For positioning the inner content div
          boxSizing: 'border-box',
          boxShadow: selected ? `0 0 0 1px ${currentStyle.borderColor}` : '0 1px 3px rgba(0,0,0,0.1)',
          // No padding here now
        }}
      >
        {/* This inner div is the actual content area, inset from the border layer */}
        <div 
          style={{
            position: 'absolute',
            top: '2px',      // Border thickness
            left: '2px',     // Border thickness
            right: '2px',    // Border thickness
            bottom: '2px',   // Border thickness
            background: currentStyle.background,
            clipPath: clipPath, // Content area must also be clipped
            padding: '13px 18px', // Content padding remains the same
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div className="flex items-center justify-center gap-x-1.5 w-full" style={{ minWidth: 0 }}>
            <Swords size={16} className={`${currentStyle.iconColor} flex-shrink-0`} />
            <strong
              className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-grow"
              style={{ color: currentStyle.textColor }}
              title={data.label || 'Encounter'}
            >
              {data.label || 'Encounter'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncounterNode;
