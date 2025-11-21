/**
 * Terminal Approval Panel - Beautiful modal for command approval and output streaming
 */

import * as vscode from 'vscode';
import { TerminalCommand } from '../orchestrator/terminal-manager';

interface PendingCommand {
  id: string;
  command: TerminalCommand;
  resolve: (approved: boolean) => void;
  outputLines: Array<{ type: 'stdout' | 'stderr', text: string }>;
  isRunning: boolean;
  exitCode: number | null;
  duration: number | null;
}

export class TerminalApprovalPanel {
  private static instance: TerminalApprovalPanel | undefined;
  private panel: vscode.WebviewPanel | undefined;
  private currentCommand: PendingCommand | undefined;

  private constructor() {}

  static getInstance(): TerminalApprovalPanel {
    if (!TerminalApprovalPanel.instance) {
      TerminalApprovalPanel.instance = new TerminalApprovalPanel();
    }
    return TerminalApprovalPanel.instance;
  }

  /**
   * Request approval to run a command
   */
  async requestApproval(command: TerminalCommand): Promise<boolean> {
    return new Promise((resolve) => {
      const commandId = `cmd_${Date.now()}`;
      
      this.currentCommand = {
        id: commandId,
        command,
        resolve,
        outputLines: [],
        isRunning: false,
        exitCode: null,
        duration: null
      };

      this.createOrShowPanel();
      this.updateContent();
    });
  }

  /**
   * Add output line (called during command execution)
   */
  addOutput(type: 'stdout' | 'stderr', text: string) {
    if (this.currentCommand) {
      this.currentCommand.outputLines.push({ type, text });
      this.updateOutputSection();
    }
  }

  /**
   * Mark command as running
   */
  markRunning() {
    if (this.currentCommand) {
      this.currentCommand.isRunning = true;
      this.updateContent();
    }
  }

  /**
   * Mark command as complete
   */
  markComplete(exitCode: number, duration: number) {
    if (this.currentCommand) {
      this.currentCommand.isRunning = false;
      this.currentCommand.exitCode = exitCode;
      this.currentCommand.duration = duration;
      this.updateContent();
    }
  }
  
  /**
   * Check if terminal panel is currently active/visible
   */
  hasActivePanel(): boolean {
    return this.panel !== undefined && this.panel.visible;
  }
  
  /**
   * Wait for user to close the terminal panel (for reviewing output)
   */
  async waitForUserToClose(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.panel) {
        resolve();
        return;
      }
      
      // Set up a listener for panel disposal
      const disposable = this.panel.onDidDispose(() => {
        disposable.dispose();
        resolve();
      });
      
      // Also add a max timeout (2 minutes)
      setTimeout(() => {
        disposable.dispose();
        resolve();
      }, 120000);
    });
  }

  private createOrShowPanel() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'codemindTerminal',
      'Terminal Command',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
      // If user closes without approving, auto-reject
      if (this.currentCommand && !this.currentCommand.isRunning) {
        this.currentCommand.resolve(false);
        this.currentCommand = undefined;
      }
    });

    // Handle messages from webview
    this.panel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'approve':
          if (this.currentCommand) {
            this.currentCommand.resolve(true);
          }
          break;
        case 'reject':
          if (this.currentCommand) {
            this.currentCommand.resolve(false);
            this.currentCommand = undefined;
            this.panel?.dispose();
          }
          break;
        case 'close':
          this.panel?.dispose();
          break;
        case 'copy':
          if (this.currentCommand) {
            const output = this.currentCommand.outputLines
              .map(l => l.text)
              .join('\n');
            vscode.env.clipboard.writeText(output);
            vscode.window.showInformationMessage('Output copied to clipboard');
          }
          break;
      }
    });
  }

  private updateContent() {
    if (!this.panel || !this.currentCommand) return;
    this.panel.webview.html = this.getWebviewContent();
  }

  private updateOutputSection() {
    if (!this.panel || !this.currentCommand) return;
    
    const output = this.currentCommand.outputLines
      .map(line => {
        const className = line.type === 'stderr' ? 'stderr' : 'stdout';
        return `<div class="output-line ${className}">${this.escapeHtml(line.text)}</div>`;
      })
      .join('');
    
    this.panel.webview.postMessage({
      command: 'updateOutput',
      output
    });
  }

  private getWebviewContent(): string {
    if (!this.currentCommand) return '';

    const { command, outputLines, isRunning, exitCode, duration } = this.currentCommand;
    const isComplete = exitCode !== null;
    const isSuccess = exitCode === 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terminal Command</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 24px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      margin-bottom: 24px;
    }
    
    .title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-pending {
      background: var(--vscode-inputValidation-warningBackground);
      color: var(--vscode-inputValidation-warningForeground);
    }
    
    .status-running {
      background: var(--vscode-inputValidation-infoBackground);
      color: var(--vscode-inputValidation-infoForeground);
      animation: pulse 2s ease-in-out infinite;
    }
    
    .status-success {
      background: rgba(0, 200, 0, 0.2);
      color: #00ff00;
    }
    
    .status-error {
      background: var(--vscode-inputValidation-errorBackground);
      color: var(--vscode-inputValidation-errorForeground);
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    
    .command-section {
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
    }
    
    .command-text {
      font-family: var(--vscode-editor-font-family);
      font-size: 14px;
      background: var(--vscode-textCodeBlock-background);
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      color: var(--vscode-textPreformat-foreground);
    }
    
    .reason-text {
      font-size: 14px;
      color: var(--vscode-foreground);
    }
    
    .cwd-text {
      font-size: 13px;
      font-family: var(--vscode-editor-font-family);
      color: var(--vscode-descriptionForeground);
    }
    
    .output-section {
      background: var(--vscode-terminal-background, #1e1e1e);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
      max-height: ${isComplete ? '600px' : '400px'};
      transition: max-height 0.3s ease;
    }
    
    .output-header {
      padding: 12px 16px;
      background: var(--vscode-editorWidget-background);
      border-bottom: 1px solid var(--vscode-panel-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .output-body {
      padding: 16px;
      font-family: var(--vscode-editor-font-family);
      font-size: 13px;
      line-height: 1.5;
      overflow-y: auto;
      max-height: ${isComplete ? '550px' : '350px'};
    }
    
    .output-line {
      margin-bottom: 2px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .output-line.stdout {
      color: var(--vscode-terminal-foreground, #cccccc);
    }
    
    .output-line.stderr {
      color: var(--vscode-terminal-ansiRed, #ff6b6b);
    }
    
    .empty-output {
      color: var(--vscode-descriptionForeground);
      font-style: italic;
      text-align: center;
      padding: 32px;
    }
    
    .stats {
      display: flex;
      gap: 24px;
      padding: 12px 16px;
      background: var(--vscode-editorWidget-background);
      border-top: 1px solid var(--vscode-panel-border);
      font-size: 12px;
    }
    
    .stat {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .stat-label {
      color: var(--vscode-descriptionForeground);
    }
    
    .stat-value {
      font-weight: 600;
      font-family: var(--vscode-editor-font-family);
    }
    
    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: var(--vscode-font-family);
    }
    
    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    
    .btn-danger {
      background: var(--vscode-inputValidation-errorBackground);
      color: var(--vscode-inputValidation-errorForeground);
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .icon {
      display: inline-block;
      width: 16px;
      height: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">
        <span>Terminal Command</span>
        ${this.getStatusBadge(isRunning, isComplete, isSuccess)}
      </div>
    </div>

    ${command.reason ? `
    <div class="command-section">
      <div class="section-title">Why</div>
      <div class="reason-text">${this.escapeHtml(command.reason)}</div>
    </div>
    ` : ''}

    <div class="command-section">
      <div class="section-title">Command</div>
      <div class="command-text">${this.escapeHtml(command.command)}</div>
    </div>

    <div class="command-section">
      <div class="section-title">Working Directory</div>
      <div class="cwd-text">${this.escapeHtml(command.cwd)}</div>
    </div>

    ${isRunning || isComplete ? `
    <div class="output-section">
      <div class="output-header">
        <span class="section-title" style="margin: 0;">Output</span>
        <button class="btn btn-secondary" onclick="copyOutput()" style="padding: 6px 12px; font-size: 12px;">
          Copy
        </button>
      </div>
      <div class="output-body" id="output">
        ${outputLines.length === 0 
          ? '<div class="empty-output">Waiting for output...</div>'
          : outputLines.map(line => {
              const className = line.type === 'stderr' ? 'stderr' : 'stdout';
              return `<div class="output-line ${className}">${this.escapeHtml(line.text)}</div>`;
            }).join('')
        }
      </div>
      ${isComplete ? `
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Exit Code:</span>
          <span class="stat-value" style="color: ${isSuccess ? '#00ff00' : '#ff6b6b'}">${exitCode}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Duration:</span>
          <span class="stat-value">${this.formatDuration(duration!)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Lines:</span>
          <span class="stat-value">${outputLines.length}</span>
        </div>
      </div>
      ` : ''}
    </div>
    ` : ''}

    <div class="actions">
      ${!isRunning && !isComplete ? `
        <button class="btn btn-danger" onclick="reject()">Reject</button>
        <button class="btn btn-primary" onclick="approve()">Run Command</button>
      ` : isComplete ? `
        <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; width: 100%;">
          <div style="color: var(--vscode-descriptionForeground); font-size: 13px; text-align: center;">
            ${isSuccess ? '✅' : '⚠️'} Command ${isSuccess ? 'completed successfully' : 'failed'}. Review the output above, then click Close to continue.
          </div>
          <button class="btn ${isSuccess ? 'btn-primary' : 'btn-secondary'}" onclick="close()" style="font-size: 14px; padding: 10px 24px; font-weight: 600;">
            Close & Continue to Next Step →
          </button>
        </div>
      ` : ''}
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function approve() {
      vscode.postMessage({ command: 'approve' });
    }

    function reject() {
      vscode.postMessage({ command: 'reject' });
    }

    function close() {
      vscode.postMessage({ command: 'close' });
    }

    function copyOutput() {
      vscode.postMessage({ command: 'copy' });
    }

    // Listen for output updates
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'updateOutput') {
        const outputEl = document.getElementById('output');
        if (outputEl) {
          outputEl.innerHTML = message.output;
          outputEl.scrollTop = outputEl.scrollHeight;
        }
      }
    });
  </script>
</body>
</html>`;
  }

  private getStatusBadge(isRunning: boolean, isComplete: boolean, isSuccess: boolean): string {
    if (isRunning) {
      return '<span class="status-badge status-running">⏳ Running...</span>';
    }
    if (isComplete) {
      return isSuccess
        ? '<span class="status-badge status-success">✓ Success</span>'
        : '<span class="status-badge status-error">✗ Failed</span>';
    }
    return '<span class="status-badge status-pending">⏸ Pending Approval</span>';
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

