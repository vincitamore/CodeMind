/**
 * Terminal Manager - Execute terminal commands with streaming output
 */

import * as vscode from 'vscode';
import { spawn } from 'child_process';

export interface TerminalCommand {
  command: string;
  cwd: string;
  reason?: string;
  timeout?: number;
}

export interface TerminalOutput {
  stdout: string[];
  stderr: string[];
  exitCode: number | null;
  duration: number;
  timedOut: boolean;
}

export type OutputCallback = (type: 'stdout' | 'stderr', line: string) => void;

export class TerminalManager {
  private workspaceRoot: string;

  constructor() {
    this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
  }

  /**
   * Execute a terminal command with streaming output
   */
  async executeCommand(
    cmd: TerminalCommand,
    onOutput?: OutputCallback
  ): Promise<TerminalOutput> {
    const startTime = Date.now();
    const stdout: string[] = [];
    const stderr: string[] = [];
    let timedOut = false;

    console.log(`[TerminalManager] Executing: ${cmd.command}`);
    console.log(`[TerminalManager] Working directory: ${cmd.cwd}`);

    return new Promise((resolve, reject) => {
      // Parse command (handle "npm install", "pnpm build", etc.)
      const parts = cmd.command.split(' ');
      const executable = parts[0];
      const args = parts.slice(1);

      const childProcess = spawn(executable, args, {
        cwd: cmd.cwd,
        shell: true,
        env: { ...process.env }
      });

      // Set timeout if specified
      let timeoutHandle: NodeJS.Timeout | undefined;
      if (cmd.timeout) {
        timeoutHandle = setTimeout(() => {
          timedOut = true;
          childProcess.kill('SIGTERM');
        }, cmd.timeout);
      }

      // Handle stdout
      childProcess.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => {
          stdout.push(line);
          onOutput?.('stdout', line);
        });
      });

      // Handle stderr
      childProcess.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => {
          stderr.push(line);
          onOutput?.('stderr', line);
        });
      });

      // Handle completion
      childProcess.on('close', (code) => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }

        const duration = Date.now() - startTime;
        const result: TerminalOutput = {
          stdout,
          stderr,
          exitCode: code,
          duration,
          timedOut
        };

        console.log(`[TerminalManager] Command completed with exit code: ${code} (${duration}ms)`);

        if (code === 0) {
          resolve(result);
        } else if (timedOut) {
          reject(new Error(`Command timed out after ${cmd.timeout}ms`));
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      childProcess.on('error', (error) => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
        console.error(`[TerminalManager] Command error:`, error);
        reject(error);
      });
    });
  }

  /**
   * Detect common setup commands from package.json
   */
  async detectSetupCommands(workspacePath: string): Promise<TerminalCommand[]> {
    const commands: TerminalCommand[] = [];
    
    try {
      const packageJsonPath = vscode.Uri.joinPath(
        vscode.Uri.file(workspacePath),
        'package.json'
      );
      
      const content = await vscode.workspace.fs.readFile(packageJsonPath);
      const packageJson = JSON.parse(content.toString());
      
      // Check package manager
      const hasPackageLock = await this.fileExists(workspacePath, 'package-lock.json');
      const hasPnpmLock = await this.fileExists(workspacePath, 'pnpm-lock.yaml');
      const hasYarnLock = await this.fileExists(workspacePath, 'yarn.lock');
      
      const packageManager = hasPnpmLock ? 'pnpm' : hasYarnLock ? 'yarn' : 'npm';
      
      // Add install command if dependencies exist
      if (packageJson.dependencies || packageJson.devDependencies) {
        commands.push({
          command: `${packageManager} install`,
          cwd: workspacePath,
          reason: 'Install project dependencies',
          timeout: 300000 // 5 minutes
        });
      }
      
      // Add build command if it exists
      if (packageJson.scripts?.build) {
        commands.push({
          command: `${packageManager} run build`,
          cwd: workspacePath,
          reason: 'Build the project',
          timeout: 180000 // 3 minutes
        });
      }
      
      // Add compile command if it exists (TypeScript)
      if (packageJson.scripts?.compile) {
        commands.push({
          command: `${packageManager} run compile`,
          cwd: workspacePath,
          reason: 'Compile TypeScript',
          timeout: 120000 // 2 minutes
        });
      }
      
    } catch (error) {
      console.error('[TerminalManager] Failed to detect setup commands:', error);
    }
    
    return commands;
  }

  private async fileExists(dir: string, file: string): Promise<boolean> {
    try {
      const uri = vscode.Uri.joinPath(vscode.Uri.file(dir), file);
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  }
}

