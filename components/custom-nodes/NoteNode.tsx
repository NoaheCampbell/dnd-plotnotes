'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';

interface NoteNodeData {
  label: string;
  entity_links?: Array<{ linked_entity_id: number, linked_entity_type: string }>;
}

const NoteNode: React.FC<NodeProps<NoteNodeData>> = ({ data, isConnectable, selected }) => {
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const nodeStyles = {
    light: {
      background: '#fffbeb', // Light amber/parchment
      borderColor: '#fde68a', // amber-200
      textColor: '#78350f',    // amber-800
      iconColor: 'text-amber-600'
    },
    dark: {
      background: '#451a03',  // Dark amber/brown (amber-950)
      borderColor: '#d97706',  // amber-600
      textColor: '#fef3c7',    // amber-100
      iconColor: 'text-amber-400'
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
        minWidth={80}
        minHeight={60}
        keepAspectRatio={false}
        lineClassName={`border-2 ${isDarkMode ? 'border-amber-500' : 'border-amber-400'}`}
        handleClassName={`h-3 w-3 rounded-full border-2 ${isDarkMode ? 'bg-amber-500 border-gray-800' : 'bg-amber-400 border-white'}`}
      />
      {/* <Handle id="top" type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} /> */}
      {/* <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} /> */}
      <Handle id="top" type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
      <Handle id="left" type="target" position={Position.Left} isConnectable={isConnectable} style={{...handleStyle, left: '-5px'}} />
      <Handle id="right" type="source" position={Position.Right} isConnectable={isConnectable} style={{...handleStyle, right: '-5px'}} />
      
      <div
        style={{
          width: '100%',
          height: '100%',
          background: currentStyle.background,
          border: `2px solid ${currentStyle.borderColor}`,
          borderRadius: '8px', // Rounded rectangle
          padding: '10px 15px',
          textAlign: 'center',
          boxShadow: selected ? `0 0 0 1px ${currentStyle.borderColor}` : '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div className="flex items-center justify-center gap-x-1.5 w-full" style={{ minWidth: 0 }}>
          <FileText size={16} className={`${currentStyle.iconColor} flex-shrink-0`} />
          <strong
            className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-grow"
            style={{ color: currentStyle.textColor }}
            title={data.label || 'Note'}
          >
            {data.label || 'Note'}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default NoteNode;
