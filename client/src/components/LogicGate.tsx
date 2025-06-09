import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { LogicGate as LogicGateType } from '@shared/schema';
import { X, Grip } from 'lucide-react';

interface LogicGateProps {
  gate: LogicGateType;
  onDelete: (gateId: string) => void;
  onInputChange: (gateId: string, inputKey: string, value: boolean) => void;
  onPositionChange: (gateId: string, position: { x: number; y: number }) => void;
  onConnectionStart: (gateId: string, port: string, type: 'input' | 'output') => void;
}

const gateStyles = {
  AND: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', symbol: '&' },
  OR: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700', symbol: '≥1' },
  NOT: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', symbol: '¬' }
};

export function LogicGate({ gate, onDelete, onInputChange, onPositionChange, onConnectionStart }: LogicGateProps) {
  const style = gateStyles[gate.type];
  
  const handleDragStart = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      gateId: gate.id,
      offsetX,
      offsetY
    }));
  };

  const handleConnectionPoint = (port: string, type: 'input' | 'output') => {
    onConnectionStart(gate.id, port, type);
  };

  return (
    <div
      className={`absolute cursor-move shadow-lg ${style.bg} rounded-lg p-4 border-2 ${style.border} min-w-[160px]`}
      style={{ left: gate.position.x, top: gate.position.y }}
      draggable
      onDragStart={handleDragStart}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-6 bg-blue-500 rounded border ${style.border} flex items-center justify-center text-white text-xs font-bold`}>
            {style.symbol}
          </div>
          <span className="font-medium text-sm">{gate.type} Gate</span>
        </div>
        <div className="flex items-center space-x-1">
          <Grip className="w-4 h-4 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(gate.id)}
            className="p-1 h-6 w-6 hover:bg-red-100"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-2 mb-3">
        {Object.entries(gate.inputs).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full border-2 border-white shadow cursor-pointer transition-colors ${
                  value ? 'bg-green-400' : 'bg-red-400'
                }`}
                onClick={() => handleConnectionPoint(key, 'input')}
                title={`${key.toUpperCase()} input`}
              />
              <span className="text-xs text-gray-600">Input {key.toUpperCase()}</span>
            </div>
            {gate.type !== 'NOT' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Manual</span>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => onInputChange(gate.id, key, checked)}
                  className="scale-75"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Output */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">Output</span>
          <div
            className={`w-3 h-3 rounded-full border-2 border-white shadow cursor-pointer transition-colors ${
              gate.output ? 'bg-green-400' : 'bg-red-400'
            }`}
            onClick={() => handleConnectionPoint('output', 'output')}
            title="Gate output"
          />
        </div>
        <span className={`text-sm font-bold ${gate.output ? 'text-green-600' : 'text-red-600'}`}>
          {gate.output ? 'TRUE' : 'FALSE'}
        </span>
      </div>
    </div>
  );
}
