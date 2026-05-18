import { env } from '@/lib/env';

function repoBase(): string {
  return env.GITHUB_REPO_URL.replace(/\/+$/, '').replace(/\.git$/, '');
}

export function githubBlobUrl(filePath: string, branch?: string): string {
  const ref = branch ?? env.GITHUB_DEFAULT_BRANCH;
  return `${repoBase()}/blob/${ref}/${filePath}`;
}

export function githubEditUrl(filePath: string, branch?: string): string {
  const ref = branch ?? env.GITHUB_DEFAULT_BRANCH;
  return `${repoBase()}/edit/${ref}/${filePath}`;
}

export function githubNewFileUrl(directory: string, branch?: string): string {
  const ref = branch ?? env.GITHUB_DEFAULT_BRANCH;
  return `${repoBase()}/new/${ref}/${directory}`;
}
