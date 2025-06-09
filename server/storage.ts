import { circuits, weatherData, type Circuit, type InsertCircuit, type WeatherData, type InsertWeather } from "@shared/schema";

export interface IStorage {
  // Circuit operations
  getCircuit(id: number): Promise<Circuit | undefined>;
  createCircuit(circuit: InsertCircuit): Promise<Circuit>;
  updateCircuit(id: number, circuit: Partial<InsertCircuit>): Promise<Circuit | undefined>;
  deleteCircuit(id: number): Promise<boolean>;
  
  // Weather operations
  getLatestWeather(): Promise<WeatherData | undefined>;
  createWeatherData(weather: InsertWeather): Promise<WeatherData>;
}

export class MemStorage implements IStorage {
  private circuits: Map<number, Circuit>;
  private weatherData: Map<number, WeatherData>;
  private currentCircuitId: number;
  private currentWeatherId: number;

  constructor() {
    this.circuits = new Map();
    this.weatherData = new Map();
    this.currentCircuitId = 1;
    this.currentWeatherId = 1;
  }

  async getCircuit(id: number): Promise<Circuit | undefined> {
    return this.circuits.get(id);
  }

  async createCircuit(insertCircuit: InsertCircuit): Promise<Circuit> {
    const id = this.currentCircuitId++;
    const circuit: Circuit = {
      ...insertCircuit,
      id,
      createdAt: new Date(),
    };
    this.circuits.set(id, circuit);
    return circuit;
  }

  async updateCircuit(id: number, updates: Partial<InsertCircuit>): Promise<Circuit | undefined> {
    const existing = this.circuits.get(id);
    if (!existing) return undefined;
    
    const updated: Circuit = { ...existing, ...updates };
    this.circuits.set(id, updated);
    return updated;
  }

  async deleteCircuit(id: number): Promise<boolean> {
    return this.circuits.delete(id);
  }

  async getLatestWeather(): Promise<WeatherData | undefined> {
    const weatherArray = Array.from(this.weatherData.values());
    return weatherArray.sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())[0];
  }

  async createWeatherData(insertWeather: InsertWeather): Promise<WeatherData> {
    const id = this.currentWeatherId++;
    const weather: WeatherData = {
      ...insertWeather,
      id,
      timestamp: new Date(),
    };
    this.weatherData.set(id, weather);
    return weather;
  }
}

export const storage = new MemStorage();
