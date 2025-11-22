/**
 * Service Status Agent
 * 
 * Checks the status of various external services.
 */

export async function run(config, context) {
  context.log('Checking service status...', 'info');
  
  const services = [
    { name: 'API Gateway', url: 'https://api.example.com', status: 'operational' },
    { name: 'Database', url: 'db.example.com', status: 'operational' },
    { name: 'Cache', url: 'cache.example.com', status: 'degraded' },
  ];
  
  try {
    for (const service of services) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (service.status === 'operational') {
        context.log(`✓ ${service.name}: ${service.status}`, 'success');
      } else if (service.status === 'degraded') {
        context.log(`⚠ ${service.name}: ${service.status}`, 'warn');
      } else {
        context.log(`✖ ${service.name}: ${service.status}`, 'error');
      }
    }
    
    context.log('Service status check complete', 'success');
  } catch (error) {
    context.log(`Error checking services: ${error.message}`, 'error');
    throw error;
  }
}
