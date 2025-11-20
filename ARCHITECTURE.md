# CodeMind Technical Architecture

> **Comprehensive technical specification for the hierarchical cognitive IDE**

**Version**: 1.0  
**Last Updated**: November 2025

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [Agent System](#agent-system)
5. [Code Intelligence Layer](#code-intelligence-layer)
6. [LLM Integration](#llm-integration)
7. [Data Flow](#data-flow)
8. [Performance Considerations](#performance-considerations)
9. [Security Architecture](#security-architecture)
10. [Extension Points](#extension-points)

---

## System Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     VSCode UI Layer                          │
│  • Editor • Panels • Command Palette • Status Bar            │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────────┐
│                  CodeMind Extension                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ UI Manager   │  │ Command      │  │ Event        │       │
│  │              │  │ Handlers     │  │ Listeners    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────────┐
│               Orchestration Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Task Coordinator                            │   │
│  │  • Routing • Queueing • State Management             │   │
│  └─────────────────────┬────────────────────────────────┘   │
└────────────────────────┴─────────────────────────────────────┘
                         │
     ┌──────────────────┴──────────────────┐
     │                                      │
┌────┴───────────────────┐    ┌────────────┴──────────────────┐
│   Agent System         │    │  Code Intelligence            │
│                        │    │                               │
│  ┌──────────────┐      │    │  ┌──────────────┐            │
│  │ 6 Specialists│      │    │  │ Parser       │            │
│  │              │      │    │  │ Indexer      │            │
│  └──────┬───────┘      │    │  │ Embeddings   │            │
│         │              │    │  └──────────────┘            │
│  ┌──────┴───────┐      │    │                               │
│  │ Synthesis    │      │    │                               │
│  │ (ODAI)       │      │    │                               │
│  └──────┬───────┘      │    │                               │
│         │              │    │                               │
│  ┌──────┴───────┐      │    │                               │
│  │ N2 Loop      │      │    │                               │
│  │ Controller   │      │    │                               │
│  └──────────────┘      │    │                               │
└────────┬───────────────┘    └───────────────┬───────────────┘
         │                                     │
         └─────────────────┬───────────────────┘
                           │
┌──────────────────────────┴─────────────────────────────────┐
│                    LLM Provider Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ OpenAI       │  │ Anthropic    │  │ Local Models │     │
│  │              │  │              │  │ (Ollama)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

#### Base Platform
- **VSCode Fork**: Latest stable (1.85+)
- **Language**: TypeScript 5.3+
- **Runtime**: Electron (bundled with VSCode)
- **Build System**: esbuild + webpack
- **Package Manager**: npm/pnpm

#### Code Intelligence
- **Parsers**: Tree-sitter (multi-language)
- **LSP Integration**: Native VSCode LSP client
- **Vector Store**: sqlite-vss (local vector database)
- **Embedding Model**: all-MiniLM-L6-v2 (local) or OpenAI text-embedding-3-small

#### LLM Integration
- **Primary Providers**:
  - OpenAI (GPT-4 Turbo, GPT-4)
  - Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
  - Local (Ollama, llama.cpp, vllm)
- **Streaming**: SSE for real-time responses
- **Rate Limiting**: Token bucket algorithm

#### State Management
- **Local Storage**: SQLite 3.40+
- **Cache**: LRU cache in-memory
- **Config**: JSON files + SQLite
- **Session State**: In-memory with persistence

### Development Tools

```json
{
  "typescript": "^5.3.0",
  "esbuild": "^0.19.0",
  "vitest": "^1.0.0",
  "playwright": "^1.40.0",
  "prettier": "^3.1.0",
  "eslint": "^8.55.0",
  "@vscode/test-electron": "^2.3.0"
}
```

---

## Component Architecture

### 1. VSCode Extension Layer

**Primary Extension: `codemind-agent`**

```typescript
// extension.ts
export function activate(context: vscode.ExtensionContext) {
  // Initialize core systems
  const codeIntelligence = new CodeIntelligence(context);
  const agentOrchestrator = new AgentOrchestrator(context);
  const llmManager = new LLMProviderManager(context);
  
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('codemind.inlineEdit', 
      () => handleInlineEdit(agentOrchestrator)
    ),
    vscode.commands.registerCommand('codemind.reviewCode',
      () => handleCodeReview(agentOrchestrator)
    ),
    // ... more commands
  );
  
  // Register language features
  const completionProvider = new CodeMindCompletionProvider(
    agentOrchestrator,
    codeIntelligence
  );
  vscode.languages.registerCompletionItemProvider(
    { scheme: 'file' },
    completionProvider,
    '\n', '.', '(', '{'
  );
  
  // Start indexing
  codeIntelligence.startIndexing();
}
```

**Key Responsibilities**:
- Command registration and handling
- UI component management
- Event listening (file changes, cursor movement, etc.)
- Configuration management
- Extension lifecycle

### 2. Orchestration Layer

**TaskCoordinator** - Central request router

```typescript
interface Task {
  id: string;
  type: TaskType;
  priority: Priority;
  context: TaskContext;
  status: TaskStatus;
}

class TaskCoordinator {
  private queue: PriorityQueue<Task>;
  private executor: TaskExecutor;
  private cache: LRUCache<string, TaskResult>;
  
  async execute(task: Task): Promise<TaskResult> {
    // Check cache
    const cached = this.cache.get(task.id);
    if (cached && !this.isStale(cached)) return cached;
    
    // Add to queue
    this.queue.enqueue(task);
    
    // Execute when ready
    const result = await this.executor.execute(task);
    
    // Cache result
    this.cache.set(task.id, result);
    
    return result;
  }
}
```

**TaskExecutor** - Executes tasks via agent system

```typescript
class TaskExecutor {
  constructor(
    private agentSystem: AgentSystem,
    private codeIntel: CodeIntelligence
  ) {}
  
  async execute(task: Task): Promise<TaskResult> {
    // Gather context
    const context = await this.gatherContext(task);
    
    // Route to appropriate handler
    switch (task.type) {
      case TaskType.CODE_GENERATION:
        return this.handleCodeGeneration(task, context);
      case TaskType.CODE_REVIEW:
        return this.handleCodeReview(task, context);
      case TaskType.REFACTOR:
        return this.handleRefactor(task, context);
      // ...
    }
  }
  
  private async handleCodeGeneration(
    task: Task, 
    context: CodeContext
  ): Promise<TaskResult> {
    // Execute through agent system
    return this.agentSystem.generateCode(
      task.request,
      context
    );
  }
}
```

### 3. Agent System

See [AGENT_SYSTEM.md](./AGENT_SYSTEM.md) for detailed agent architecture.

**Core Classes**:

```typescript
// Agent base class
abstract class Agent {
  abstract role: AgentRole;
  abstract perspective: string;
  
  constructor(
    protected llm: LLMProvider,
    protected config: AgentConfig
  ) {}
  
  abstract async analyze(
    code: string,
    context: CodeContext,
    instruction?: string
  ): Promise<AgentAnalysis>;
}

// Synthesis layer
class ODAISynthesizer {
  async synthesize(
    request: string,
    analyses: AgentAnalysis[],
    context: CodeContext
  ): Promise<SynthesisResult> {
    // Observation
    const observation = await this.observe(request, analyses);
    
    // Distillation
    const distillation = await this.distill(observation, analyses);
    
    // Check quality
    if (distillation.qualityScore >= this.threshold) {
      // Integration
      return this.integrate(distillation);
    } else {
      // Adaptation
      return this.adapt(distillation);
    }
  }
}

// N2 controller
class N2Controller {
  async execute(
    request: string,
    agents: Agent[],
    synthesizer: ODAISynthesizer,
    context: CodeContext,
    maxIterations: number = 4
  ): Promise<N2Result> {
    for (let i = 0; i < maxIterations; i++) {
      // Run all agents in parallel
      const analyses = await Promise.all(
        agents.map(agent => agent.analyze(code, context))
      );
      
      // Synthesize
      const synthesis = await synthesizer.synthesize(
        request,
        analyses,
        context
      );
      
      // Check quality
      if (synthesis.qualityScore >= threshold) {
        return {
          success: true,
          output: synthesis.output,
          iterations: i + 1,
          qualityScore: synthesis.qualityScore
        };
      }
      
      // Apply repair directive for next iteration
      context = this.applyRepairDirective(
        context,
        synthesis.repairDirective
      );
    }
    
    // Max iterations reached
    return {
      success: false,
      output: lastSynthesis.output,
      iterations: maxIterations,
      qualityScore: lastSynthesis.qualityScore
    };
  }
}
```

### 4. Code Intelligence Layer

**AST Parser** - Multi-language parsing

```typescript
import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import Python from 'tree-sitter-python';
import Rust from 'tree-sitter-rust';

class ASTParser {
  private parsers: Map<string, Parser>;
  
  constructor() {
    this.parsers = new Map([
      ['typescript', this.createParser(TypeScript.typescript)],
      ['python', this.createParser(Python)],
      ['rust', this.createParser(Rust)],
      // ... more languages
    ]);
  }
  
  parse(code: string, language: string): Tree {
    const parser = this.parsers.get(language);
    return parser.parse(code);
  }
  
  extractSymbols(tree: Tree): Symbol[] {
    // Extract functions, classes, variables, etc.
    return this.walkTree(tree);
  }
}
```

**Symbol Indexer** - Workspace symbol indexing

```typescript
class SymbolIndexer {
  private index: Map<string, SymbolInfo[]>;
  private embeddings: VectorStore;
  
  async indexWorkspace(workspace: vscode.WorkspaceFolder): Promise<void> {
    const files = await this.findSourceFiles(workspace);
    
    for (const file of files) {
      await this.indexFile(file);
    }
  }
  
  private async indexFile(file: vscode.Uri): Promise<void> {
    const content = await vscode.workspace.fs.readFile(file);
    const tree = this.parser.parse(content.toString());
    const symbols = this.parser.extractSymbols(tree);
    
    // Store in index
    this.index.set(file.path, symbols);
    
    // Create embeddings for semantic search
    for (const symbol of symbols) {
      const embedding = await this.createEmbedding(symbol);
      await this.embeddings.add(symbol.id, embedding);
    }
  }
  
  async search(query: string): Promise<SymbolInfo[]> {
    // Semantic search via embeddings
    const queryEmbedding = await this.createEmbedding(query);
    const results = await this.embeddings.search(queryEmbedding, 10);
    
    return results.map(r => this.index.get(r.symbolId));
  }
}
```

**Context Gatherer** - Assembles relevant context

```typescript
class ContextGatherer {
  constructor(
    private symbolIndexer: SymbolIndexer,
    private lsp: LSPClient
  ) {}
  
  async gatherContext(
    selection: vscode.Selection,
    document: vscode.TextDocument
  ): Promise<CodeContext> {
    // Current file context
    const currentFile = {
      path: document.uri.path,
      content: document.getText(),
      selection: document.getText(selection)
    };
    
    // Find related symbols
    const symbols = await this.findRelatedSymbols(selection, document);
    
    // Get type information from LSP
    const types = await this.lsp.getTypeInformation(selection, document);
    
    // Find imports and dependencies
    const dependencies = await this.findDependencies(document);
    
    // Recent changes (for context)
    const recentChanges = await this.getRecentChanges(document);
    
    return {
      currentFile,
      symbols,
      types,
      dependencies,
      recentChanges,
      workspaceInfo: {
        rootPath: vscode.workspace.workspaceFolders[0].uri.path,
        language: document.languageId,
        framework: await this.detectFramework(document)
      }
    };
  }
  
  private async findRelatedSymbols(
    selection: vscode.Selection,
    document: vscode.TextDocument
  ): Promise<SymbolInfo[]> {
    // Find symbols defined in current file
    const localSymbols = await this.symbolIndexer.getFileSymbols(
      document.uri
    );
    
    // Find symbols referenced in selection
    const referencedSymbols = await this.findReferences(
      selection,
      document
    );
    
    // Semantic search for related code
    const selectionText = document.getText(selection);
    const semanticMatches = await this.symbolIndexer.search(selectionText);
    
    return [...localSymbols, ...referencedSymbols, ...semanticMatches];
  }
}
```

### 5. LLM Provider Layer

**Provider Abstraction**

```typescript
interface LLMProvider {
  name: string;
  models: string[];
  
  generate(
    prompt: string,
    config: GenerationConfig
  ): Promise<LLMResponse>;
  
  stream(
    prompt: string,
    config: GenerationConfig
  ): AsyncIterable<string>;
  
  countTokens(text: string): number;
}

class OpenAIProvider implements LLMProvider {
  name = 'openai';
  models = ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
  
  private client: OpenAI;
  
  async generate(
    prompt: string,
    config: GenerationConfig
  ): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: config.model || 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });
    
    return {
      content: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens,
      finishReason: response.choices[0].finish_reason
    };
  }
  
  async *stream(
    prompt: string,
    config: GenerationConfig
  ): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: config.model || 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      // ... other params
    });
    
    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  }
}

class LocalModelProvider implements LLMProvider {
  name = 'local';
  models: string[];
  
  private ollamaClient: Ollama;
  
  async generate(
    prompt: string,
    config: GenerationConfig
  ): Promise<LLMResponse> {
    const response = await this.ollamaClient.generate({
      model: config.model || 'codellama:13b',
      prompt,
      options: {
        temperature: config.temperature,
        num_predict: config.maxTokens
      }
    });
    
    return {
      content: response.response,
      tokensUsed: response.eval_count,
      finishReason: 'stop'
    };
  }
}

// Provider manager
class LLMProviderManager {
  private providers: Map<string, LLMProvider>;
  private cache: ResponseCache;
  private rateLimiter: RateLimiter;
  
  constructor(config: Config) {
    this.providers = new Map([
      ['openai', new OpenAIProvider(config.openai)],
      ['anthropic', new AnthropicProvider(config.anthropic)],
      ['local', new LocalModelProvider(config.local)]
    ]);
  }
  
  async generate(
    prompt: string,
    provider: string,
    config: GenerationConfig
  ): Promise<LLMResponse> {
    // Check cache
    const cacheKey = this.getCacheKey(prompt, provider, config);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // Rate limiting
    await this.rateLimiter.acquire(provider);
    
    // Generate
    const providerInstance = this.providers.get(provider);
    const response = await providerInstance.generate(prompt, config);
    
    // Cache
    await this.cache.set(cacheKey, response);
    
    return response;
  }
}
```

---

## Data Flow

### Typical Code Generation Flow

```
1. User Input
   └─> Ctrl+K pressed in editor
       └─> Extension captures selection + instruction

2. Context Gathering
   └─> ContextGatherer collects:
       ├─> Current file content
       ├─> Related symbols (via SymbolIndexer)
       ├─> Type information (via LSP)
       └─> Recent changes

3. Agent Execution (Parallel)
   ├─> Architect Agent: Analyzes design
   ├─> Engineer Agent: Checks correctness
   ├─> Security Agent: Finds vulnerabilities
   ├─> Performance Agent: Optimizes
   ├─> Testing Agent: Suggests tests
   └─> Documentation Agent: Reviews clarity

4. Synthesis (ODAI Cycle)
   ├─> Observe: Combine all agent perspectives
   ├─> Distill: Extract core requirements
   ├─> Score: Assign quality score (0-10)
   └─> Integrate OR Adapt:
       ├─> If score >= 9: Generate final code
       └─> If score < 9: Create repair directive

5. N2 Loop
   └─> If quality insufficient:
       ├─> Agents re-analyze with repair directive
       ├─> Synthesis re-executes
       └─> Repeat up to 4 times

6. Result Presentation
   └─> Show diff view to user
       ├─> Accept: Apply changes
       ├─> Reject: Discard
       └─> Modify: Edit then apply
```

### State Management

```typescript
interface SessionState {
  // Current task
  activeTask?: Task;
  
  // Conversation history (for context)
  conversationHistory: Message[];
  
  // Recent generations (for undo)
  generationHistory: Generation[];
  
  // User preferences
  preferences: UserPreferences;
  
  // Cache
  cache: {
    symbolIndex: Map<string, Symbol[]>;
    embeddings: VectorStore;
    llmResponses: LRUCache;
  };
}

class StateManager {
  private state: SessionState;
  private persistence: SQLiteDB;
  
  async save(): Promise<void> {
    await this.persistence.save('session_state', this.state);
  }
  
  async restore(): Promise<void> {
    this.state = await this.persistence.load('session_state');
  }
  
  // Conversation history for context
  addToHistory(message: Message): void {
    this.state.conversationHistory.push(message);
    
    // Keep only last N messages
    if (this.state.conversationHistory.length > 20) {
      this.state.conversationHistory.shift();
    }
  }
  
  getRecentContext(n: number = 5): Message[] {
    return this.state.conversationHistory.slice(-n);
  }
}
```

---

## Performance Considerations

### Optimization Strategies

#### 1. Parallel Agent Execution
```typescript
// Execute all six agents simultaneously
const analyses = await Promise.all(
  agents.map(agent => agent.analyze(code, context))
);
// Total time = max(agent times), not sum(agent times)
```

#### 2. Intelligent Caching
```typescript
class SmartCache {
  // Cache LLM responses by prompt + context hash
  private llmCache: LRUCache<string, LLMResponse>;
  
  // Cache symbol index by file hash
  private symbolCache: Map<string, CachedSymbols>;
  
  getCacheKey(prompt: string, context: CodeContext): string {
    return crypto
      .createHash('sha256')
      .update(prompt + JSON.stringify(context))
      .digest('hex');
  }
  
  async get(key: string): Promise<any> {
    const cached = this.llmCache.get(key);
    if (cached && Date.now() - cached.timestamp < TTL) {
      return cached.value;
    }
    return null;
  }
}
```

#### 3. Incremental Indexing
```typescript
class IncrementalIndexer {
  // Only re-index changed files
  async handleFileChange(uri: vscode.Uri): Promise<void> {
    const oldHash = this.fileHashes.get(uri.path);
    const newHash = await this.computeHash(uri);
    
    if (oldHash !== newHash) {
      await this.indexFile(uri);
      this.fileHashes.set(uri.path, newHash);
    }
  }
  
  // Background indexing during idle time
  async backgroundIndex(): Promise<void> {
    if (this.isUserIdle()) {
      const unindexedFiles = await this.findUnindexedFiles();
      for (const file of unindexedFiles) {
        await this.indexFile(file);
        
        // Yield to avoid blocking
        await new Promise(resolve => setImmediate(resolve));
      }
    }
  }
}
```

#### 4. Token Optimization
```typescript
class ContextOptimizer {
  // Compress context to fit within token limits
  optimizeContext(
    context: CodeContext,
    maxTokens: number
  ): CodeContext {
    let tokens = this.countTokens(context);
    
    if (tokens <= maxTokens) return context;
    
    // Priority: current file > recent changes > related symbols
    const optimized = { ...context };
    
    // Truncate related symbols if needed
    while (tokens > maxTokens && optimized.symbols.length > 0) {
      optimized.symbols.pop();
      tokens = this.countTokens(optimized);
    }
    
    // Truncate recent changes if needed
    while (tokens > maxTokens && optimized.recentChanges.length > 0) {
      optimized.recentChanges.shift();
      tokens = this.countTokens(optimized);
    }
    
    return optimized;
  }
}
```

### Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Agent execution (single) | <2s | LLM call time |
| Full analysis (6 agents parallel) | <3s | Bottleneck is slowest agent |
| Synthesis | <1s | LLM call for synthesis |
| N2 iteration | <4s | One repair cycle |
| Symbol indexing (per file) | <100ms | Tree-sitter parsing |
| Workspace indexing (1000 files) | <30s | Background process |
| Autocomplete latency | <200ms | Must be nearly instant |

---

## Security Architecture

### Threat Model

**Threats**:
1. Malicious LLM responses (code injection)
2. Sensitive data leakage to LLM providers
3. Unauthorized file access
4. Extension privilege escalation

**Mitigations**:

#### 1. Output Sanitization
```typescript
class OutputSanitizer {
  sanitizeCode(code: string): string {
    // Remove dangerous patterns
    const dangerous = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /process\.env/gi,
      // ... more patterns
    ];
    
    for (const pattern of dangerous) {
      if (pattern.test(code)) {
        // Flag for review instead of auto-applying
        this.flagForReview(code, pattern);
        return null;
      }
    }
    
    return code;
  }
}
```

#### 2. Data Redaction
```typescript
class DataRedactor {
  redactSensitiveInfo(code: string): string {
    // Redact API keys, tokens, passwords
    return code
      .replace(/api[_-]?key\s*=\s*['"][^'"]+['"]/gi, 'api_key=<REDACTED>')
      .replace(/password\s*=\s*['"][^'"]+['"]/gi, 'password=<REDACTED>')
      .replace(/token\s*=\s*['"][^'"]+['"]/gi, 'token=<REDACTED>');
  }
  
  // User can configure sensitive patterns
  addCustomPattern(pattern: RegExp, replacement: string): void {
    this.customPatterns.push({ pattern, replacement });
  }
}
```

#### 3. Local-First Option
```typescript
class PrivacyManager {
  private mode: 'cloud' | 'local' | 'hybrid';
  
  async processRequest(request: Request): Promise<Response> {
    if (this.mode === 'local') {
      // Use only local models
      return this.processLocally(request);
    } else if (this.mode === 'cloud') {
      // Use cloud models with redaction
      const redacted = this.redactor.redact(request);
      return this.processInCloud(redacted);
    } else {
      // Hybrid: use cloud for non-sensitive, local for sensitive
      if (this.isSensitive(request)) {
        return this.processLocally(request);
      } else {
        return this.processInCloud(request);
      }
    }
  }
}
```

---

## Extension Points

### Custom Agents

```typescript
// Users can create custom agents
interface CustomAgentDefinition {
  name: string;
  role: string;
  perspective: string;
  prompt: string;
  outputFormat: string;
}

class AgentRegistry {
  registerCustomAgent(def: CustomAgentDefinition): void {
    const agent = new CustomAgent(def, this.llmManager);
    this.agents.set(def.name, agent);
  }
}
```

### Custom Workflows

```typescript
interface Workflow {
  name: string;
  agents: string[]; // Agent names
  executionMode: 'parallel' | 'sequential';
  qualityThreshold: number;
}

class WorkflowEngine {
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.name, workflow);
  }
  
  async executeWorkflow(
    name: string,
    request: Request
  ): Promise<WorkflowResult> {
    const workflow = this.workflows.get(name);
    const agents = workflow.agents.map(n => this.agentRegistry.get(n));
    
    if (workflow.executionMode === 'parallel') {
      return this.executeParallel(agents, request, workflow);
    } else {
      return this.executeSequential(agents, request, workflow);
    }
  }
}
```

---

## Deployment Architecture

### Development
```
Developer Machine
├─> VSCode fork (compiled locally)
├─> Extensions (codemind-agent)
├─> Local LLM (optional, via Ollama)
└─> Cloud LLM APIs (OpenAI, Anthropic)
```

### Production (User Installation)
```
User Machine
├─> CodeMind.app / codemind.exe
│   ├─> Electron runtime
│   ├─> VSCode core
│   └─> CodeMind extensions (bundled)
├─> Local state (SQLite)
│   ├─> Symbol index
│   ├─> Cache
│   └─> Preferences
└─> LLM connections
    ├─> Cloud (with API keys)
    └─> Local (Ollama if installed)
```

---

## Monitoring & Telemetry

**Opt-in telemetry** (user consent required):

```typescript
interface TelemetryEvent {
  event: string;
  timestamp: number;
  properties: Record<string, any>;
}

class TelemetryCollector {
  private enabled: boolean;
  
  track(event: string, properties: any): void {
    if (!this.enabled) return;
    
    // Anonymize data
    const anonymized = this.anonymize(properties);
    
    // Send to analytics (batched)
    this.buffer.push({
      event,
      timestamp: Date.now(),
      properties: anonymized
    });
  }
  
  private anonymize(data: any): any {
    // Remove PII, file paths, code content
    return {
      ...data,
      filePath: undefined,
      code: undefined,
      userId: this.hashUserId(data.userId)
    };
  }
}
```

---

## Next Steps

1. **Fork VSCode** - Set up development environment
2. **Implement Agent Base** - Create agent abstraction
3. **Build First Agent** - Security agent as POC
4. **Add ODAI Synthesis** - Central synthesis layer
5. **Implement N2 Loop** - Quality control
6. **Create UI Components** - Inline editing, diff view
7. **Integrate LSP** - Code intelligence
8. **Add LLM Providers** - OpenAI + Anthropic + local

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for step-by-step instructions.
