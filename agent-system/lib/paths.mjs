import path from 'node:path';

export const workspaceRoot = '/home/ubuntu/.openclaw/workspace';
export const agentsRoot = '/home/ubuntu/.openclaw/agents';
export const pipelineRoot = path.join(workspaceRoot, 'pipeline');
export const runtimeRoot = path.join(workspaceRoot, 'agent-system');

export function getSubagentPath(agentId) {
  return path.join(agentsRoot, agentId);
}

export function getVaultPath(agentId) {
  return path.join(getSubagentPath(agentId), 'vault');
}

export function getLogPath(agentId) {
  return path.join(getSubagentPath(agentId), 'logs', `${agentId}.log`);
}

export function getQueuePath(agentId) {
  return path.join(getSubagentPath(agentId), 'task-queue.json');
}

export function getConfigPath(agentId) {
  return path.join(getSubagentPath(agentId), 'config.json');
}

export function getPipelinePaths(agentId) {
  const suffix = agentId.replace('subagent-', 'subagent_');
  return {
    incoming: path.join(pipelineRoot, `main_to_${suffix}.json`),
    outgoing: path.join(pipelineRoot, `${suffix}_to_main.json`),
  };
}
