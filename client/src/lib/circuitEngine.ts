import type { LogicGate, Connection, GateType } from '@shared/schema';

export class CircuitEngine {
  private gates: Map<string, LogicGate> = new Map();
  private connections: Connection[] = [];

  addGate(gate: LogicGate): void {
    this.gates.set(gate.id, gate);
  }

  removeGate(gateId: string): void {
    this.gates.delete(gateId);
    this.connections = this.connections.filter(
      conn => conn.from !== gateId && conn.to !== gateId
    );
  }

  addConnection(connection: Connection): void {
    this.connections.push(connection);
  }

  removeConnection(connectionId: string): void {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
  }

  processCircuit(weatherInput: boolean): LogicGate[] {
    const processedGates = new Set<string>();
    const gateMap = new Map(Array.from(this.gates.entries()));

    const processGate = (gateId: string): boolean => {
      if (processedGates.has(gateId)) {
        const gate = gateMap.get(gateId);
        return gate ? gate.output : false;
      }

      const gate = gateMap.get(gateId);
      if (!gate) return false;

      // Reset inputs
      gate.inputs = {};

      // Set inputs from connections
      this.connections.forEach(connection => {
        if (connection.to === gateId) {
          if (connection.from === 'weather') {
            gate.inputs[connection.toPort] = weatherInput;
          } else {
            const inputValue = processGate(connection.from);
            gate.inputs[connection.toPort] = inputValue;
          }
        }
      });

      // Calculate output based on gate type
      gate.output = this.calculateGateOutput(gate);
      processedGates.add(gateId);
      
      return gate.output;
    };

    // Process all gates
    Array.from(this.gates.keys()).forEach(gateId => processGate(gateId));
    
    return Array.from(gateMap.values());
  }

  private calculateGateOutput(gate: LogicGate): boolean {
    const inputValues = Object.values(gate.inputs);
    
    switch (gate.type) {
      case 'AND':
        return inputValues.length > 0 && inputValues.every(Boolean);
      case 'OR':
        return inputValues.some(Boolean);
      case 'NOT':
        return !inputValues[0];
      default:
        return false;
    }
  }

  getGates(): LogicGate[] {
    return Array.from(this.gates.values());
  }

  getConnections(): Connection[] {
    return [...this.connections];
  }

  clear(): void {
    this.gates.clear();
    this.connections = [];
  }
}

export function createGate(type: GateType, position: { x: number; y: number }): LogicGate {
  const id = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputsMap: Record<GateType, Record<string, boolean>> = {
    AND: { a: false, b: false },
    OR: { a: false, b: false },
    NOT: { a: false }
  };

  return {
    id,
    type,
    position,
    inputs: inputsMap[type],
    output: false
  };
}
