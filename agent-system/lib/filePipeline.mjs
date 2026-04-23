import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function ensureJsonFile(filePath, defaultValue) {
  await ensureDir(path.dirname(filePath));
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

export async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

export async function appendLog(filePath, message) {
  await ensureDir(path.dirname(filePath));
  const line = `[${new Date().toISOString()}] ${message}\n`;
  await fs.appendFile(filePath, line);
}

export async function updateMarkdownSection(filePath, heading, content) {
  let text = '';
  try {
    text = await fs.readFile(filePath, 'utf8');
  } catch {
    text = '';
  }

  const normalized = text.trim().length > 0 ? `${text.trimEnd()}\n` : '';
  const section = `## ${heading}\n${content.trim()}\n`;
  const pattern = new RegExp(`## ${heading}[\\s\\S]*?(?=\\n## |$)`, 'm');
  const next = pattern.test(normalized)
    ? normalized.replace(pattern, section)
    : `${normalized}${normalized ? '\n' : ''}${section}`;

  await fs.writeFile(filePath, `${next.trimEnd()}\n`);
}

export async function appendMarkdown(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.appendFile(filePath, `${content.trim()}\n\n`);
}
