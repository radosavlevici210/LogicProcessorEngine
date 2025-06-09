import { useState, useCallback } from 'react';
import type { LogicGate, Connection, GateType } from '@shared/schema';
import { CircuitEngine, createGate } from '@/lib/circuitEngine';

export interface CircuitState {
  gates: LogicGate[];
  connections: Connection[];
}

export function useCircuit() {
  const [circuitEngine] = useState(() => new CircuitEngine());
  const [circuitState, setCircuitState] = useState<CircuitState>({
    gates: [],
    connections: []
  });

  const addGate = useCallback((type: GateType, position: { x: number; y: number }) => {
    const newGate = createGate(type, position);
    circuitEngine.addGate(newGate);
    
    setCircuitState({
      gates: circuitEngine.getGates(),
      connections: circuitEngine.getConnections()
    });
    
    return newGate;
  }, [circuitEngine]);

  const removeGate = useCallback((gateId: string) => {
    circuitEngine.removeGate(gateId);
    
    setCircuitState({
      gates: circuitEngine.getGates(),
      connections: circuitEngine.getConnections()
    });
  }, [circuitEngine]);

  const addConnection = useCallback((from: string, to: string, fromPort: string, toPort: string) => {
    const connection: Connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      fromPort,
      toPort
    };
    
    circuitEngine.addConnection(connection);
    
    setCircuitState({
      gates: circuitEngine.getGates(),
      connections: circuitEngine.getConnections()
    });
    
    return connection;
  }, [circuitEngine]);

  const removeConnection = useCallback((connectionId: string) => {
    circuitEngine.removeConnection(connectionId);
    
    setCircuitState({
      gates: circuitEngine.getGates(),
      connections: circuitEngine.getConnections()
    });
  }, [circuitEngine]);

  const processCircuit = useCallback((weatherInput: boolean) => {
    const processedGates = circuitEngine.processCircuit(weatherInput);
    
    setCircuitState({
      gates: processedGates,
      connections: circuitEngine.getConnections()
    });
    
    return processedGates;
  }, [circuitEngine]);

  const clearCircuit = useCallback(() => {
    circuitEngine.clear();
    
    setCircuitState({
      gates: [],
      connections: []
    });
  }, [circuitEngine]);

  const updateGatePosition = useCallback((gateId: string, position: { x: number; y: number }) => {
    const gates = circuitEngine.getGates();
    const gate = gates.find(g => g.id === gateId);
    
    if (gate) {
      gate.position = position;
      setCircuitState({
        gates: circuitEngine.getGates(),
        connections: circuitEngine.getConnections()
      });
    }
  }, [circuitEngine]);

  return {
    circuitState,
    addGate,
    removeGate,
    addConnection,
    removeConnection,
    processCircuit,
    clearCircuit,
    updateGatePosition
  };
}
