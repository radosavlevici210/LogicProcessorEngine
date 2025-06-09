import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LogicGate } from './LogicGate';
import { Play, Pause, RotateCcw, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import type { LogicGate as LogicGateType, Connection, GateType } from '@shared/schema';

interface CircuitCanvasProps {
  gates: LogicGateType[];
  connections: Connection[];
  onAddGate: (type: GateType, position: { x: number; y: number }) => void;
  onRemoveGate: (gateId: string) => void;
  onUpdateGatePosition: (gateId: string, position: { x: number; y: number }) => void;
  onInputChange: (gateId: string, inputKey: string, value: boolean) => void;
  onAddConnection: (from: string, to: string, fromPort: string, toPort: string) => void;
  onClearCircuit: () => void;
  onProcessCircuit: () => void;
  isProcessing: boolean;
}

export function CircuitCanvas({
  gates,
  connections,
  onAddGate,
  onRemoveGate,
  onUpdateGatePosition,
  onInputChange,
  onAddConnection,
  onClearCircuit,
  onProcessCircuit,
  isProcessing
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [connectionStart, setConnectionStart] = useState<{
    gateId: string;
    port: string;
    type: 'input' | 'output';
  } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const data = e.dataTransfer.getData('text/plain');
    
    try {
      // Try to parse as gate movement data
      const moveData = JSON.parse(data);
      if (moveData.gateId) {
        const newPosition = {
          x: e.clientX - rect.left - moveData.offsetX,
          y: e.clientY - rect.top - moveData.offsetY
        };
        onUpdateGatePosition(moveData.gateId, newPosition);
        return;
      }
    } catch {
      // If parsing fails, treat as new gate type
      const gateType = data as GateType;
      if (['AND', 'OR', 'NOT'].includes(gateType)) {
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        onAddGate(gateType, position);
      }
    }
  }, [onAddGate, onUpdateGatePosition]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleConnectionStart = useCallback((gateId: string, port: string, type: 'input' | 'output') => {
    if (connectionStart) {
      // Complete connection
      if (connectionStart.type !== type) {
        const from = connectionStart.type === 'output' ? connectionStart.gateId : gateId;
        const to = connectionStart.type === 'output' ? gateId : connectionStart.gateId;
        const fromPort = connectionStart.type === 'output' ? connectionStart.port : port;
        const toPort = connectionStart.type === 'output' ? port : connectionStart.port;
        
        onAddConnection(from, to, fromPort, toPort);
      }
      setConnectionStart(null);
    } else {
      // Start connection
      setConnectionStart({ gateId, port, type });
    }
  }, [connectionStart, onAddConnection]);

  const renderConnections = () => {
    return connections.map((connection) => {
      const fromGate = gates.find(g => g.id === connection.from);
      const toGate = gates.find(g => g.id === connection.to);
      
      if (!fromGate || !toGate) return null;

      const fromX = fromGate.position.x + 160;
      const fromY = fromGate.position.y + 60;
      const toX = toGate.position.x;
      const toY = toGate.position.y + 40;

      const midX = (fromX + toX) / 2;

      return (
        <path
          key={connection.id}
          d={`M ${fromX} ${fromY} Q ${midX} ${fromY} ${midX} ${toY} Q ${midX} ${toY} ${toX} ${toY}`}
          stroke="#3B82F6"
          strokeWidth="3"
          fill="none"
          className="transition-all duration-300"
        />
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onProcessCircuit}
              disabled={isProcessing}
              className="bg-green-500 hover:bg-green-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Circuit
            </Button>
            <Button variant="outline" onClick={onClearCircuit}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <div className="h-6 w-px bg-slate-300" />
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Zoom:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono text-slate-700 w-12 text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-slate-50">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Circuit Elements */}
        <div
          ref={canvasRef}
          className="relative w-full h-full"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
        >
          {/* Gates */}
          {gates.map((gate) => (
            <LogicGate
              key={gate.id}
              gate={gate}
              onDelete={onRemoveGate}
              onInputChange={onInputChange}
              onPositionChange={onUpdateGatePosition}
              onConnectionStart={handleConnectionStart}
            />
          ))}

          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {renderConnections()}
          </svg>

          {/* Empty State */}
          {gates.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Drag logic gates here to build your circuit</p>
                <p className="text-sm text-gray-400 mt-1">Connect gates by clicking on connection points</p>
              </div>
            </div>
          )}

          {/* Connection preview */}
          {connectionStart && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded shadow-lg">
                Click on a {connectionStart.type === 'output' ? 'input' : 'output'} pin to complete connection
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
