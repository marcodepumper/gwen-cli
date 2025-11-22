import { Box, Text } from 'ink';
import { AgentResult } from '../types';

interface AgentDetailViewProps {
  agents: AgentResult[];
  selectedIndex: number;
}

/**
 * AgentDetailView - Full-screen detail view for browsing agent results
 */
export const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agents, selectedIndex }) => {
  if (agents.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">No agent results to display</Text>
        <Text dimColor>Run /run-agent --auto first</Text>
      </Box>
    );
  }

  const agent = agents[selectedIndex];
  if (!agent) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Invalid agent selection</Text>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('completed') || s.includes('success')) return 'green';
    if (s.includes('error') || s.includes('failed')) return 'red';
    if (s.includes('warning')) return 'yellow';
    return 'cyan';
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="magenta" padding={1}>
      {/* Header with navigation */}
      <Box marginBottom={1}>
        <Text bold color="magenta">Agent Details </Text>
        <Text dimColor>
          ({selectedIndex + 1}/{agents.length}) 
        </Text>
        <Text dimColor> | Use ← → or Tab to navigate | Esc to exit</Text>
      </Box>

      {/* Agent Name */}
      <Box marginBottom={1}>
        <Text bold color="cyan">Agent: </Text>
        <Text bold>{agent.name}</Text>
      </Box>

      {/* Status */}
      <Box marginBottom={1}>
        <Text bold>Status: </Text>
        <Text color={getStatusColor(agent.status || agent.state || 'unknown')}>
          {agent.status || agent.state || 'unknown'}
        </Text>
      </Box>

      {/* Execution Time */}
      {agent.execution_time !== undefined && agent.execution_time !== null && (
        <Box marginBottom={1}>
          <Text bold>Execution Time: </Text>
          <Text>{agent.execution_time.toFixed(2)}s</Text>
        </Box>
      )}

      {/* Summary */}
      {agent.summary && (
        <Box marginBottom={1} flexDirection="column">
          <Text bold color="green">Summary:</Text>
          <Box paddingLeft={2}>
            <Text>{agent.summary}</Text>
          </Box>
        </Box>
      )}

      {/* Key Metrics */}
      {agent.key_metrics && Object.keys(agent.key_metrics).length > 0 && (
        <Box marginBottom={1} flexDirection="column">
          <Text bold color="yellow">Key Metrics:</Text>
          <Box paddingLeft={2} flexDirection="column">
            {Object.entries(agent.key_metrics).map(([key, value]) => (
              <Box key={key}>
                <Text dimColor>{key}: </Text>
                <Text>{JSON.stringify(value)}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Error */}
      {agent.error && (
        <Box marginBottom={1} flexDirection="column">
          <Text bold color="red">Error:</Text>
          <Box paddingLeft={2}>
            <Text color="red">{agent.error}</Text>
          </Box>
        </Box>
      )}

      {/* Messages */}
      {agent.messages && agent.messages.length > 0 && (
        <Box marginBottom={1} flexDirection="column">
          <Text bold color="cyan">Messages ({agent.messages.length}):</Text>
          <Box paddingLeft={2} flexDirection="column">
            {agent.messages.slice(0, 10).map((msg, i) => (
              <Box key={i}>
                <Text dimColor>[{i + 1}] </Text>
                <Text>{msg}</Text>
              </Box>
            ))}
            {agent.messages.length > 10 && (
              <Text dimColor>... and {agent.messages.length - 10} more messages</Text>
            )}
          </Box>
        </Box>
      )}

      {/* Raw Output Preview */}
      {agent.raw_output && (
        <Box marginBottom={1} flexDirection="column">
          <Text bold color="magenta">Raw Output (preview):</Text>
          <Box paddingLeft={2} flexDirection="column">
            {JSON.stringify(agent.raw_output, null, 2)
              .split('\n')
              .slice(0, 8)
              .map((line, i) => (
                <Text key={i} dimColor>
                  {line}
                </Text>
              ))}
            <Text dimColor>...</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
