import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Activity, Zap, AlertCircle } from 'lucide-react';
import type { LogicGate } from '@shared/schema';

interface OutputPanelProps {
  gates: LogicGate[];
  connectionCount: number;
  weatherInput: boolean;
  systemLogs: Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'error' }>;
}

export function OutputPanel({ gates, connectionCount, weatherInput, systemLogs }: OutputPanelProps) {
  const trueOutputs = gates.filter(gate => gate.output).length;
  const falseOutputs = gates.length - trueOutputs;

  const generateTruthTable = () => {
    if (gates.length === 0) return [];
    
    // Generate a simple truth table for demonstration
    const combinations = [
      { weather: false, inputB: false },
      { weather: false, inputB: true },
      { weather: true, inputB: false },
      { weather: true, inputB: true }
    ];

    return combinations.map(combo => {
      const outputs: Record<string, boolean> = {};
      
      gates.forEach(gate => {
        switch (gate.type) {
          case 'AND':
            outputs[gate.id] = combo.weather && combo.inputB;
            break;
          case 'OR':
            outputs[gate.id] = combo.weather || combo.inputB;
            break;
          case 'NOT':
            outputs[gate.id] = !combo.weather;
            break;
        }
      });

      return {
        ...combo,
        outputs
      };
    });
  };

  const truthTable = generateTruthTable();

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex-shrink-0 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Circuit Outputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Circuit Outputs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No gates in circuit</p>
              ) : (
                gates.map((gate) => (
                  <div key={gate.id} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-4 rounded border flex items-center justify-center text-xs font-mono ${
                        gate.type === 'AND' ? 'bg-blue-100 border-blue-300 text-blue-700' :
                        gate.type === 'OR' ? 'bg-amber-100 border-amber-300 text-amber-700' :
                        'bg-red-100 border-red-300 text-red-700'
                      }`}>
                        {gate.type === 'AND' ? '&' : gate.type === 'OR' ? '≥1' : '¬'}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{gate.type} Gate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full border-2 border-white shadow ${
                        gate.output ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <Badge variant={gate.output ? 'default' : 'destructive'} className="text-xs">
                        {gate.output ? 'TRUE' : 'FALSE'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Truth Table */}
        {gates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Truth Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="text-left py-2 font-medium text-slate-700">Weather</th>
                      <th className="text-left py-2 font-medium text-slate-700">Input B</th>
                      {gates.map(gate => (
                        <th key={gate.id} className="text-left py-2 font-medium text-slate-700">
                          {gate.type}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono">
                    {truthTable.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-slate-200 ${
                          row.weather === weatherInput ? 'bg-amber-50' : ''
                        }`}
                      >
                        <td className="py-2">{row.weather ? 'TRUE' : 'FALSE'}</td>
                        <td className="py-2">{row.inputB ? 'TRUE' : 'FALSE'}</td>
                        {gates.map(gate => (
                          <td key={gate.id} className={`py-2 ${
                            row.outputs[gate.id] ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {row.outputs[gate.id] ? 'TRUE' : 'FALSE'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Circuit Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Circuit Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gates.length}</div>
                <div className="text-xs text-blue-700">Gates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{connectionCount}</div>
                <div className="text-xs text-blue-700">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{trueOutputs}</div>
                <div className="text-xs text-green-700">True Outputs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{falseOutputs}</div>
                <div className="text-xs text-red-700">False Outputs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
              System Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1 font-mono max-h-32 overflow-y-auto">
              {systemLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-2">No log entries</div>
              ) : (
                systemLogs.slice(-10).map((log, index) => (
                  <div 
                    key={index} 
                    className={`${
                      log.type === 'error' ? 'text-red-700' : 
                      log.type === 'success' ? 'text-green-700' : 'text-blue-700'
                    }`}
                  >
                    [{log.timestamp}] {log.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
