/**
 * Example Agent
 * 
 * This demonstrates how to build a GWEN agent.
 * Agents receive a config and context, and can log messages at different levels.
 */

export async function run(config, context) {
  context.log('Example agent starting...', 'info');
  
  try {
    // Simulate some async work
    context.log('Fetching data...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log different message types
    context.log('Data retrieved successfully', 'success');
    context.log(`Agent: ${config.name} v${config.version}`, 'info');
    context.log('This is a warning message', 'warn');
    
    // Simulate more work
    context.log('Processing data...', 'info');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    context.log('Example agent completed', 'success');
  } catch (error) {
    context.log(`Error: ${error.message}`, 'error');
    throw error;
  }
}
