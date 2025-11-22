/**
 * API Client for GWEN Backend
 * 
 * Connects to the FastAPI backend running on localhost:8000
 */

import fetch from 'node-fetch';

export interface BackendAgentStatus {
  agent_name: string;
  state: string;  // idle, thinking, completed, warning, error
  start_time?: string;
  end_time?: string;
  messages?: string[];
  raw_output?: any;
  error_message?: string | null;
}

export interface BackendAgentSummary {
  agent_name: string;
  status: string;  // Brief status description
  summary: string;  // Summary of agent output
  key_metrics?: any;
  execution_time?: number;
}

export interface BackendOrchestratorReport {
  execution_id: string;
  timestamp?: string;
  start_time?: string;
  end_time?: string;
  total_duration?: number;
  agent_summaries: BackendAgentSummary[];  // Uses AgentSummary, not AgentStatus
  overall_status: string;
  errors?: string[];
}

export interface BackendAgentLogs {
  agent_name: string;
  state?: string;
  execution?: {
    start_time?: string;
    end_time?: string;
    duration_seconds?: number;
  };
  messages?: string[];
  message_count?: number;
  raw_output?: any;
  error?: string | null;
  dashboard_display?: {
    color?: string;
    icon?: string;
    last_message?: string;
  };
  // Fallback for when no data available
  message?: string;
  status?: string;
}

export interface BackendSystemInfo {
  name: string;
  version: string;
  status: string;
  timestamp: string;
  agents: string[];
}

/**
 * API Client for backend communication
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch with error handling
   */
  private async fetch<T>(endpoint: string, options?: any): Promise<T> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      } as any);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<BackendSystemInfo> {
    return this.fetch<BackendSystemInfo>('/');
  }

  /**
   * Get health check
   */
  async getHealth(): Promise<any> {
    return this.fetch('/health');
  }

  /**
   * Trigger status retrieval (execute all agents)
   */
  async retrieveStatus(): Promise<BackendOrchestratorReport> {
    return this.fetch<BackendOrchestratorReport>('/retrieve-status', {
      method: 'POST',
    });
  }

  /**
   * Get all agent statuses
   */
  async getAgentStatus(): Promise<{ [key: string]: BackendAgentStatus }> {
    return this.fetch('/agent-status');
  }

  /**
   * Get specific agent status
   */
  async getAgentStatusByName(agentName: string): Promise<BackendAgentStatus> {
    return this.fetch(`/agent-status/${agentName}`);
  }

  /**
   * Get agent logs
   */
  async getAgentLogs(agentName: string): Promise<BackendAgentLogs> {
    return this.fetch(`/agent-logs/${agentName}`);
  }

  /**
   * Execute a single agent
   */
  async executeAgent(agentName: string): Promise<BackendAgentStatus> {
    return this.fetch(`/agents/${agentName}/execute`, {
      method: 'POST',
    });
  }

  /**
   * List all available agents
   */
  async listAgents(): Promise<any> {
    return this.fetch('/agents');
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(): Promise<any> {
    return this.fetch('/execution-history');
  }
}

// Default client instance
export const apiClient = new ApiClient();
