import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/lib/websocket';
import { useCircuit } from '@/hooks/useCircuit';
import { useWeather } from '@/hooks/useWeather';
import { ToolsPanel } from '@/components/ToolsPanel';
import { CircuitCanvas } from '@/components/CircuitCanvas';
import { OutputPanel } from '@/components/OutputPanel';

import { Button } from '@/components/ui/button';
import { Microchip, Save, Share, Settings } from 'lucide-react';
import type { GateType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface SystemLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function CircuitBuilder() {
  const { toast } = useToast();
  const { weatherData, isLoading: isWeatherLoading, refreshWeather } = useWeather();
  const { 
    circuitState, 
    addGate, 
    removeGate, 
    addConnection, 
    processCircuit, 
    clearCircuit, 
    updateGatePosition 
  } = useCircuit();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  const addLog = useCallback((message: string, type: SystemLog['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [...prev, { timestamp, message, type }].slice(-50));
  }, []);

  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'WEATHER_UPDATE':
        addLog(`Weather updated: ${message.data.temperature}°C`, 'success');
        break;
      case 'CIRCUIT_PROCESSED':
        addLog('Circuit processing completed', 'success');
        break;
      case 'CIRCUIT_SAVED':
        addLog('Circuit saved successfully', 'success');
        break;
      default:
        addLog(`Received: ${message.type}`, 'info');
    }
  }, [addLog]);

  const { isConnected } = useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    addLog('Circuit Builder initialized', 'success');
    addLog(`WebSocket ${isConnected ? 'connected' : 'disconnected'}`, isConnected ? 'success' : 'error');
  }, [isConnected, addLog]);

  const handleProcessCircuit = useCallback(async () => {
    setIsProcessing(true);
    addLog('Processing circuit...', 'info');
    
    try {
      const processedGates = processCircuit(weatherData.logicState);
      
      // Send to backend for processing
      await apiRequest('POST', '/api/circuits/process', {
        gates: processedGates,
        connections: circuitState.connections,
        weatherInput: weatherData.logicState
      });
      
      addLog('Circuit processed successfully', 'success');
      toast({
        title: "Circuit Processed",
        description: "Logic gates have been updated with current inputs.",
      });
    } catch (error) {
      addLog('Circuit processing failed', 'error');
      toast({
        title: "Processing Failed",
        description: "Failed to process circuit logic.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [processCircuit, weatherData.logicState, circuitState.connections, toast, addLog]);

  const handleSaveCircuit = useCallback(async () => {
    try {
      await apiRequest('POST', '/api/circuits', {
        name: `Circuit ${new Date().toLocaleString()}`,
        gates: circuitState.gates,
        connections: circuitState.connections
      });
      
      addLog('Circuit saved', 'success');
      toast({
        title: "Circuit Saved",
        description: "Your circuit has been saved successfully.",
      });
    } catch (error) {
      addLog('Failed to save circuit', 'error');
      toast({
        title: "Save Failed",
        description: "Failed to save circuit.",
        variant: "destructive",
      });
    }
  }, [circuitState, toast, addLog]);

  const handleRefreshWeather = useCallback(() => {
    addLog('Refreshing weather data...', 'info');
    refreshWeather();
  }, [refreshWeather, addLog]);

  const handleInputChange = useCallback((gateId: string, inputKey: string, value: boolean) => {
    // For now, just log the change - in a full implementation, this would update the gate
    addLog(`Gate ${gateId} input ${inputKey} changed to ${value}`, 'info');
  }, [addLog]);

  const circuitOutputs = circuitState.gates.map(gate => ({
    id: gate.id,
    type: gate.type,
    output: gate.output
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Microchip className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Logic Processor Engine</h1>
              <p className="text-sm text-slate-500">Real-World Integration Circuit Builder</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button onClick={handleSaveCircuit} className="bg-blue-500 hover:bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Save Circuit
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        {/* Tools Panel */}
        <ToolsPanel
          weatherData={weatherData}
          isWeatherLoading={isWeatherLoading}
          onRefreshWeather={handleRefreshWeather}
          onDragStart={() => {}} // Handled in CircuitCanvas
          circuitOutputs={circuitOutputs}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Circuit Canvas */}
          <div className="flex-1">
            <CircuitCanvas
              gates={circuitState.gates}
              connections={circuitState.connections}
              onAddGate={addGate}
              onRemoveGate={removeGate}
              onUpdateGatePosition={updateGatePosition}
              onInputChange={handleInputChange}
              onAddConnection={addConnection}
              onClearCircuit={clearCircuit}
              onProcessCircuit={handleProcessCircuit}
              isProcessing={isProcessing}
            />
          </div>


        </div>

        {/* Output Panel */}
        <OutputPanel
          gates={circuitState.gates}
          connectionCount={circuitState.connections.length}
          weatherInput={weatherData.logicState}
          systemLogs={systemLogs}
        />
      </div>
    </div>
  );
}
