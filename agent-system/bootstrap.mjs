import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureDir, ensureJsonFile, writeJson } from './lib/filePipeline.mjs';
import {
  agentsRoot,
  pipelineRoot,
  getConfigPath,
  getLogPath,
  getPipelinePaths,
  getQueuePath,
  getSubagentPath,
  getVaultPath,
} from './lib/paths.mjs';

const AGENTS = [
  {
    id: 'subagent-1',
    branch: 'subagent-1-branch',
    role: 'Research and implementation specialist',
  },
  {
    id: 'subagent-2',
    branch: 'subagent-2-branch',
    role: 'Validation and operations specialist',
  },
];

async function ensureVaultFiles(agent) {
  const vaultPath = getVaultPath(agent.id);
  await ensureDir(vaultPath);
  await fs.writeFile(
    path.join(vaultPath, 'goals.md'),
    `# Goals\n\n- Operate independently as ${agent.id}.\n- Focus role: ${agent.role}.\n- Report progress only to the main agent.\n`,
  );
  await fs.writeFile(
    path.join(vaultPath, 'tasks.md'),
    '# Tasks\n\n- Await tasks from the main agent.\n- Process queue items in priority order.\n- Record outcomes before reporting back.\n',
  );
  await fs.writeFile(
    path.join(vaultPath, 'memory.md'),
    `# Memory\n\n## Identity\n- Agent: ${agent.id}\n- Branch: ${agent.branch}\n- Role: ${agent.role}\n\n## Feedback\n- No feedback yet.\n`,
  );
}

async function ensureAgentScaffold(agent) {
  const agentPath = getSubagentPath(agent.id);
  await ensureDir(agentPath);
  await ensureDir(path.join(agentPath, 'logs'));
  await ensureJsonFile(getQueuePath(agent.id), {
    agentId: agent.id,
    queue: [],
    inProgress: null,
    completed: [],
  });
  await writeJson(getConfigPath(agent.id), {
    agentId: agent.id,
    branch: agent.branch,
    role: agent.role,
    workspace: agentPath,
    vaultPath: getVaultPath(agent.id),
    logPath: getLogPath(agent.id),
    taskQueuePath: getQueuePath(agent.id),
    pollIntervalMs: 3000,
    pipeline: getPipelinePaths(agent.id),
  });
  await ensureVaultFiles(agent);
}

async function ensurePipelineFiles() {
  await ensureDir(pipelineRoot);
  for (const agent of AGENTS) {
    const { incoming, outgoing } = getPipelinePaths(agent.id);
    await ensureJsonFile(incoming, {
      agentId: agent.id,
      pendingTasks: [],
      control: { status: 'idle' },
      updatedAt: new Date().toISOString(),
    });
    await ensureJsonFile(outgoing, {
      agentId: agent.id,
      status: 'idle',
      updates: [],
      updatedAt: new Date().toISOString(),
    });
  }
}

await ensureDir(agentsRoot);
await Promise.all(AGENTS.map(ensureAgentScaffold));
await ensurePipelineFiles();

console.log('Agent scaffolding ready.');
