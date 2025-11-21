# CodeMind - The N2 Cognitive IDE

> **The first code editor with a hierarchical cognitive architecture that thinks like a developer**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active Development](https://img.shields.io/badge/Status-Active%20Development-blue.svg)]()

## What is CodeMind?

CodeMind is a revolutionary AI-powered IDE built on a VSCode fork that uses **hierarchical multi-agent cognition** to understand and improve your code. Unlike traditional AI code assistants that use a single LLM, CodeMind employs six specialized cognitive agents that analyze your code from different perspectives, then synthesize their insights through a meta-cognitive layer with built-in **N2 self-correction**.

### The Problem We Solve

Current AI code editors (Cursor, Copilot, etc.) suffer from:
- **Single-perspective analysis** - One AI model making all decisions
- **No quality verification** - Generated code accepted without validation
- **Shallow reasoning** - Quick answers without deep analysis
- **Inconsistent outputs** - Same query produces wildly different results
- **Black-box thinking** - No visibility into the reasoning process

CodeMind solves this through its unique cognitive architecture.

## Core Innovation: Hierarchical Cognitive Architecture

### Three-Layer Intelligence System

```
┌─────────────────────────────────────────────────────────────┐
│                   Meta-Cognitive Layer (N2)                  │
│              Self-evaluation and quality control             │
│  • Scores output quality (0-10)                             │
│  • Triggers refinement if score < 9                          │
│  • Ensures consistency and correctness                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                    Synthesis Layer (Central)                 │
│           ODAI Cycle: Observe -> Distill -> Adapt -> Integrate │
│  • Combines multiple agent perspectives                      │
│  • Resolves conflicts and contradictions                     │
│  • Produces unified implementation                           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│              Specialist Agent Layer (Six Agents)             │
│                                                               │
│  Architect    Engineer    Security                           │
│  Performance  Testing     Documentation                      │
│                                                               │
│  Each agent analyzes code from their specialized lens        │
└───────────────────────────────────────────────────────────────┘
```

### The Six Cognitive Agents

| Agent | Focus | What They Check |
|-------|-------|-----------------|
| **Architect** | Design & Structure | Clean architecture, SOLID principles, design patterns, maintainability |
| **Engineer** | Implementation | Correctness, edge cases, error handling, best practices |
| **Security** | Safety & Privacy | Vulnerabilities, injection risks, data exposure, auth issues |
| **Performance** | Optimization | Complexity, memory usage, bottlenecks, scaling concerns |
| **Testing** | Quality Assurance | Testability, test coverage, test cases, QA considerations |
| **Documentation** | Clarity & Communication | Code clarity, naming, comments, documentation needs |

### N2 Self-Correction Loop

The system assigns quality scores to its own outputs:
- **Score >=9**: Accept and present to user
- **Score <9**: Issue repair directive and regenerate (up to 4 iterations)

This creates **near-zero hallucination rates** and ensures consistent quality.

## Key Features

### Code Intelligence
- **Multi-perspective analysis** - Six specialized agents review every code change
- **Self-correcting generation** - Code that fails quality checks is automatically refined
- **Context-aware suggestions** - Full codebase understanding via semantic indexing
- **Symbol-level awareness** - Understands functions, classes, imports, dependencies

### Developer Experience
- **Inline editing** - Edit code in place with AI assistance (Ctrl+L)
- **Tab autocomplete** - Intelligent ghost text completions
- **Multi-file operations** - AI can modify multiple files atomically
- **Diff view** - Review AI changes before accepting
- **Command palette integration** - Access AI features from anywhere

### Privacy & Performance
- **Local-first option** - Run entirely offline with local models (Ollama, llama.cpp)
- **No telemetry** - Your code never leaves your machine (if configured)
- **Multi-provider support** - OpenAI, Anthropic, local models, custom endpoints
- **Fast execution** - Parallel agent processing for speed

### Built on VSCode
- **Full VSCode compatibility** - All extensions, themes, and settings work
- **LSP integration** - Leverages Language Server Protocol for deep code understanding
- **Terminal integration** - AI can suggest and run terminal commands
- **Git integration** - AI-assisted commit messages, PR descriptions

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Quick Start Guide](./docs/guides/QUICK_START.md)** - Get up and running in 5 minutes
- **[Implementation Guide](./docs/implementation/IMPLEMENTATION_GUIDE.md)** - Full setup and build instructions
- **[Agent System Architecture](./docs/design/AGENT_SYSTEM.md)** - Deep dive into the multi-agent system
- **[Orchestrator Design](./docs/design/ORCHESTRATOR_DESIGN.md)** - Multi-file operation system (Phase 3)
- **[Implementation Plan](./docs/implementation/IMPLEMENTATION_PLAN.md)** - Current progress and roadmap
- **[UI Design Principles](./docs/design/UI_DESIGN_PRINCIPLES.md)** - UI/UX guidelines

See the **[docs README](./docs/README.md)** for the complete documentation index.

## Quick Start

```bash
# Clone repository
git clone https://github.com/vincitamore/codemind.git
cd codemind/vscode

# Install Node.js 22+ (required)
nvm install 22
nvm use 22

# Install dependencies
npm install

# Build and watch for changes
npm run watch

# In another terminal, run CodeMind
npm run start
```

### Configure OpenRouter (Current Provider)

1. Get your API key from [OpenRouter](https://openrouter.ai)
2. Open VSCode Settings (Ctrl+,)
3. Search for "OpenRouter"
4. Add your API key:

```json
// settings.json
{
  "codemind.openrouter.apiKey": "sk-or-v1-...",
  "codemind.openrouter.model": "x-ai/grok-4.1-fast"
}
```

5. Use `Ctrl+L` to activate inline code editing

See **[QUICK_START.md](./docs/guides/QUICK_START.md)** for detailed setup instructions.

## Target Performance Metrics

| Metric | CodeMind Target |
|--------|----------|
| Code Quality Score | 9.2/10 |
| Bug Detection Rate | 94% |
| Security Vulnerability Detection | 96% |
| False Positive Rate | 3% |
| Hallucination Rate | <2% |
| Response Time (P95) | 4.2s |

*Metrics based on internal testing goals*

## How It Works

### 1. You Make a Request
```
User: "Add error handling to this function"
```

### 2. Six Agents Analyze in Parallel
```
Architect:  Wrap in try-catch, add error types
Engineer:   Validate inputs, handle edge cases  
Security:   Sanitize error messages, no data leaks
Performance: Avoid expensive error tracking in hot path
Testing:    Add test cases for error scenarios
Documentation: Document error types and recovery
```

### 3. Central Synthesizer Combines Insights
```
Synthesis Layer:
• Observes all agent recommendations
• Distills core requirements
• Resolves any conflicts
• Assigns quality score: 8.7/10
```

### 4. N2 Loop Triggers Refinement (Score <9)
```
Repair Directive: "Add input validation, improve error types"
-> Agents re-analyze with directive
-> New synthesis: 9.4/10 Accept
```

### 5. Present to User with Diff View
```typescript
function processData(data) {
+  if (!data || typeof data !== 'object') {
+    throw new ValidationError('Invalid data object');
+  }
+  
+  try {
     // existing logic
+  } catch (error) {
+    logger.error('Data processing failed', { 
+      error: sanitizeError(error) 
+    });
+    throw new ProcessingError('Data processing failed');
+  }
}
```

## Architecture

### Technology Stack
- **Base**: VSCode fork (TypeScript, Electron)
- **Agent System**: Custom TypeScript framework
- **LLM Integration**: OpenAI, Anthropic, Ollama
- **Code Intelligence**: Tree-sitter parsers, LSP
- **State**: SQLite for local state
- **Vector DB**: Embedded vector store for semantic search

### Key Components
```
codemind/
├── core/                    # VSCode fork
├── extensions/
│   └── codemind-agent/     # AI agent extension
├── agents/                  # Agent implementations
│   ├── architect/
│   ├── engineer/
│   ├── security/
│   ├── performance/
│   ├── testing/
│   ├── documentation/
│   └── orchestrator/       # Synthesis & N2 loop
├── providers/              # LLM provider adapters
├── indexer/                # Code intelligence
└── ui/                     # Custom UI components
```

## Use Cases

### Code Generation
Ask for complex features and get production-ready code that's been reviewed by six specialists.

### Code Review
Automated multi-perspective code review catching bugs, security issues, and performance problems.

### Refactoring
Intelligent refactoring suggestions that consider architecture, performance, and maintainability.

### Bug Fixing
AI that understands the root cause, considers edge cases, and provides tested solutions.

### Documentation
Automatic generation of clear, comprehensive documentation based on code analysis.

### Learning
Understand *why* code is written a certain way through multi-perspective explanations.

## Roadmap

### Phase 1: Foundation ✅ COMPLETE
- ✅ VSCode fork setup and build system
- ✅ Basic agent framework
- ✅ ODAI synthesis cycle
- ✅ N2 self-correction loop with early stopping
- ✅ OpenRouter integration (Grok, Claude, Llama, Gemini)
- ✅ Inline editing (Ctrl+L)

### Phase 2: Core Agent System ✅ COMPLETE
- ✅ All six specialist agents implemented
- ✅ Task-aware agents with relevance scoring
- ✅ Weighted quality scoring (relevance × confidence)
- ✅ Full file context + diagnostic integration
- ✅ Robust JSON parsing with multiple fallbacks
- ✅ Beautiful custom UI (progress, results, analysis panels)
- ✅ Inline diff viewer with GitHub-style decorations
- ✅ Retry logic with exponential backoff
- ✅ Empty document detection for comprehensive generation

### Phase 3: Orchestrator & Chat 🚧 IN PLANNING
- [ ] Orchestrator agent (task decomposition, multi-file planning)
- [ ] Chat/Composer interface (primary interaction point)
- [ ] Git worktree integration (instant rollback to any message)
- [ ] Session management (save/load conversations)
- [ ] Multi-file atomic operations with conflict detection
- [ ] Workspace context manager (intelligent file gathering)
- [ ] Verification system (compilation, linting, tests)
- [ ] Terminal integration (run commands, tests, builds)

See **[ORCHESTRATOR_TODO.md](./docs/implementation/ORCHESTRATOR_TODO.md)** for the complete 10-phase roadmap (5-6 weeks).

### Phase 4: Intelligence (Future)
- [ ] Semantic code search with vector embeddings
- [ ] Cross-file refactoring
- [ ] Advanced debugging assistance
- [ ] Test generation with coverage analysis
- [ ] Security scanning with vulnerability database

### Phase 5: Polish (Future)
- [ ] Performance optimization (caching, parallelization)
- [ ] Extension marketplace integration
- [ ] Cloud sync (optional, privacy-respecting)
- [ ] Collaboration features
- [ ] Public beta release

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
# Fork and clone
git clone https://github.com/yourusername/codemind.git

# Install dependencies
npm install

# Run in development mode
npm run watch

# Run tests
npm test
```

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Built on [Visual Studio Code](https://github.com/microsoft/vscode)
- Inspired by cognitive psychology and hierarchical processing theories
- Agent architecture adapted from advanced hierarchical multi-agent research

## Community

- **Documentation**: [docs.codemind.dev](https://docs.codemind.dev)
- **Discord**: [discord.gg/codemind](https://discord.gg/codemind)
- **Twitter**: [@codemind_ai](https://twitter.com/codemind_ai)
- **Issues**: [GitHub Issues](https://github.com/yourusername/codemind/issues)

---

**Built with for developers who care about code quality**

*"True code intelligence emerges not from a single AI, but from the synthesis of many specialized perspectives, continuously refined through self-correction."*
