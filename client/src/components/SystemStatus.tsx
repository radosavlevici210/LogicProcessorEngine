// ========================================================
// LOGIC PROCESSOR + AI API SYSTEM – Real World Integration
// © 2025 Ervin Remus Radosavlevici – All Rights Reserved
// Email: ervin210@icloud.com
// Timestamp: 2025-06-09T00:00Z
// License: Use allowed for educational, production, and AI system integration
// ========================================================

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Wifi, Activity, Clock } from "lucide-react";
import { useWebSocket } from "@/lib/websocket";

interface SystemStatusData {
  cpuUsage: number;
  memoryUsage: number;
  networkStatus: 'connected' | 'disconnected' | 'degraded';
  uptime: number;
  activeProcesses: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatusData>({
    cpuUsage: 0,
    memoryUsage: 0,
    networkStatus: 'connected',
    uptime: 0,
    activeProcesses: 0,
    systemHealth: 'healthy'
  });

  const { isConnected } = useWebSocket((message) => {
    if (message.type === 'system_status') {
      setStatus(message.data);
    }
  });

  useEffect(() => {
    // Simulate system status updates
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkStatus: isConnected ? 'connected' : 'disconnected',
        uptime: prev.uptime + 1,
        activeProcesses: Math.max(1, prev.activeProcesses + Math.floor((Math.random() - 0.5) * 3)),
        systemHealth: prev.cpuUsage > 80 || prev.memoryUsage > 90 ? 'warning' : 'healthy'
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
      case 'disconnected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Health */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Health</span>
          </div>
          <Badge className={getStatusColor(status.systemHealth)}>
            {status.systemHealth.toUpperCase()}
          </Badge>
        </div>

        {/* Network Status */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Network</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              status.networkStatus === 'connected' ? 'bg-green-500' :
              status.networkStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <Badge className={getStatusColor(status.networkStatus)}>
              {status.networkStatus.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">CPU Usage</span>
          <span className="text-sm font-mono">{status.cpuUsage.toFixed(1)}%</span>
        </div>

        {/* Memory Usage */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Memory Usage</span>
          <span className="text-sm font-mono">{status.memoryUsage.toFixed(1)}%</span>
        </div>

        {/* Uptime */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Uptime</span>
          </div>
          <span className="text-sm font-mono">{formatUptime(status.uptime)}</span>
        </div>

        {/* Active Processes */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Active Processes</span>
          <Badge variant="outline">{status.activeProcesses}</Badge>
        </div>

        {/* Production Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Production Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}