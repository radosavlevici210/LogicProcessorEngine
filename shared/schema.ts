import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const circuits = pgTable("circuits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gates: jsonb("gates").notNull(),
  connections: jsonb("connections").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  temperature: integer("temperature").notNull(),
  condition: text("condition").notNull(),
  location: text("location").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertCircuitSchema = createInsertSchema(circuits).pick({
  name: true,
  gates: true,
  connections: true,
});

export const insertWeatherSchema = createInsertSchema(weatherData).pick({
  temperature: true,
  condition: true,
  location: true,
});

export type InsertCircuit = z.infer<typeof insertCircuitSchema>;
export type Circuit = typeof circuits.$inferSelect;
export type InsertWeather = z.infer<typeof insertWeatherSchema>;
export type WeatherData = typeof weatherData.$inferSelect;

// Logic gate types
export type GateType = 'AND' | 'OR' | 'NOT';

export interface LogicGate {
  id: string;
  type: GateType;
  position: { x: number; y: number };
  inputs: Record<string, boolean>;
  output: boolean;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
}

export interface CircuitState {
  gates: LogicGate[];
  connections: Connection[];
  weatherInput: boolean;
}
