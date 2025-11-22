import * as path from 'path';
import * as fs from 'fs/promises';
import { AgentConfig, Agent } from '../types.js';

/**
 * Discover all agents in the agents directory
 */
export async function discoverAgents(agentsDir: string): Promise<AgentConfig[]> {
  try {
    const entries = await fs.readdir(agentsDir, { withFileTypes: true });
    const agents: AgentConfig[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const agentPath = path.join(agentsDir, entry.name);
        const configPath = path.join(agentPath, 'agent.json');

        try {
          const configData = await fs.readFile(configPath, 'utf-8');
          const config: AgentConfig = JSON.parse(configData);
          agents.push(config);
        } catch (error) {
          // Skip invalid agents
          continue;
        }
      }
    }

    return agents;
  } catch (error) {
    return [];
  }
}

/**
 * Load a specific agent by name
 */
export async function loadAgent(agentsDir: string, agentName: string): Promise<Agent | null> {
  try {
    const agentPath = path.join(agentsDir, agentName, 'index.js');
    const agent = require(agentPath) as Agent;
    
    if (typeof agent.run !== 'function') {
      throw new Error('Agent must export a run() function');
    }

    return agent;
  } catch (error) {
    return null;
  }
}

/**
 * Get agent configuration by name
 */
export async function getAgentConfig(agentsDir: string, agentName: string): Promise<AgentConfig | null> {
  try {
    const configPath = path.join(agentsDir, agentName, 'agent.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    return null;
  }
}
