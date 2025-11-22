import { Agent, AgentConfig, AgentContext } from '../types.js';

/**
 * Execute an agent with proper context and logging
 */
export async function runAgent(
  agent: Agent,
  config: AgentConfig,
  logCallback: (message: string, level?: 'info' | 'warn' | 'error' | 'success' | 'system') => void
): Promise<void> {
  const context: AgentContext = {
    log: logCallback,
    config,
  };

  try {
    logCallback(`Starting agent: ${config.name}`, 'system');
    
    // Set timeout if specified
    const timeout = config.timeout || 30000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Agent execution timeout')), timeout)
    );

    await Promise.race([
      agent.run(config, context),
      timeoutPromise,
    ]);

    logCallback(`Agent completed: ${config.name}`, 'success');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logCallback(`Agent failed: ${errorMessage}`, 'error');
    throw error;
  }
}
