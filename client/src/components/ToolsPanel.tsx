import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CloudSun, Thermometer, Activity } from 'lucide-react';
import type { GateType } from '@shared/schema';
import type { WeatherData } from '@/hooks/useWeather';

interface ToolsPanelProps {
  weatherData: WeatherData;
  isWeatherLoading: boolean;
  onRefreshWeather: () => void;
  onDragStart: (gateType: GateType) => void;
  circuitOutputs: Array<{ id: string; type: GateType; output: boolean }>;
}

const gateTypes: Array<{ type: GateType; symbol: string; color: string; description: string }> = [
  { type: 'AND', symbol: '&', color: 'bg-blue-500', description: 'Output true when both inputs are true' },
  { type: 'OR', symbol: '≥1', color: 'bg-amber-500', description: 'Output true when either input is true' },
  { type: 'NOT', symbol: '¬', color: 'bg-red-500', description: 'Output opposite of input' }
];

export function ToolsPanel({ weatherData, isWeatherLoading, onRefreshWeather, onDragStart, circuitOutputs }: ToolsPanelProps) {
  const handleDragStart = (e: React.DragEvent, gateType: GateType) => {
    e.dataTransfer.setData('text/plain', gateType);
    onDragStart(gateType);
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Logic Gates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Logic Gates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gateTypes.map(({ type, symbol, color, description }) => (
              <div
                key={type}
                className="p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, type)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-6 ${color} rounded border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                      {symbol}
                    </div>
                    <span className="font-medium">{type} Gate</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weather Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CloudSun className="w-5 h-5 mr-2 text-blue-500" />
              Weather Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      <Thermometer className="w-4 h-4 mr-1" />
                      Temperature
                    </span>
                    <span className="text-lg font-bold text-amber-600">
                      {weatherData.temperature}°C
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((weatherData.temperature / 50) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0°C</span>
                    <span>50°C</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Logic Trigger (&gt;25°C)</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${weatherData.logicState ? 'bg-green-400' : 'bg-red-400'}`} />
                      <Badge variant={weatherData.logicState ? 'default' : 'destructive'} className="text-xs">
                        {weatherData.logicState ? 'TRUE' : 'FALSE'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={onRefreshWeather}
                  disabled={isWeatherLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isWeatherLoading ? 'animate-spin' : ''}`} />
                  Refresh Weather
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Outputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Outputs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {circuitOutputs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No gates in circuit</p>
              ) : (
                circuitOutputs.map((gate) => (
                  <div key={gate.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">
                      {gate.type} Gate
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${gate.output ? 'bg-green-400' : 'bg-red-400'}`} />
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

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Drag gates to the canvas</li>
              <li>• Click connection points to link gates</li>
              <li>• Weather data updates inputs automatically</li>
              <li>• Watch outputs change in real-time</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
