import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertCircuitSchema, insertWeatherSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast to all connected clients
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Weather API endpoint
  app.get('/api/weather', async (req, res) => {
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40&longitude=0&current_weather=true');
      const data = await response.json();
      
      const weatherData = {
        temperature: data.current_weather.temperature,
        condition: data.current_weather.weathercode < 3 ? 'Clear' : 'Cloudy',
        location: 'Default Location'
      };

      // Store weather data
      await storage.createWeatherData(weatherData);

      // Broadcast weather update to all clients
      broadcast({
        type: 'WEATHER_UPDATE',
        data: {
          ...weatherData,
          logicState: weatherData.temperature > 25
        }
      });

      res.json({
        ...weatherData,
        logicState: weatherData.temperature > 25
      });
    } catch (error) {
      console.error('Weather API error:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  // Circuit endpoints
  app.post('/api/circuits', async (req, res) => {
    try {
      const circuitData = insertCircuitSchema.parse(req.body);
      const circuit = await storage.createCircuit(circuitData);
      
      // Broadcast circuit update
      broadcast({
        type: 'CIRCUIT_SAVED',
        data: circuit
      });

      res.json(circuit);
    } catch (error) {
      res.status(400).json({ error: 'Invalid circuit data' });
    }
  });

  app.get('/api/circuits/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const circuit = await storage.getCircuit(id);
      
      if (!circuit) {
        return res.status(404).json({ error: 'Circuit not found' });
      }

      res.json(circuit);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch circuit' });
    }
  });

  app.put('/api/circuits/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCircuitSchema.partial().parse(req.body);
      const circuit = await storage.updateCircuit(id, updates);
      
      if (!circuit) {
        return res.status(404).json({ error: 'Circuit not found' });
      }

      // Broadcast circuit update
      broadcast({
        type: 'CIRCUIT_UPDATED',
        data: circuit
      });

      res.json(circuit);
    } catch (error) {
      res.status(400).json({ error: 'Invalid circuit data' });
    }
  });

  // Circuit processing endpoint
  app.post('/api/circuits/process', async (req, res) => {
    try {
      const { gates, connections, weatherInput } = req.body;
      
      // Process circuit logic
      const processedGates = processCircuitLogic(gates, connections, weatherInput);
      
      // Broadcast processed results
      broadcast({
        type: 'CIRCUIT_PROCESSED',
        data: {
          gates: processedGates,
          connections,
          weatherInput
        }
      });

      res.json({
        gates: processedGates,
        connections,
        weatherInput
      });
    } catch (error) {
      res.status(500).json({ error: 'Circuit processing failed' });
    }
  });

  return httpServer;
}

function processCircuitLogic(gates: any[], connections: any[], weatherInput: boolean) {
  const gateMap = new Map(gates.map(gate => [gate.id, { ...gate }]));
  
  // Set weather input for gates that are connected to weather
  connections.forEach(connection => {
    if (connection.from === 'weather') {
      const toGate = gateMap.get(connection.to);
      if (toGate) {
        toGate.inputs[connection.toPort] = weatherInput;
      }
    }
  });

  // Process gates in dependency order
  const processedGates = new Set<string>();
  
  function processGate(gateId: string): boolean {
    if (processedGates.has(gateId)) {
      const gate = gateMap.get(gateId);
      return gate ? gate.output : false;
    }

    const gate = gateMap.get(gateId);
    if (!gate) return false;

    // Process input dependencies first
    connections.forEach(connection => {
      if (connection.to === gateId && connection.from !== 'weather') {
        const inputValue = processGate(connection.from);
        gate.inputs[connection.toPort] = inputValue;
      }
    });

    // Calculate gate output
    switch (gate.type) {
      case 'AND':
        gate.output = Object.values(gate.inputs).every(Boolean);
        break;
      case 'OR':
        gate.output = Object.values(gate.inputs).some(Boolean);
        break;
      case 'NOT':
        gate.output = !Object.values(gate.inputs)[0];
        break;
      default:
        gate.output = false;
    }

    processedGates.add(gateId);
    return gate.output;
  }

  // Process all gates
  Array.from(gateMap.keys()).forEach(gateId => processGate(gateId));
  
  return Array.from(gateMap.values());
}
