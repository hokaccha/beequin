import { promises as fs } from "fs";
import path from "path";
import { app } from "electron";
import { v4 as uuidv4 } from "uuid";
import { BigQueryClient } from "../bigquery/client";

export type Project = {
  uuid: string;
  projectId: string;
  keyFilename?: string;
};

const configFilePath = path.join(app.getPath("userData"), "projects.json");

async function loadData(): Promise<Project[]> {
  try {
    const str = await fs.readFile(configFilePath, "utf8");
    return JSON.parse(str) as Project[];
  } catch (err) {
    if (err instanceof Error) {
      // File does not exist
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      // JSON Parse Error
      if (err.name === "SyntaxError") {
        console.warn(err);
        return [];
      }
    }

    throw err;
  }
}

async function saveData(projects: Project[]): Promise<void> {
  await fs.writeFile(configFilePath, JSON.stringify(projects, null, 2));
}

export async function getProjects(): Promise<Project[]> {
  return loadData();
}

export async function getProject(uuid: string): Promise<Project | null> {
  const projects = await loadData();
  return projects.find((p) => uuid === p.uuid) || null;
}

export async function createProject(project: Omit<Project, "uuid">): Promise<Project> {
  const projects = await loadData();
  const newProject = Object.assign({ uuid: uuidv4() }, project);
  projects.push(newProject);
  await saveData(projects);
  return newProject;
}

export async function updateProject(project: Project): Promise<void> {
  const projects = await loadData();
  const foundProject = projects.find((p) => project.uuid === p.uuid);
  if (foundProject === undefined) {
    throw new Error(`Project uuid: ${project.uuid} does not exist.`);
  }
  Object.assign(foundProject, project);
  await saveData(projects);
  return;
}

export async function deleteProject(uuid: string): Promise<void> {
  const projects = await loadData();
  const index = projects.findIndex((p) => uuid === p.uuid);
  if (index === -1) {
    throw new Error(`Project uuid: ${uuid} does not exist.`);
  }
  projects.splice(index, 1);
  await saveData(projects);
  return;
}

export async function validateProject(project: Omit<Project, "uuid">): Promise<boolean> {
  const client = new BigQueryClient(project);
  await client.executeQuery("select 1 /* Beequen validation query */");
  return true;
}
