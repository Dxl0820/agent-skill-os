import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { pathToFileURL, fileURLToPath } from "node:url";
import { parseSkillMarkdown } from "./parser.js";
import {
  RegistryConfig,
  RegistryConfigEntry,
  RegistryConfigSchema,
  RemoteRegistry,
  RemoteRegistrySchema,
  RemoteRegistrySkill,
  Skill,
  SkillPack
} from "./schema.js";

export const remoteRegistryVersion = "0.3.0";

export interface RegistryConfigOptions {
  configPath?: string;
  homeDir?: string;
}

export interface RemoteRegistrySearchResult {
  registry: string;
  registryUrl: string;
  skill: RemoteRegistrySkill;
}

export function getUserRegistryConfigPath(homeDir = defaultAgentSkillOsHome()): string {
  return path.join(homeDir, ".agent-skill-os", "config.json");
}

export function getRegistryCachePath(registryName: string, homeDir = defaultAgentSkillOsHome()): string {
  return path.join(homeDir, ".agent-skill-os", "cache", registryName + ".json");
}

export async function loadRegistryConfig(options: RegistryConfigOptions = {}): Promise<RegistryConfig> {
  const configPath = options.configPath || getUserRegistryConfigPath(options.homeDir);
  if (!(await fs.pathExists(configPath))) {
    return { version: remoteRegistryVersion, registries: [] };
  }
  const raw = await fs.readFile(configPath, "utf8");
  return RegistryConfigSchema.parse(parseJson(raw));
}

export async function saveRegistryConfig(config: RegistryConfig, options: RegistryConfigOptions = {}): Promise<void> {
  const configPath = options.configPath || getUserRegistryConfigPath(options.homeDir);
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeFile(configPath, JSON.stringify(RegistryConfigSchema.parse(config), null, 2) + "\n", "utf8");
}

export async function addRegistry(name: string, url: string, options: RegistryConfigOptions = {}): Promise<RegistryConfig> {
  const config = await loadRegistryConfig(options);
  const next: RegistryConfig = {
    version: remoteRegistryVersion,
    registries: [...config.registries.filter((entry) => entry.name !== name), { name, url }]
      .sort((a, b) => a.name.localeCompare(b.name))
  };
  await saveRegistryConfig(next, options);
  return next;
}

export async function removeRegistry(name: string, options: RegistryConfigOptions = {}): Promise<boolean> {
  const config = await loadRegistryConfig(options);
  const registries = config.registries.filter((entry) => entry.name !== name);
  const removed = registries.length !== config.registries.length;
  await saveRegistryConfig({ version: remoteRegistryVersion, registries }, options);
  return removed;
}

export async function refreshRemoteRegistries(options: RegistryConfigOptions = {}): Promise<RegistryConfigEntry[]> {
  const homeDir = options.homeDir;
  const config = await loadRegistryConfig(options);
  const refreshedAt = new Date().toISOString();
  const refreshed: RegistryConfigEntry[] = [];
  for (const registry of config.registries) {
    const remote = await loadRemoteRegistry(registry.url);
    const cachePath = getRegistryCachePath(registry.name, homeDir);
    await fs.ensureDir(path.dirname(cachePath));
    await fs.writeFile(cachePath, JSON.stringify(remote, null, 2) + "\n", "utf8");
    refreshed.push({ ...registry, refreshedAt });
  }
  const next = { version: remoteRegistryVersion, registries: refreshed };
  await saveRegistryConfig(next, options);
  return refreshed;
}

export async function loadConfiguredRemoteRegistries(options: RegistryConfigOptions = {}): Promise<Array<{ entry: RegistryConfigEntry; registry: RemoteRegistry }>> {
  const config = await loadRegistryConfig(options);
  const loaded = [];
  for (const entry of config.registries) {
    const cached = await loadCachedRemoteRegistry(entry, options.homeDir);
    loaded.push({
      entry,
      registry: cached || (await loadRemoteRegistry(entry.url))
    });
  }
  return loaded;
}

export async function loadRemoteRegistry(url: string): Promise<RemoteRegistry> {
  const raw = await readTextSource(url);
  return RemoteRegistrySchema.parse(parseJson(raw));
}

export function searchRemoteRegistrySkills(registries: Array<{ entry: RegistryConfigEntry; registry: RemoteRegistry }>, query: string): RemoteRegistrySearchResult[] {
  const normalized = query.trim().toLowerCase();
  const matches: RemoteRegistrySearchResult[] = [];
  for (const item of registries) {
    for (const skill of item.registry.skills) {
      const haystack = [
        skill.id,
        skill.version,
        skill.name || "",
        skill.summary || "",
        skill.description || "",
        skill.source.url,
        ...skill.tags,
        ...skill.capabilities,
        ...skill.triggers
      ].join(" ").toLowerCase();
      if (!normalized || haystack.includes(normalized)) {
        matches.push({ registry: item.entry.name, registryUrl: item.entry.url, skill });
      }
    }
  }
  return matches.sort((a, b) => a.registry.localeCompare(b.registry) || a.skill.id.localeCompare(b.skill.id));
}

export async function loadRemoteSkillFromRegistry(registryName: string, skillId: string, options: RegistryConfigOptions = {}): Promise<{ registry: RegistryConfigEntry; skillEntry: RemoteRegistrySkill; skill: Skill }> {
  const { registryEntry, remote } = await loadNamedRemoteRegistry(registryName, options);
  const skillEntry = remote.skills.find((candidate) => candidate.id === skillId);
  if (!skillEntry) {
    throw new Error("Remote skill not found: " + registryName + "/" + skillId);
  }
  return {
    registry: registryEntry,
    skillEntry,
    skill: await loadRemoteSkill(skillEntry)
  };
}

export async function loadRemotePackFromRegistry(registryName: string, packId: string, options: RegistryConfigOptions = {}): Promise<{ registry: RegistryConfigEntry; pack: SkillPack; skills: Skill[] }> {
  const { registryEntry, remote } = await loadNamedRemoteRegistry(registryName, options);
  const pack = remote.packs.find((candidate) => candidate.id === packId);
  if (!pack) {
    throw new Error("Remote pack not found: " + registryName + "/" + packId);
  }
  const skills: Skill[] = [];
  for (const skillId of pack.skills) {
    const skillEntry = remote.skills.find((candidate) => candidate.id === skillId);
    if (!skillEntry) {
      throw new Error("Remote pack " + registryName + "/" + packId + " references missing skill: " + skillId);
    }
    skills.push(await loadRemoteSkill(skillEntry));
  }
  return { registry: registryEntry, pack, skills };
}

export async function loadRemoteSkill(skillEntry: RemoteRegistrySkill): Promise<Skill> {
  const raw = await readTextSource(skillEntry.source.url);
  return parseSkillMarkdown(raw, path.join("remote", skillEntry.id, "SKILL.md"));
}

export async function loadRemoteSkillUrl(url: string): Promise<Skill> {
  const raw = await readTextSource(url);
  const id = guessSkillIdFromUrl(url);
  return parseSkillMarkdown(raw, path.join("remote", id, "SKILL.md"));
}

export async function readTextSource(sourceUrl: string): Promise<string> {
  if (/^https?:\/\//i.test(sourceUrl)) {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch " + sourceUrl + ": " + response.status + " " + response.statusText);
    }
    return response.text();
  }
  if (/^file:\/\//i.test(sourceUrl)) {
    return fs.readFile(fileURLToPath(sourceUrl), "utf8");
  }
  return fs.readFile(path.resolve(sourceUrl), "utf8");
}

export function toSourceUrl(filePathOrUrl: string): string {
  if (/^(https?|file):\/\//i.test(filePathOrUrl)) {
    return filePathOrUrl;
  }
  return pathToFileURL(path.resolve(filePathOrUrl)).toString();
}

async function loadCachedRemoteRegistry(entry: RegistryConfigEntry, homeDir = defaultAgentSkillOsHome()): Promise<RemoteRegistry | undefined> {
  const cachePath = getRegistryCachePath(entry.name, homeDir);
  if (!(await fs.pathExists(cachePath))) {
    return undefined;
  }
  const raw = await fs.readFile(cachePath, "utf8");
  return RemoteRegistrySchema.parse(parseJson(raw));
}

async function loadNamedRemoteRegistry(registryName: string, options: RegistryConfigOptions): Promise<{ registryEntry: RegistryConfigEntry; remote: RemoteRegistry }> {
  const config = await loadRegistryConfig(options);
  const registryEntry = config.registries.find((entry) => entry.name === registryName);
  if (!registryEntry) {
    throw new Error("Remote registry not configured: " + registryName);
  }
  return {
    registryEntry,
    remote: (await loadCachedRemoteRegistry(registryEntry, options.homeDir)) || (await loadRemoteRegistry(registryEntry.url))
  };
}

function guessSkillIdFromUrl(url: string): string {
  const withoutQuery = url.split(/[?#]/)[0];
  const parent = path.basename(path.dirname(withoutQuery.replace(/\\/g, "/")));
  return parent && parent !== "." ? parent : "remote-skill";
}

function defaultAgentSkillOsHome(): string {
  return process.env.AGENT_SKILL_OS_HOME || os.homedir();
}

function parseJson(raw: string): unknown {
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}
