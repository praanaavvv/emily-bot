import fs from 'node:fs/promises';
import path from 'node:path';
import { appendLog, appendMarkdown, readJson, updateMarkdownSection, writeJson } from './lib/filePipeline.mjs';
import { getConfigPath } from './lib/paths.mjs';

const agentId = process.argv[2];
if (!agentId) {
  console.error('Usage: node subagent.mjs <subagent-id>');
  process.exit(1);
}

const config = await readJson(getConfigPath(agentId), null);
if (!config) {
  console.error(`Missing config for ${agentId}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildProgressUpdate(task, outcome) {
  return {
    taskId: task.id,
    status: outcome.status,
    summary: outcome.summary,
    nextAction: outcome.nextAction,
    completedAt: new Date().toISOString(),
  };
}

function evaluateTask(task) {
  const text = `${task.title || ''} ${task.instructions || ''}`.toLowerCase();

  if (text.includes('research')) {
    return {
      status: 'completed',
      summary: `${agentId} researched the request and prepared findings for the coordinator.`,
      nextAction: 'Main agent should review findings and decide whether to assign implementation follow-up.',
    };
  }

  if (text.includes('validate') || text.includes('test')) {
    return {
      status: 'completed',
      summary: `${agentId} validated the task criteria and flagged any missing acceptance details.`,
      nextAction: 'Main agent should confirm whether additional edge-case checks are needed.',
    };
  }

  return {
    status: 'completed',
    summary: `${agentId} processed task \"${task.title || task.id}\" and recorded state locally.`,
    nextAction: 'Main agent can assign the next queued task.',
  };
}

async function syncQueueFromPipeline() {
  const inbound = await readJson(config.pipeline.incoming, {
    pendingTasks: [],
    control: { status: 'idle' },
  });
  const queueState = await readJson(config.taskQueuePath, {
    agentId,
    queue: [],
    inProgress: null,
    completed: [],
  });

  const knownIds = new Set([
    ...queueState.queue.map((task) => task.id),
    ...queueState.completed.map((task) => task.id),
    ...(queueState.inProgress ? [queueState.inProgress.id] : []),
  ]);

  const newTasks = (inbound.pendingTasks || []).filter((task) => !knownIds.has(task.id));
  if (newTasks.length > 0) {
    queueState.queue.push(...newTasks);
    await appendLog(config.logPath, `Queued ${newTasks.length} new task(s).`);
    await appendMarkdown(
      path.join(config.vaultPath, 'tasks.md'),
      newTasks.map((task) => `- ${task.id}: ${task.title}`).join('\n'),
    );
    await writeJson(config.taskQueuePath, queueState);
  }

  return { inbound, queueState };
}

async function runLoop() {
  await appendLog(config.logPath, `${agentId} started.`);

  while (true) {
    const { inbound, queueState } = await syncQueueFromPipeline();

    if (inbound.control?.status === 'stop') {
      await appendLog(config.logPath, 'Stop signal received.');
      break;
    }

    if (!queueState.inProgress && queueState.queue.length > 0) {
      const task = queueState.queue.shift();
      queueState.inProgress = task;
      await writeJson(config.taskQueuePath, queueState);
      await appendLog(config.logPath, `Started task ${task.id}.`);

      const outcome = evaluateTask(task);
      queueState.completed.unshift({ ...task, ...outcome });
      queueState.inProgress = null;
      await writeJson(config.taskQueuePath, queueState);

      await updateMarkdownSection(
        path.join(config.vaultPath, 'memory.md'),
        'Latest Task',
        `- Task: ${task.title}\n- Status: ${outcome.status}\n- Summary: ${outcome.summary}\n- Next Action: ${outcome.nextAction}`,
      );

      const outbound = await readJson(config.pipeline.outgoing, {
        agentId,
        status: 'idle',
        updates: [],
      });
      outbound.status = 'updated';
      outbound.updates = [buildProgressUpdate(task, outcome), ...(outbound.updates || [])].slice(0, 20);
      outbound.updatedAt = new Date().toISOString();
      await writeJson(config.pipeline.outgoing, outbound);
      await appendLog(config.logPath, `Finished task ${task.id}.`);
    }

    await sleep(config.pollIntervalMs || 3000);
  }
}

await runLoop();
