# Contributing to CodeMind

Thank you for your interest in contributing to CodeMind! This document provides guidelines for contributing to the project.

## 🎯 Project Vision

CodeMind is building the world's first IDE with true hierarchical cognitive architecture. Our goal is not to be the fastest AI code assistant, but the most **reliable** and **thorough** - thinking like a senior development team.

## 🧠 Core Principles

Before contributing, please understand our non-negotiable core principles:

1. **Hierarchical Architecture** - Three layers (Specialists → Synthesis → Quality Control)
2. **N² Self-Correction** - Quality threshold must be enforced
3. **Six Cognitive Perspectives** - Architecture, Engineering, Security, Performance, Testing, Documentation
4. **ODAI Synthesis** - Observe → Distill → Adapt → Integrate
5. **Local-First** - Must work 100% offline with local models

**Never compromise these principles for convenience or speed.**

## 🤝 Ways to Contribute

### 1. Code Contributions

**Areas We Need Help**:
- Additional language support (Java, C#, Ruby, etc.)
- Agent prompt optimization
- Performance improvements
- UI/UX enhancements
- Test coverage
- Bug fixes

**Before Starting**:
1. Check existing issues or create one
2. Discuss your approach in the issue
3. Wait for maintainer approval
4. Fork the repository
5. Create a feature branch

### 2. Agent Improvements

**Improving Existing Agents**:
- Better prompts (more specific, clearer instructions)
- Additional checks (edge cases, patterns)
- Improved response parsing
- Language-specific optimizations

**Adding New Agents** (carefully):
- Must serve a distinct cognitive purpose
- Cannot overlap with existing six
- Requires strong justification
- Needs community discussion

### 3. Documentation

- User guides and tutorials
- API documentation
- Code examples
- Video content
- Translation (internationalization)

### 4. Testing

- Bug reports with reproduction steps
- Performance benchmarking
- Security testing
- Usability testing

### 5. Community

- Answer questions on Discord
- Write blog posts
- Create templates
- Share use cases

## 📋 Development Setup

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed setup instructions.

**Quick Start**:
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/codemind.git
cd codemind

# Install dependencies
npm install

# Build VSCode
npm run watch

# Run in development
./scripts/code.sh
```

## 🔧 Code Standards

### TypeScript Style

```typescript
// Good: Clear, typed, documented
/**
 * Analyzes code from security perspective
 * @param code - Code to analyze
 * @param context - Surrounding code context
 * @returns Structured security analysis
 */
async function analyzeCodeSecurity(
  code: string,
  context: CodeContext
): Promise<SecurityAnalysis> {
  // Implementation
}

// Bad: Unclear, untyped, undocumented
async function analyze(c, ctx) {
  // What does this analyze?
}
```

### Naming Conventions

- **Classes**: PascalCase (`SecurityAgent`, `ODAISynthesizer`)
- **Functions**: camelCase (`analyzeCode`, `gatherContext`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITERATIONS`, `QUALITY_THRESHOLD`)
- **Interfaces**: PascalCase with I prefix (`ILLMProvider`, `IAgent`)
- **Files**: kebab-case (`security-agent.ts`, `odai-synthesizer.ts`)

### Documentation

**Every public API must have**:
- JSDoc comment explaining purpose
- Parameter descriptions with types
- Return value description
- Example usage (for complex APIs)
- Notes on edge cases or caveats

**Example**:
```typescript
/**
 * Executes N² self-correction loop until quality threshold met
 * 
 * Runs agent analysis iteratively, synthesizing results and checking
 * quality. If quality score < threshold, generates repair directive
 * and re-executes. Stops after maxIterations.
 * 
 * @param request - User's request/instruction
 * @param agents - Array of specialized agents to execute
 * @param synthesizer - ODAI synthesizer for combining perspectives
 * @param context - Code context including file, language, symbols
 * @returns Result with generated code, quality score, and history
 * 
 * @example
 * ```typescript
 * const result = await n2Controller.execute(
 *   "Add error handling",
 *   agents,
 *   synthesizer,
 *   context
 * );
 * console.log(`Quality: ${result.qualityScore}/10`);
 * ```
 * 
 * @throws {Error} If no agents provided
 * @throws {Error} If LLM provider unavailable
 */
async execute(
  request: string,
  agents: Agent[],
  synthesizer: ODAISynthesizer,
  context: CodeContext
): Promise<N2Result>
```

## 🧪 Testing Requirements

**All code contributions must include tests.**

### Unit Tests

```typescript
// extensions/codemind-agent/src/test/suite/agent.test.ts
import * as assert from 'assert';
import { SecurityAgent } from '../../agents/security-agent';

suite('Security Agent Tests', () => {
  test('Detects SQL injection vulnerability', async () => {
    const agent = new SecurityAgent(mockProvider, config);
    
    const vulnerableCode = `
      db.query("SELECT * FROM users WHERE id = " + userId)
    `;
    
    const analysis = await agent.analyze(
      'Review this code',
      { code: vulnerableCode, language: 'javascript', filePath: 'test.js' }
    );
    
    assert.ok(
      analysis.issues.critical.some(i => i.type.includes('injection')),
      'Should detect SQL injection'
    );
  });
});
```

### Integration Tests

Test full workflows end-to-end:
```typescript
test('Full N² loop produces quality code', async () => {
  const result = await n2Controller.execute(
    'Add error handling',
    agents,
    synthesizer,
    context
  );
  
  assert.ok(result.success);
  assert.ok(result.qualityScore >= 9.0);
  assert.ok(result.output.includes('try'));
  assert.ok(result.output.includes('catch'));
});
```

### Performance Tests

```typescript
test('Parallel agent execution completes quickly', async () => {
  const start = Date.now();
  const analyses = await Promise.all(
    agents.map(a => a.analyze(request, context))
  );
  const duration = Date.now() - start;
  
  assert.ok(duration < 5000, 'Should complete in <5s');
});
```

## 📝 Pull Request Process

### 1. Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] No merge conflicts

### 2. PR Title Format

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting, missing semicolons, etc.
- refactor: Code restructuring
- perf: Performance improvement
- test: Adding tests
- chore: Maintenance tasks

Examples:
feat(agent): add Rust language support
fix(synthesis): handle empty agent responses
docs(readme): add troubleshooting section
perf(parser): optimize symbol extraction
```

### 3. PR Description Template

```markdown
## What does this PR do?
Brief description of changes

## Why is this needed?
Context and motivation

## How was this tested?
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing performed
- [ ] Performance impact measured

## Screenshots (if UI changes)
[Attach screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues
Closes #123
```

### 4. Review Process

1. **Automated Checks** run (CI/CD)
2. **Maintainer Review** (1-2 business days)
3. **Feedback Addressed** (make requested changes)
4. **Final Approval** and merge

## 🐛 Bug Reports

**Use this template**:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Open file X
2. Select code Y
3. Press Ctrl+K
4. Type "Z"
5. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- CodeMind Version: 0.1.0
- VSCode Version: 1.85.0
- OS: macOS 14.0
- LLM Provider: OpenAI
- Model: gpt-4-turbo

## Logs/Screenshots
[Attach relevant logs or screenshots]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

**Use this template**:

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this needed? What problem does it solve?

## Proposed Solution
How might this work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Mockups, examples, etc.
```

## 🏗️ Architecture Decisions

For significant architectural changes:

1. Create an **Architecture Decision Record (ADR)**
2. Post in Discussions for community feedback
3. Wait for maintainer approval
4. Implement after consensus

**ADR Template**:
```markdown
# ADR-XXX: Title

## Status
Proposed / Accepted / Rejected

## Context
What is the issue we're facing?

## Decision
What are we doing?

## Consequences
What are the trade-offs?

## Alternatives Considered
What else did we think about?
```

## 🎨 Design Contributions

UI/UX improvements are welcome!

**Guidelines**:
- Follow VSCode design language
- Ensure dark mode support
- Maintain accessibility (WCAG 2.1 AA)
- Test on multiple screen sizes
- Include mockups in PR

## 🌍 Internationalization

We welcome translations!

**Process**:
1. Check `src/i18n/locales/` for existing languages
2. Copy `en.json` as starting point
3. Translate all strings
4. Test in your language
5. Submit PR

## 📜 Code of Conduct

### Our Standards

- **Be respectful** of differing viewpoints
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Be professional** in all interactions
- **Be inclusive** and welcoming

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Unethical or unprofessional conduct

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: conduct@codemind.dev

## 📞 Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Discord**: Real-time chat, community support
- **Twitter**: Announcements, updates

## 🙏 Recognition

Contributors are recognized in:
- README.md (Contributors section)
- Release notes
- Monthly contributor spotlight (Discord)

**Top Contributors** may be invited to:
- Maintainer team
- Beta testing
- Community events

## 📚 Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Agent System Details](./AGENT_SYSTEM.md)
- [Design Principles](./DESIGN_PRINCIPLES.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Development Roadmap](./ROADMAP.md)

## ❓ Questions?

- Read the docs first
- Search existing issues
- Ask in Discord #help channel
- Create a discussion thread

---

**Thank you for contributing to CodeMind! Together we're building the future of AI-powered coding.** 🚀

*By contributing, you agree that your contributions will be licensed under the MIT License.*
