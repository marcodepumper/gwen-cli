import { Box, Text } from 'ink';
import { LogEntry } from '../types';

interface OutputPanelProps {
  logs: LogEntry[];
  maxHeight?: number;
  scrollOffset?: number;
}

/**
 * OutputPanel - Displays scrolling log output with color-coded levels
 */
export const OutputPanel: React.FC<OutputPanelProps> = ({ logs, maxHeight = 15, scrollOffset = 0 }) => {
  // Calculate visible logs based on scroll offset
  // If scrollOffset is 0, show most recent logs (default behavior)
  // Otherwise, show logs starting from the offset
  const totalLogs = logs.length;
  const startIndex = scrollOffset === 0 ? Math.max(0, totalLogs - maxHeight) : Math.max(0, scrollOffset);
  const endIndex = Math.min(totalLogs, startIndex + maxHeight);
  const visibleLogs = logs.slice(startIndex, endIndex);
  
  // Show scroll indicator if there are more logs
  const hasMoreAbove = startIndex > 0;
  const hasMoreBelow = endIndex < totalLogs;

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'red';
      case 'warn':
        return 'yellow';
      case 'success':
        return 'green';
      case 'system':
        return 'cyan';
      default:
        return 'white';
    }
  };

  const getLevelPrefix = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return '✖';
      case 'warn':
        return '⚠';
      case 'success':
        return '✓';
      case 'system':
        return '◆';
      default:
        return '•';
    }
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      paddingY={0}
      minHeight={maxHeight}
    >
      {hasMoreAbove && (
        <Box>
          <Text dimColor>↑ More logs above (use ↑ to scroll up)</Text>
        </Box>
      )}
      {visibleLogs.length === 0 ? (
        <Box paddingY={1}>
          <Text dimColor>Waiting for input...</Text>
        </Box>
      ) : (
        visibleLogs.map((log, index) => (
          <Box key={startIndex + index} marginY={0}>
            <Text color={getLevelColor(log.level)}>
              {getLevelPrefix(log.level)}{' '}
            </Text>
            <Text dimColor>
              [{log.timestamp.toLocaleTimeString()}]
            </Text>
            {log.source && (
              <Text color="cyan"> [{log.source}] </Text>
            )}
            <Text> {log.message}</Text>
          </Box>
        ))
      )}
      {hasMoreBelow && (
        <Box>
          <Text dimColor>↓ More logs below (use ↓ to scroll down)</Text>
        </Box>
      )}
    </Box>
  );
};
