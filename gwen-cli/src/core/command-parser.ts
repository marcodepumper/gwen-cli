import { Command } from '../types.js';

/**
 * Parse a command string into command name and arguments
 */
export function parseCommand(input: string): { command: string; args: string[] } | null {
  const trimmed = input.trim();
  
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  return { command, args };
}

/**
 * Check if input should trigger command palette
 */
export function shouldShowCommandPalette(input: string): boolean {
  return input.trim() === '/';
}

/**
 * Filter commands based on partial input
 */
export function filterCommands(commands: Command[], input: string): Command[] {
  if (input === '/' || input === '') {
    return commands;
  }

  const searchTerm = input.startsWith('/') ? input.slice(1).toLowerCase() : input.toLowerCase();
  
  return commands.filter(cmd => 
    cmd.name.toLowerCase().includes(searchTerm) ||
    (cmd.aliases?.some(alias => alias.toLowerCase().includes(searchTerm)))
  );
}
