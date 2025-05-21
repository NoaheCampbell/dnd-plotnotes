'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import { NodeVisualConfig, ConfigurableNodeData } from './node-configs'; // Import the configs

interface ConfigurableNodeProps extends NodeProps<ConfigurableNodeData> {
  config: NodeVisualConfig;
}

const ConfigurableNode: React.FC<ConfigurableNodeProps> = ({ data, config, isConnectable, selected }) => {
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const currentModeStyles = isDarkMode ? config.dark : config.light;
  const IconComponent = config.icon;

  const handleStyle = {
    width: 10,
    height: 10,
    background: '#555',
    border: `1.5px solid #fff`,
    borderRadius: '50%',
    zIndex: 10,
  };

  // Common style for the main interactive div for clip-path shapes like NPC, Location, Encounter
  const shapeBorderStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: currentModeStyles.borderColor,
    clipPath: config.clipPath, // Apply shape
    position: 'relative',
    boxSizing: 'border-box',
    boxShadow: selected ? `0 0 0 1px ${currentModeStyles.borderColor}` : '0 1px 3px rgba(0,0,0,0.1)',
  };

  const shapeContentStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',      // Border thickness effect
    left: '2px',
    right: '2px',
    bottom: '2px',
    background: currentModeStyles.background,
    clipPath: config.clipPath, // Content area must also be clipped for shape
    padding: config.padding,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderRadius: config.borderRadius, // For circle anti-aliasing
  };

  // Style for standard rectangular nodes like NoteNode
  const rectangularNodeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: currentModeStyles.background,
    border: `2px solid ${currentModeStyles.borderColor}`,
    borderRadius: config.borderRadius || '0px', // Use config.borderRadius (e.g., for NoteNode)
    padding: config.padding,
    textAlign: 'center',
    boxShadow: selected ? `0 0 0 1px ${currentModeStyles.borderColor}` : '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  };

  const resizerLineClassName = isDarkMode ? config.resizer.lineClassNameDark : config.resizer.lineClassNameLight;
  const resizerHandleClassName = isDarkMode ? config.resizer.handleClassNameDark : config.resizer.handleClassNameLight;

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
        minWidth={config.resizer.minWidth}
        minHeight={config.resizer.minHeight}
        keepAspectRatio={config.resizer.keepAspectRatio}
        lineClassName={resizerLineClassName}
        handleClassName={resizerHandleClassName}
      />
      <Handle id="top" type="target" position={Position.Top} isConnectable={isConnectable} style={{...handleStyle, top: '-5px'}} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={isConnectable} style={{...handleStyle, bottom: '-5px'}} />
      <Handle id="left" type="target" position={Position.Left} isConnectable={isConnectable} style={{...handleStyle, left: '-5px'}} />
      <Handle id="right" type="source" position={Position.Right} isConnectable={isConnectable} style={{...handleStyle, right: '-5px'}} />
      
      <div style={config.clipPath ? shapeBorderStyle : rectangularNodeStyle}>
        {config.clipPath ? (
          // For clipped shapes (NPC, Location, Encounter)
          <div style={shapeContentStyle}>
            <div className="flex items-center justify-center gap-x-1.5 w-full" style={{ minWidth: 0 }}>
              <IconComponent size={16} className={`${currentModeStyles.iconColor} flex-shrink-0`} />
              <strong
                className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-grow"
                style={{ color: currentModeStyles.textColor }}
                title={data.label || config.defaultLabel}
              >
                {data.label || config.defaultLabel}
              </strong>
            </div>
          </div>
        ) : (
          // For rectangular nodes (Note)
          <div className="flex items-center justify-center gap-x-1.5 w-full" style={{ minWidth: 0 }}>
            <IconComponent size={16} className={`${currentModeStyles.iconColor} flex-shrink-0`} />
            <strong
              className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-grow"
              style={{ color: currentModeStyles.textColor }}
              title={data.label || config.defaultLabel}
            >
              {data.label || config.defaultLabel}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurableNode; 