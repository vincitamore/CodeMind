# CodeMind Implementation Guide

> **Step-by-step instructions for building CodeMind from scratch**

**Version**: 1.0  
**Last Updated**: November 2025  
**Estimated Time**: 16 weeks to MVP

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: VSCode Fork Setup](#phase-1-vscode-fork-setup)
3. [Phase 2: Basic Agent System](#phase-2-basic-agent-system)
4. [Phase 3: Code Intelligence](#phase-3-code-intelligence)
5. [Phase 4: UI Integration](#phase-4-ui-integration)
6. [Phase 5: Testing & Refinement](#phase-5-testing--refinement)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Skills
- **TypeScript**: Advanced (VSCode is TypeScript)
- **Node.js**: Intermediate
- **LLM APIs**: Basic (OpenAI, Anthropic)
- **Git**: Intermediate
- **VSCode Extension Development**: Basic (will learn)

### Development Environment

```bash
# System Requirements
- OS: macOS, Linux, or Windows with WSL2
- RAM: 16GB+ (32GB recommended)
- Storage: 50GB+ free space
- CPU: 4+ cores

# Required Software
- Node.js 18+
- npm or pnpm
- Git
- VS Code (for development)
- Python 3.10+ (for local models via Ollama)

# Recommended
- Docker (for isolated testing)
- Postman/Insomnia (API testing)
```

### API Keys

```bash
# Required for development
export OPENAI_API_KEY="sk-..."

# Optional but recommended
export ANTHROPIC_API_KEY="sk-ant-..."

# For local models (alternative to cloud)
# Install Ollama: https://ollama.ai
ollama pull codellama:13b
```

---

## Phase 1: VSCode Fork Setup

**Goal**: Get VSCode source code, build it, and understand the extension architecture

**Duration**: Week 1

### Step 1.1: Fork and Clone VSCode

```bash
# Fork VSCode on GitHub
# https://github.com/microsoft/vscode
# Click "Fork" button

# Clone YOUR fork (not microsoft/vscode)
git clone https://github.com/YOUR_USERNAME/vscode.git codemind
cd codemind

# Add upstream remote for updates
git remote add upstream https://github.com/microsoft/vscode.git

# Create our development branch
git checkout -b codemind-dev
```

### Step 1.2: Build VSCode

```bash
# Install dependencies
npm install

# Initial build (takes 10-20 minutes first time)
npm run watch

# In separate terminal, run VSCode
./scripts/code.sh

# You should see VSCode open (running your local build)
```

**Troubleshooting Build**:
```bash
# If build fails due to node-gyp
npm install -g node-gyp
npm rebuild

# If watching is slow
# Edit .vscode/settings.json:
{
  "search.exclude": {
    "**/node_modules": true,
    "**/out": true,
    "**/.build": true
  }
}

# Clear build cache if needed
npm run clean
npm install
```

### Step 1.3: Create CodeMind Extension

```bash
# Create extension directory
mkdir -p extensions/codemind-agent

# Initialize extension
cd extensions/codemind-agent
npm init -y

# Install extension dependencies
npm install --save \
  @types/vscode \
  @types/node

npm install --save-dev \
  typescript \
  @vscode/vsce \
  esbuild
```

**Create Extension Manifest** (`extensions/codemind-agent/package.json`):
```json
{
  "name": "codemind-agent",
  "displayName": "CodeMind AI Agent",
  "description": "Hierarchical multi-agent code intelligence",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Programming Languages",
    "Machine Learning",
    "Other"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "codemind.inlineEdit",
        "title": "CodeMind: Edit Code",
        "when": "editorHasSelection"
      },
      {
        "command": "codemind.reviewCode",
        "title": "CodeMind: Review Code"
      }
    ],
    "keybindings": [
      {
        "command": "codemind.inlineEdit",
        "key": "ctrl+k",
        "mac": "cmd+k",
        "when": "editorTextFocus"
      }
    ],
    "configuration": {
      "title": "CodeMind",
      "properties": {
        "codemind.primaryProvider": {
          "type": "string",
          "default": "openai",
          "enum": ["openai", "anthropic", "local"],
          "description": "Primary LLM provider"
        },
        "codemind.openai.apiKey": {
          "type": "string",
          "default": "",
          "description": "OpenAI API Key"
        },
        "codemind.qualityThreshold": {
          "type": "number",
          "default": 9.0,
          "minimum": 0,
          "maximum": 10,
          "description": "Quality threshold for N² loop"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "lint": "eslint src --ext ts"
  },
  "devDependencies": {
    "@types/node": "^18.x",
    "@types/vscode": "^1.85.0",
    "@typescript-eslint/eslint-plugin": "^6.x",
    "@typescript-eslint/parser": "^6.x",
    "eslint": "^8.x",
    "typescript": "^5.3.0"
  }
}
```

### Step 1.4: Create Basic Extension

**Create** `extensions/codemind-agent/src/extension.ts`:
```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeMind extension activated');
  
  // Register inline edit command
  const inlineEdit = vscode.commands.registerCommand(
    'codemind.inlineEdit',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      
      vscode.window.showInformationMessage(
        `CodeMind: Analyzing ${selectedText.length} characters`
      );
      
      // TODO: Call agent system
    }
  );
  
  context.subscriptions.push(inlineEdit);
}

export function deactivate() {
  console.log('CodeMind extension deactivated');
}
```

**Create** `extensions/codemind-agent/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "out"]
}
```

### Step 1.5: Test Extension

```bash
# Compile extension
cd extensions/codemind-agent
npm run compile

# Run VSCode with extension
cd ../..
./scripts/code.sh

# In the opened VSCode:
# 1. Open any file
# 2. Select some text
# 3. Press Ctrl+K (or Cmd+K on Mac)
# 4. You should see "CodeMind: Analyzing X characters"
```

**Success Criteria**:
- ✅ VSCode builds and runs
- ✅ Extension activates on startup
- ✅ Ctrl+K triggers command
- ✅ Message shows selected text length

---

## Phase 2: Basic Agent System

**Goal**: Implement the core agent architecture (6 agents + synthesis + N² loop)

**Duration**: Weeks 2-4

### Step 2.1: LLM Provider Abstraction

**Create** `extensions/codemind-agent/src/llm/provider.ts`:
```typescript
export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  finishReason: string;
}

export interface LLMProvider {
  name: string;
  models: string[];
  
  generate(prompt: string, config: LLMConfig): Promise<LLMResponse>;
  countTokens(text: string): number;
}
```

**Create** `extensions/codemind-agent/src/llm/openai-provider.ts`:
```typescript
import { LLMProvider, LLMConfig, LLMResponse } from './provider';
import OpenAI from 'openai';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  models = ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
  
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
  
  async generate(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: config.model || 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });
    
    return {
      content: response.choices[0].message.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
      finishReason: response.choices[0].finish_reason
    };
  }
  
  countTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}
```

**Install OpenAI SDK**:
```bash
cd extensions/codemind-agent
npm install openai
```

### Step 2.2: Agent Base Class

**Create** `extensions/codemind-agent/src/agents/agent.ts`:
```typescript
import { LLMProvider, LLMConfig } from '../llm/provider';

export enum AgentRole {
  ARCHITECT = 'architect',
  ENGINEER = 'engineer',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  TESTING = 'testing',
  DOCUMENTATION = 'documentation'
}

export interface Issue {
  type: string;
  line?: number;
  description: string;
  fix: string;
  impact?: string;
}

export interface AgentAnalysis {
  agent: AgentRole;
  insights: string[];
  issues: {
    critical: Issue[];
    warnings: Issue[];
    suggestions: Issue[];
  };
  recommendations: string[];
  confidence: number;
  executionTime: number;
}

export interface CodeContext {
  code: string;
  filePath: string;
  language: string;
  selection?: string;
  framework?: string;
}

export abstract class Agent {
  abstract readonly role: AgentRole;
  abstract readonly perspective: string;
  
  constructor(
    protected llmProvider: LLMProvider,
    protected config: LLMConfig
  ) {}
  
  async analyze(
    request: string,
    context: CodeContext,
    repairDirective?: string
  ): Promise<AgentAnalysis> {
    const startTime = Date.now();
    
    const prompt = this.buildPrompt(request, context, repairDirective);
    const response = await this.llmProvider.generate(prompt, this.config);
    
    const analysis = this.parseResponse(response.content);
    analysis.executionTime = Date.now() - startTime;
    
    return analysis;
  }
  
  protected abstract buildPrompt(
    request: string,
    context: CodeContext,
    repairDirective?: string
  ): string;
  
  protected parseResponse(response: string): AgentAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        agent: this.role,
        insights: parsed.insights || [],
        issues: parsed.issues || { critical: [], warnings: [], suggestions: [] },
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 0.8,
        executionTime: 0
      };
    } catch (error) {
      // Fallback parsing if JSON fails
      return {
        agent: this.role,
        insights: [response.substring(0, 200)],
        issues: { critical: [], warnings: [], suggestions: [] },
        recommendations: [],
        confidence: 0.5,
        executionTime: 0
      };
    }
  }
}
```

### Step 2.3: Implement Security Agent (Example)

**Create** `extensions/codemind-agent/src/agents/security-agent.ts`:
```typescript
import { Agent, AgentRole, CodeContext, AgentAnalysis } from './agent';
import { LLMProvider, LLMConfig } from '../llm/provider';

export class SecurityAgent extends Agent {
  readonly role = AgentRole.SECURITY;
  readonly perspective = 'Security vulnerabilities, data protection, threat mitigation';
  
  protected buildPrompt(
    request: string,
    context: CodeContext,
    repairDirective?: string
  ): string {
    return `You are an expert security engineer reviewing code for vulnerabilities.

Your role: ${this.perspective}

User request: ${request}

Code to analyze:
\`\`\`${context.language}
${context.code}
\`\`\`

File: ${context.filePath}
${context.framework ? `Framework: ${context.framework}` : ''}

${repairDirective ? `IMPORTANT - Address these issues:\n${repairDirective}\n` : ''}

Analyze for security issues:
1. Authentication and authorization
2. Input validation and sanitization
3. Injection vulnerabilities (SQL, XSS, command)
4. Data exposure (secrets, PII)
5. Cryptographic security

Return JSON:
{
  "insights": ["Key observation 1", "Key observation 2", ...],
  "issues": {
    "critical": [{"type": "sql_injection", "line": 42, "description": "...", "fix": "..."}],
    "warnings": [{"type": "weak_crypto", "line": 15, "description": "...", "fix": "..."}],
    "suggestions": [{"type": "rate_limiting", "description": "...", "fix": "..."}]
  },
  "recommendations": ["Use parameterized queries", "Implement rate limiting", ...],
  "confidence": 0.95
}

Be specific. Reference line numbers. Provide actionable fixes.`;
  }
}
```

### Step 2.4: Implement All Six Agents

**Create similar files for**:
- `architect-agent.ts`
- `engineer-agent.ts`
- `performance-agent.ts`
- `testing-agent.ts`
- `documentation-agent.ts`

**Agent Factory** (`src/agents/agent-factory.ts`):
```typescript
import { Agent } from './agent';
import { ArchitectAgent } from './architect-agent';
import { EngineerAgent } from './engineer-agent';
import { SecurityAgent } from './security-agent';
import { PerformanceAgent } from './performance-agent';
import { TestingAgent } from './testing-agent';
import { DocumentationAgent } from './documentation-agent';
import { LLMProvider, LLMConfig } from '../llm/provider';

export class AgentFactory {
  static createAll(provider: LLMProvider, config: LLMConfig): Agent[] {
    return [
      new ArchitectAgent(provider, config),
      new EngineerAgent(provider, config),
      new SecurityAgent(provider, config),
      new PerformanceAgent(provider, config),
      new TestingAgent(provider, config),
      new DocumentationAgent(provider, config)
    ];
  }
}
```

### Step 2.5: Implement ODAI Synthesizer

**Create** `extensions/codemind-agent/src/synthesis/odai-synthesizer.ts`:
```typescript
import { AgentAnalysis } from '../agents/agent';
import { LLMProvider, LLMConfig } from '../llm/provider';

export interface SynthesisResult {
  success: boolean;
  code?: string;
  explanation?: string;
  qualityScore: number;
  repairDirective?: RepairDirective;
  keyDecisions?: Record<string, string>;
}

export interface RepairDirective {
  overallGuidance: string;
  agentSpecific: Record<string, string>;
  focusAreas: string[];
}

export class ODAISynthesizer {
  constructor(
    private llmProvider: LLMProvider,
    private qualityThreshold: number = 9.0
  ) {}
  
  async synthesize(
    request: string,
    analyses: AgentAnalysis[],
    context: any
  ): Promise<SynthesisResult> {
    // Phase 1 & 2: Observe and Distill
    const distillation = await this.observeAndDistill(request, analyses);
    
    // Check quality
    if (distillation.qualityScore >= this.qualityThreshold) {
      // Phase 4: Integrate
      return await this.integrate(distillation, context);
    } else {
      // Phase 3: Adapt
      return await this.adapt(distillation);
    }
  }
  
  private async observeAndDistill(
    request: string,
    analyses: AgentAnalysis[]
  ): Promise<any> {
    const prompt = `Analyze multiple expert perspectives and assign quality score.

User Request: ${request}

Expert Analyses:
${analyses.map(a => `
${a.agent}:
- Insights: ${a.insights.join('; ')}
- Critical Issues: ${a.issues.critical.length}
- Recommendations: ${a.recommendations.join('; ')}
`).join('\n')}

Distill:
1. Core requirements (what MUST be in solution)
2. Key constraints (what CANNOT be violated)
3. Quality score (0-10): How well can we address this?
   - 9-10: Excellent, ready to implement
   - 7-8: Good, minor gaps
   - 5-6: Mediocre, significant gaps
   - 0-4: Poor, fundamental issues

Return JSON:
{
  "coreRequirements": ["Req 1", "Req 2"],
  "keyConstraints": ["Constraint 1", "Constraint 2"],
  "qualityScore": 8.5,
  "scoringRationale": "Why this score"
}`;

    const response = await this.llmProvider.generate(prompt, {
      model: 'gpt-4-turbo',
      temperature: 0.2,
      maxTokens: 1000
    });
    
    return JSON.parse(response.content);
  }
  
  private async integrate(distillation: any, context: any): Promise<SynthesisResult> {
    const prompt = `Generate final code implementation.

Requirements:
${distillation.coreRequirements.join('\n')}

Constraints:
${distillation.keyConstraints.join('\n')}

Existing code:
\`\`\`
${context.code}
\`\`\`

Generate production-ready code with explanations.

Return JSON:
{
  "code": "... generated code ...",
  "explanation": "What changed and why",
  "keyDecisions": {
    "architecture": "Design choice",
    "security": "Security measures",
    "performance": "Optimizations"
  }
}`;

    const response = await this.llmProvider.generate(prompt, {
      model: 'gpt-4-turbo',
      temperature: 0.4,
      maxTokens: 2000
    });
    
    const result = JSON.parse(response.content);
    
    return {
      success: true,
      code: result.code,
      explanation: result.explanation,
      qualityScore: distillation.qualityScore,
      keyDecisions: result.keyDecisions
    };
  }
  
  private async adapt(distillation: any): Promise<SynthesisResult> {
    // Generate repair directive
    return {
      success: false,
      qualityScore: distillation.qualityScore,
      repairDirective: {
        overallGuidance: 'Address gaps in requirements',
        agentSpecific: {
          'engineer': 'Add more edge case handling',
          'security': 'Strengthen input validation'
        },
        focusAreas: ['Input validation', 'Error handling']
      }
    };
  }
}
```

### Step 2.6: Implement N² Loop Controller

**Create** `extensions/codemind-agent/src/synthesis/n2-controller.ts`:
```typescript
import { Agent, AgentAnalysis, CodeContext } from '../agents/agent';
import { ODAISynthesizer, SynthesisResult } from './odai-synthesizer';

export interface N2Result {
  success: boolean;
  output: string;
  explanation: string;
  qualityScore: number;
  iterations: number;
  totalTime: number;
  history: any[];
}

export class N2Controller {
  constructor(
    private maxIterations: number = 4,
    private qualityThreshold: number = 9.0
  ) {}
  
  async execute(
    request: string,
    agents: Agent[],
    synthesizer: ODAISynthesizer,
    context: CodeContext
  ): Promise<N2Result> {
    const startTime = Date.now();
    const history: any[] = [];
    let currentRepairDirective: any;
    
    for (let i = 0; i < this.maxIterations; i++) {
      console.log(`N² Iteration ${i + 1}/${this.maxIterations}`);
      
      // Execute all agents in parallel
      const analyses = await Promise.all(
        agents.map(agent =>
          agent.analyze(
            request,
            context,
            currentRepairDirective?.agentSpecific?.[agent.role]
          )
        )
      );
      
      // Synthesize
      const synthesis = await synthesizer.synthesize(request, analyses, context);
      
      // Record history
      history.push({
        iteration: i + 1,
        analyses,
        synthesis,
        qualityScore: synthesis.qualityScore
      });
      
      // Check if quality met
      if (synthesis.success && synthesis.qualityScore >= this.qualityThreshold) {
        return {
          success: true,
          output: synthesis.code || '',
          explanation: synthesis.explanation || '',
          qualityScore: synthesis.qualityScore,
          iterations: i + 1,
          totalTime: Date.now() - startTime,
          history
        };
      }
      
      // Prepare for next iteration
      if (i < this.maxIterations - 1) {
        currentRepairDirective = synthesis.repairDirective;
      }
    }
    
    // Max iterations reached
    const lastSynthesis = history[history.length - 1].synthesis;
    
    return {
      success: false,
      output: lastSynthesis.code || '',
      explanation: lastSynthesis.explanation || '',
      qualityScore: lastSynthesis.qualityScore,
      iterations: this.maxIterations,
      totalTime: Date.now() - startTime,
      history
    };
  }
}
```

### Step 2.7: Wire Up Extension

**Update** `extensions/codemind-agent/src/extension.ts`:
```typescript
import * as vscode from 'vscode';
import { OpenAIProvider } from './llm/openai-provider';
import { AgentFactory } from './agents/agent-factory';
import { ODAISynthesizer } from './synthesis/odai-synthesizer';
import { N2Controller } from './synthesis/n2-controller';
import { CodeContext } from './agents/agent';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeMind extension activated');
  
  // Get configuration
  const config = vscode.workspace.getConfiguration('codemind');
  const apiKey = config.get<string>('openai.apiKey');
  
  if (!apiKey) {
    vscode.window.showErrorMessage('CodeMind: Please set your OpenAI API key in settings');
    return;
  }
  
  // Initialize LLM provider
  const llmProvider = new OpenAIProvider(apiKey);
  
  // Create agents
  const agents = AgentFactory.createAll(llmProvider, {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 500
  });
  
  // Create synthesizer and N² controller
  const synthesizer = new ODAISynthesizer(llmProvider, 9.0);
  const n2Controller = new N2Controller(4, 9.0);
  
  // Register inline edit command
  const inlineEdit = vscode.commands.registerCommand(
    'codemind.inlineEdit',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      
      // Get user input
      const instruction = await vscode.window.showInputBox({
        prompt: 'What would you like to do with this code?',
        placeHolder: 'e.g., Add error handling, Optimize performance...'
      });
      
      if (!instruction) return;
      
      // Show progress
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'CodeMind is analyzing...',
        cancellable: false
      }, async (progress) => {
        // Gather context
        const document = editor.document;
        const selection = editor.selection;
        const selectedText = document.getText(selection);
        
        const context: CodeContext = {
          code: selectedText,
          filePath: document.uri.fsPath,
          language: document.languageId,
          selection: selectedText
        };
        
        // Execute N² loop
        const result = await n2Controller.execute(
          instruction,
          agents,
          synthesizer,
          context
        );
        
        // Show result
        if (result.success) {
          // Replace selection with generated code
          await editor.edit(editBuilder => {
            editBuilder.replace(selection, result.output);
          });
          
          vscode.window.showInformationMessage(
            `CodeMind: ${result.explanation} (Score: ${result.qualityScore.toFixed(1)}/10, ${result.iterations} iterations)`
          );
        } else {
          vscode.window.showWarningMessage(
            `CodeMind: Generated code but below quality threshold (${result.qualityScore.toFixed(1)}/10)`
          );
        }
      });
    }
  );
  
  context.subscriptions.push(inlineEdit);
}

export function deactivate() {}
```

### Step 2.8: Test the System

```bash
# Compile
cd extensions/codemind-agent
npm run compile

# Run VSCode
cd ../..
./scripts/code.sh

# Test:
# 1. Open a JavaScript/TypeScript file
# 2. Write some simple code with issues:
function fetchData(url) {
  return fetch(url).then(r => r.json());
}

# 3. Select the code
# 4. Press Ctrl+K
# 5. Type: "Add error handling"
# 6. Wait for analysis (may take 10-20 seconds)
# 7. Code should be replaced with improved version
```

**Success Criteria**:
- ✅ All 6 agents analyze in parallel
- ✅ Synthesis combines perspectives
- ✅ N² loop triggers if quality <9
- ✅ Final code is generated
- ✅ Code is inserted into editor

---

## Phase 3: Code Intelligence

**Goal**: Add symbol indexing, semantic search, and context gathering

**Duration**: Weeks 5-6

### Step 3.1: Tree-sitter Parser

```bash
cd extensions/codemind-agent
npm install tree-sitter tree-sitter-typescript tree-sitter-python tree-sitter-javascript
```

**Create** `src/intelligence/ast-parser.ts`:
```typescript
import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import JavaScript from 'tree-sitter-javascript';
import Python from 'tree-sitter-python';

export interface Symbol {
  name: string;
  type: 'function' | 'class' | 'variable' | 'method';
  line: number;
  code: string;
}

export class ASTParser {
  private parsers: Map<string, Parser>;
  
  constructor() {
    this.parsers = new Map();
    
    // TypeScript
    const tsParser = new Parser();
    tsParser.setLanguage(TypeScript.typescript);
    this.parsers.set('typescript', tsParser);
    
    // JavaScript
    const jsParser = new Parser();
    jsParser.setLanguage(JavaScript);
    this.parsers.set('javascript', jsParser);
    
    // Python
    const pyParser = new Parser();
    pyParser.setLanguage(Python);
    this.parsers.set('python', pyParser);
  }
  
  parse(code: string, language: string): Parser.Tree | null {
    const parser = this.parsers.get(language);
    if (!parser) return null;
    return parser.parse(code);
  }
  
  extractSymbols(code: string, language: string): Symbol[] {
    const tree = this.parse(code, language);
    if (!tree) return [];
    
    const symbols: Symbol[] = [];
    const cursor = tree.walk();
    
    const visit = () => {
      const node = cursor.currentNode;
      
      // Extract function declarations
      if (node.type === 'function_declaration' || 
          node.type === 'function') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            name: nameNode.text,
            type: 'function',
            line: node.startPosition.row + 1,
            code: node.text
          });
        }
      }
      
      // Extract class declarations
      if (node.type === 'class_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            name: nameNode.text,
            type: 'class',
            line: node.startPosition.row + 1,
            code: node.text
          });
        }
      }
      
      // Recursively visit children
      if (cursor.gotoFirstChild()) {
        do {
          visit();
        } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }
    };
    
    visit();
    return symbols;
  }
}
```

### Step 3.2: Symbol Indexer

**Create** `src/intelligence/symbol-indexer.ts`:
```typescript
import * as vscode from 'vscode';
import { ASTParser, Symbol } from './ast-parser';

export class SymbolIndexer {
  private index: Map<string, Symbol[]> = new Map();
  private parser: ASTParser;
  
  constructor() {
    this.parser = new ASTParser();
  }
  
  async indexWorkspace(): Promise<void> {
    const files = await vscode.workspace.findFiles(
      '**/*.{ts,js,py,tsx,jsx}',
      '**/node_modules/**'
    );
    
    for (const file of files) {
      await this.indexFile(file);
    }
  }
  
  async indexFile(uri: vscode.Uri): Promise<void> {
    try {
      const document = await vscode.workspace.openTextDocument(uri);
      const code = document.getText();
      const language = this.getLanguage(document.languageId);
      
      const symbols = this.parser.extractSymbols(code, language);
      this.index.set(uri.fsPath, symbols);
    } catch (error) {
      console.error(`Failed to index ${uri.fsPath}:`, error);
    }
  }
  
  getFileSymbols(filePath: string): Symbol[] {
    return this.index.get(filePath) || [];
  }
  
  searchSymbols(query: string): Symbol[] {
    const results: Symbol[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const symbols of this.index.values()) {
      for (const symbol of symbols) {
        if (symbol.name.toLowerCase().includes(lowerQuery)) {
          results.push(symbol);
        }
      }
    }
    
    return results;
  }
  
  private getLanguage(languageId: string): string {
    if (languageId === 'typescript' || languageId === 'typescriptreact') {
      return 'typescript';
    }
    if (languageId === 'javascript' || languageId === 'javascriptreact') {
      return 'javascript';
    }
    return languageId;
  }
}
```

### Step 3.3: Context Gatherer

**Create** `src/intelligence/context-gatherer.ts`:
```typescript
import * as vscode from 'vscode';
import { SymbolIndexer } from './symbol-indexer';
import { CodeContext } from '../agents/agent';

export class ContextGatherer {
  constructor(private symbolIndexer: SymbolIndexer) {}
  
  async gatherContext(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ): Promise<CodeContext> {
    const selectedText = document.getText(selection);
    const filePath = document.uri.fsPath;
    const language = document.languageId;
    
    // Get symbols from current file
    const symbols = this.symbolIndexer.getFileSymbols(filePath);
    
    // TODO: Add more context (imports, git history, etc.)
    
    return {
      code: selectedText,
      filePath,
      language,
      selection: selectedText,
      framework: await this.detectFramework(document)
    };
  }
  
  private async detectFramework(document: vscode.TextDocument): Promise<string | undefined> {
    const text = document.getText();
    
    if (text.includes('import React') || text.includes('from \'react\'')) {
      return 'React';
    }
    if (text.includes('import Vue') || text.includes('from \'vue\'')) {
      return 'Vue';
    }
    if (text.includes('@angular/core')) {
      return 'Angular';
    }
    if (text.includes('express') && text.includes('app.listen')) {
      return 'Express';
    }
    
    return undefined;
  }
}
```

### Step 3.4: Integrate Intelligence Layer

**Update** `src/extension.ts` to use context gatherer:
```typescript
// ... previous imports ...
import { SymbolIndexer } from './intelligence/symbol-indexer';
import { ContextGatherer } from './intelligence/context-gatherer';

export function activate(context: vscode.ExtensionContext) {
  // ... previous setup ...
  
  // Initialize intelligence layer
  const symbolIndexer = new SymbolIndexer();
  const contextGatherer = new ContextGatherer(symbolIndexer);
  
  // Index workspace on activation
  symbolIndexer.indexWorkspace().then(() => {
    console.log('Workspace indexed');
  });
  
  // Watch for file changes
  const fileWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
    symbolIndexer.indexFile(document.uri);
  });
  
  context.subscriptions.push(fileWatcher);
  
  // Update inline edit to use context gatherer
  const inlineEdit = vscode.commands.registerCommand(
    'codemind.inlineEdit',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      
      const instruction = await vscode.window.showInputBox({
        prompt: 'What would you like to do with this code?'
      });
      
      if (!instruction) return;
      
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'CodeMind is analyzing...',
        cancellable: false
      }, async (progress) => {
        // Gather rich context
        const context = await contextGatherer.gatherContext(
          editor.document,
          editor.selection
        );
        
        // Execute N² loop with context
        const result = await n2Controller.execute(
          instruction,
          agents,
          synthesizer,
          context
        );
        
        // Replace code
        if (result.output) {
          await editor.edit(editBuilder => {
            editBuilder.replace(editor.selection, result.output);
          });
        }
        
        vscode.window.showInformationMessage(
          `CodeMind: ${result.explanation} (${result.qualityScore.toFixed(1)}/10, ${result.iterations}${result.iterations > 1 ? ' iterations' : ' iteration'})`
        );
      });
    }
  );
  
  context.subscriptions.push(inlineEdit);
}
```

---

## Phase 4: UI Integration

**Goal**: Create beautiful UI for displaying agent analyses and results

**Duration**: Weeks 7-8

### Step 4.1: Diff View for Code Changes

**Create** `src/ui/diff-view.ts`:
```typescript
import * as vscode from 'vscode';

export class DiffView {
  static async show(
    original: string,
    modified: string,
    explanation: string
  ): Promise<boolean> {
    // Create temporary documents
    const originalUri = vscode.Uri.parse('codemind-original://original.ts');
    const modifiedUri = vscode.Uri.parse('codemind-modified://modified.ts');
    
    // Register text document content providers
    const originalProvider = new TextDocumentContentProvider(original);
    const modifiedProvider = new TextDocumentContentProvider(modified);
    
    const disposable1 = vscode.workspace.registerTextDocumentContentProvider(
      'codemind-original',
      originalProvider
    );
    const disposable2 = vscode.workspace.registerTextDocumentContentProvider(
      'codemind-modified',
      modifiedProvider
    );
    
    // Show diff
    await vscode.commands.executeCommand(
      'vscode.diff',
      originalUri,
      modifiedUri,
      `CodeMind: ${explanation}`
    );
    
    // Ask user to accept or reject
    const choice = await vscode.window.showInformationMessage(
      `CodeMind: ${explanation}`,
      'Accept',
      'Reject',
      'Show Details'
    );
    
    disposable1.dispose();
    disposable2.dispose();
    
    return choice === 'Accept';
  }
}

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
  constructor(private content: string) {}
  
  provideTextDocumentContent(): string {
    return this.content;
  }
}
```

### Step 4.2: Agent Analysis Panel

**Create** `src/ui/analysis-panel.ts`:
```typescript
import * as vscode from 'vscode';
import { AgentAnalysis } from '../agents/agent';

export class AnalysisPanel {
  private static currentPanel: AnalysisPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  
  private constructor(panel: vscode.WebviewPanel) {
    this.panel = panel;
  }
  
  static show(analyses: AgentAnalysis[], qualityScore: number): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    
    if (AnalysisPanel.currentPanel) {
      AnalysisPanel.currentPanel.panel.reveal(column);
      AnalysisPanel.currentPanel.update(analyses, qualityScore);
      return;
    }
    
    const panel = vscode.window.createWebviewPanel(
      'codemindAnalysis',
      'CodeMind Analysis',
      column || vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    
    AnalysisPanel.currentPanel = new AnalysisPanel(panel);
    AnalysisPanel.currentPanel.update(analyses, qualityScore);
    
    panel.onDidDispose(() => {
      AnalysisPanel.currentPanel = undefined;
    });
  }
  
  private update(analyses: AgentAnalysis[], qualityScore: number): void {
    this.panel.webview.html = this.getHtmlContent(analyses, qualityScore);
  }
  
  private getHtmlContent(analyses: AgentAnalysis[], qualityScore: number): string {
    const agentEmojis: Record<string, string> = {
      architect: '🎨',
      engineer: '🔧',
      security: '🔒',
      performance: '⚡',
      testing: '🧪',
      documentation: '📚'
    };
    
    const qualityColor = qualityScore >= 9 ? 'green' : qualityScore >= 7 ? 'orange' : 'red';
    
    return `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: var(--vscode-font-family);
          padding: 20px;
        }
        .quality-score {
          font-size: 2em;
          font-weight: bold;
          color: ${qualityColor};
          margin-bottom: 20px;
        }
        .agent {
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .agent-header {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .insights {
          margin-top: 10px;
        }
        .insight {
          padding: 5px 0;
        }
        .issue {
          padding: 8px;
          margin: 5px 0;
          border-left: 3px solid;
          background: var(--vscode-textBlockQuote-background);
        }
        .critical { border-color: red; }
        .warning { border-color: orange; }
        .suggestion { border-color: blue; }
      </style>
    </head>
    <body>
      <div class="quality-score">
        Quality Score: ${qualityScore.toFixed(1)}/10
      </div>
      
      ${analyses.map(analysis => `
        <div class="agent">
          <div class="agent-header">
            ${agentEmojis[analysis.agent]} ${analysis.agent.charAt(0).toUpperCase() + analysis.agent.slice(1)}
            <span style="float: right; font-size: 0.8em; color: gray;">
              ${analysis.executionTime}ms
            </span>
          </div>
          
          <div class="insights">
            <strong>Insights:</strong>
            ${analysis.insights.map(insight => `
              <div class="insight">• ${insight}</div>
            `).join('')}
          </div>
          
          ${analysis.issues.critical.length > 0 ? `
            <div style="margin-top: 10px;">
              <strong style="color: red;">Critical Issues:</strong>
              ${analysis.issues.critical.map(issue => `
                <div class="issue critical">
                  <strong>${issue.type}</strong> ${issue.line ? `(line ${issue.line})` : ''}<br/>
                  ${issue.description}<br/>
                  <em>Fix: ${issue.fix}</em>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${analysis.recommendations.length > 0 ? `
            <div style="margin-top: 10px;">
              <strong>Recommendations:</strong>
              ${analysis.recommendations.map(rec => `
                <div class="insight">• ${rec}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>`;
  }
}
```

### Step 4.3: Integrate UI Components

**Update** `src/extension.ts`:
```typescript
import { DiffView } from './ui/diff-view';
import { AnalysisPanel } from './ui/analysis-panel';

// In inline edit command:
const result = await n2Controller.execute(...);

// Show analysis panel if user wants details
const showDetails = await vscode.window.showInformationMessage(
  `CodeMind: ${result.explanation}`,
  'Accept',
  'Reject',
  'Show Analysis'
);

if (showDetails === 'Show Analysis') {
  const lastIteration = result.history[result.history.length - 1];
  AnalysisPanel.show(lastIteration.analyses, result.qualityScore);
}

if (showDetails === 'Accept') {
  // Show diff and confirm
  const accepted = await DiffView.show(
    context.code,
    result.output,
    result.explanation
  );
  
  if (accepted) {
    await editor.edit(editBuilder => {
      editBuilder.replace(editor.selection, result.output);
    });
  }
}
```

---

## Phase 5: Testing & Refinement

**Goal**: Test thoroughly and refine based on real usage

**Duration**: Weeks 9-10

### Step 5.1: Create Test Suite

**Create** `extensions/codemind-agent/src/test/suite/extension.test.ts`:
```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';
import { OpenAIProvider } from '../../llm/openai-provider';
import { SecurityAgent } from '../../agents/security-agent';

suite('CodeMind Extension Test Suite', () => {
  test('LLM Provider generates response', async () => {
    const provider = new OpenAIProvider(process.env.OPENAI_API_KEY!);
    const response = await provider.generate('Say "test"', {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 100
    });
    
    assert.ok(response.content.length > 0);
    assert.ok(response.tokensUsed > 0);
  });
  
  test('Security Agent detects SQL injection', async () => {
    const provider = new OpenAIProvider(process.env.OPENAI_API_KEY!);
    const agent = new SecurityAgent(provider, {
      model: 'gpt-4-turbo',
      temperature: 0.3,
      maxTokens: 500
    });
    
    const vulnerableCode = `
      function getUserByName(name) {
        return db.query('SELECT * FROM users WHERE name = "' + name + '"');
      }
    `;
    
    const analysis = await agent.analyze(
      'Analyze this code',
      {
        code: vulnerableCode,
        filePath: 'test.js',
        language: 'javascript'
      }
    );
    
    assert.ok(analysis.issues.critical.length > 0);
    assert.ok(
      analysis.issues.critical.some(issue => 
        issue.type.toLowerCase().includes('injection')
      )
    );
  });
});
```

### Step 5.2: Manual Testing Scenarios

**Test 1: Basic Code Generation**
```
File: test.js
Code: (empty function)
function processData(data) {
  // TODO
}

Instruction: "Implement this function to validate and process user data"
Expected: Complete implementation with validation, error handling
```

**Test 2: Security Review**
```
Code: (vulnerable auth function)
function login(username, password) {
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  return db.query(query);
}

Instruction: "Review for security issues"
Expected: Identifies SQL injection, recommends parameterized queries
```

**Test 3: Performance Optimization**
```
Code: (inefficient loop)
function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (i === j) sum += arr[i];
    }
  }
  return sum;
}

Instruction: "Optimize this code"
Expected: Identifies O(n²) complexity, suggests O(n) solution
```

### Step 5.3: Performance Benchmarking

**Create** `extensions/codemind-agent/benchmark.ts`:
```typescript
import { performance } from 'perf_hooks';

async function benchmarkAgentExecution() {
  const iterations = 10;
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    // Run agent system
    await n2Controller.execute(...);
    
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
  
  console.log(`Average: ${avg.toFixed(0)}ms`);
  console.log(`P95: ${p95.toFixed(0)}ms`);
}
```

**Performance Targets**:
```
Target Metrics:
- Agent execution (parallel): <3s
- Synthesis: <1s
- Full N² loop (1 iteration): <5s
- Full N² loop (2 iterations): <10s

If not meeting targets:
1. Check LLM provider latency
2. Optimize prompt sizes
3. Consider caching
4. Profile with Chrome DevTools
```

---

## Troubleshooting

### Issue: Extension Not Activating

**Symptoms**: Commands don't appear, Ctrl+K doesn't work

**Solutions**:
```bash
# Check extension is listed
./scripts/code.sh --list-extensions | grep codemind

# Check for compilation errors
cd extensions/codemind-agent
npm run compile

# Check activation events in package.json
# Should have: "activationEvents": ["onStartupFinished"]

# Check output console in VSCode
# View → Output → Select "CodeMind" from dropdown
```

### Issue: LLM API Errors

**Symptoms**: "API key invalid" or timeout errors

**Solutions**:
```typescript
// Add better error handling in llm provider
async generate(prompt: string, config: LLMConfig): Promise<LLMResponse> {
  try {
    const response = await this.client.chat.completions.create({...});
    return response;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid API key. Check settings.');
    }
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Wait and retry.');
    }
    if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timeout. Check network connection.');
    }
    throw error;
  }
}
```

### Issue: Slow Performance

**Solutions**:
```
1. Enable caching for repeated requests
2. Reduce context size (only send relevant code)
3. Use faster models for non-critical agents (gpt-3.5-turbo)
4. Consider local models for performance agent
5. Profile with console.time():

console.time('agent-execution');
await agents[0].analyze(...);
console.timeEnd('agent-execution');
```

### Issue: Poor Quality Outputs

**Solutions**:
```
1. Check prompt clarity - add more examples
2. Increase temperature for creativity (architect)
3. Decrease temperature for precision (security)
4. Add more context (symbols, related code)
5. Lower quality threshold temporarily (8.5 instead of 9.0)
6. Check agent prompts have clear instructions
```

---

## Next Steps

1. **Complete Implementation**: Finish all phases
2. **User Testing**: Get 10 developers to try it
3. **Iterate**: Fix bugs, improve prompts
4. **Add Features**: Autocomplete, code review, refactoring
5. **Performance Optimization**: Caching, parallel execution
6. **Documentation**: Write user guides
7. **Release**: Package and publish extension

See [ROADMAP.md](./ROADMAP.md) for detailed timeline and milestones.

---

**Congratulations!** You now have a complete guide to building CodeMind from scratch. The implementation preserves the psychological alpha (hierarchical agents, ODAI synthesis, N² self-correction) while creating a practical, usable IDE.

**Key Success Factors**:
- ✅ Start with MVP (basic agent system)
- ✅ Test early and often
- ✅ Get user feedback quickly
- ✅ Iterate based on real usage
- ✅ Don't skip the quality control (N² loop)

**Remember**: The goal is not to be the fastest AI code assistant. The goal is to be the most **reliable** and **thorough** AI code assistant that thinks like a senior development team.
