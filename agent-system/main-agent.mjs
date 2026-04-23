import path from 'node:path';
import { appendLog, appendMarkdown, readJson, updateMarkdownSection, writeJson } from './lib/filePipeline.mjs';
import { getConfigPath, getPipelinePaths, getVaultPath } from './lib/paths.mjs';

const AGENTS = ['subagent-1', 'subagent-2'];
const mainLogPath = '/home/ubuntu/.openclaw/workspace/agent-system/logs/main-agent.log';
const mainStatePath = '/home/ubuntu/.openclaw/workspace/agent-system/main-state.json';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildFeedback(update) {
  if ((update.summary || '').toLowerCase().includes('missing')) {
    return 'Feedback: tighten task acceptance criteria before reassigning similar work.';
  }
  return 'Feedback: good output, keep future tasks scoped and explicit.';
}

async function seedTasks() {
  const starterTasks = {
    'subagent-1': [
      {
        id: 'task-s1-001',
        title: 'Research modular pipeline improvements',
        instructions: 'Research ways to improve the shared communication pipeline while keeping agents isolated.',
        priority: 'high',
      },
    ],
    'subagent-2': [
      {
        id: 'task-s2-001',
        title: 'Validate execution loop assumptions',
        instructions: 'Validate the read-process-write-sleep loop and note any operational risks.',
        priority: 'high',
      },
    ],
  };

  for (const agentId of AGENTS) {
    const pipeline = getPipelinePaths(agentId);
    const inbound = await readJson(pipeline.incoming, {
      agentId,
      pendingTasks: [],
      control: { status: 'idle' },
    });
    if ((inbound.pendingTasks || []).length === 0) {
      inbound.pendingTasks = starterTasks[agentId];
      inbound.updatedAt = new Date().toISOString();
      await writeJson(pipeline.incoming, inbound);
    }
  }
}

async function coordinate() {
  await seedTasks();
  await appendLog(mainLogPath, 'Main coordinator started.');

  while (true) {
    const state = await readJson(mainStatePath, {
      startedAt: new Date().toISOString(),
      agents: {},
    });

    for (const agentId of AGENTS) {
      const config = await readJson(getConfigPath(agentId), null);
      const pipeline = getPipelinePaths(agentId);
      const outbound = await readJson(pipeline.outgoing, {
        agentId,
        status: 'idle',
        updates: [],
      });

      const latest = outbound.updates?.[0];
      if (latest && state.agents?.[agentId]?.lastSeenTaskId !== latest.taskId) {
        const feedback = buildFeedback(latest);
        await updateMarkdownSection(
          path.join(getVaultPath(agentId), 'memory.md'),
          'Coordinator Feedback',
          `- Reviewed Task: ${latest.taskId}\n- Assessment: ${feedback}\n- Reviewed At: ${new Date().toISOString()}`,
        );
        await appendLog(mainLogPath, `Reviewed ${latest.taskId} from ${agentId}.`);
        state.agents[agentId] = {
          lastSeenTaskId: latest.taskId,
          lastStatus: latest.status,
          updatedAt: latest.completedAt,
        };
      }

      await appendMarkdown(
        path.join(config.vaultPath, 'tasks.md'),
        `- Coordinator status: ${outbound.status || 'idle'} at ${new Date().toISOString()}`,
      );
    }

    state.updatedAt = new Date().toISOString();
    await writeJson(mainStatePath, state);
    await sleep(3000);
  }
}

await coordinate();
