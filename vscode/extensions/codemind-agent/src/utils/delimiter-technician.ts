/**
 * Delimiter Technician
 * 
 * Context-aware LLM agent that repairs malformed markdown responses.
 * Unlike YAML Technician, this understands WHO called it and WHAT structure is expected.
 */

import { LLMProvider, LLMConfig } from '../llm/provider';
import { extractMarkdown, MarkdownParseResult } from './markdown-parser';

/**
 * Context for Delimiter Technician to understand what it's repairing
 */
export interface DelimiterContext {
  source: 'specialist-agent' | 'odai-observe' | 'odai-distill' | 'odai-adapt' | 'orchestrator';
  agentRole?: 'architect' | 'engineer' | 'security' | 'performance' | 'testing' | 'documentation';
  expectedStructure: {
    sections: string[];       // e.g., ['ANALYSIS', 'INSIGHTS', 'ISSUES', 'RECOMMENDATIONS', 'METADATA']
    requiredFields: string[]; // e.g., ['confidence', 'relevance']
  };
  additionalContext?: string; // Any extra context for repair
}

/**
 * Delimiter Technician class
 */
export class DelimiterTechnician {
  constructor(
    private llmProvider: LLMProvider,
    private config: LLMConfig
  ) {}

  /**
   * Attempt to repair malformed markdown with context awareness
   */
  async repairMarkdown(
    malformedMarkdown: string,
    context: DelimiterContext
  ): Promise<string> {
    console.log(`[Delimiter-Technician] Attempting to repair markdown for: ${context.source}${context.agentRole ? ` (${context.agentRole})` : ''}`);
    console.log(`[Delimiter-Technician] Malformed length: ${malformedMarkdown.length} chars`);
    
    const prompt = this.buildRepairPrompt(malformedMarkdown, context);
    
    try {
      const response = await this.llmProvider.generate(
        [
          {
            role: 'system',
            content: `You are the Delimiter Technician - a markdown formatting expert.

Your ONLY job: Take malformed markdown and fix its structure while PRESERVING ALL CONTENT.

Rules:
1. NEVER remove or change the actual content/data
2. ONLY fix structural issues (missing ##, wrong **Field:** format, etc.)
3. Keep all insights, recommendations, issues, descriptions intact
4. Ensure proper markdown section headers (## and ###)
5. Ensure proper field format (**Field:** value)
6. Do NOT add new content or hallucinate data
7. Output ONLY the repaired markdown, no explanations`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        { ...this.config, temperature: 0.1 } // Very low temperature - we want precision
      );
      
      const repaired = extractMarkdown(response.content);
      console.log(`[Delimiter-Technician] Repaired length: ${repaired.length} chars`);
      
      return repaired;
      
    } catch (error) {
      console.error(`[Delimiter-Technician] Repair failed:`, error);
      throw new Error(`Delimiter Technician repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build context-aware repair prompt
   */
  private buildRepairPrompt(malformedMarkdown: string, context: DelimiterContext): string {
    let prompt = `# Task: Fix Malformed Markdown Structure

## Context
Source: ${context.source}${context.agentRole ? ` (${context.agentRole} agent)` : ''}

## Expected Structure
This response should have these sections:
${context.expectedStructure.sections.map(s => `- ## ${s}`).join('\n')}

Required fields in METADATA:
${context.expectedStructure.requiredFields.map(f => `- **${f.charAt(0).toUpperCase() + f.slice(1)}:** <value>`).join('\n')}

`;

    // Add source-specific examples
    if (context.source === 'specialist-agent') {
      prompt += `
## Expected Format (Specialist Agent):
\`\`\`markdown
## ANALYSIS

### INSIGHTS
- Key insight 1: with any punctuation, colons: work fine!
- Key insight 2: "quoted text" is perfectly valid

### ISSUES

#### CRITICAL
**Type:** issue_type
**Description:** Detailed description can span multiple lines
**Fix:** How to fix it
**Impact:** High/Medium/Low

#### WARNINGS
(same format as CRITICAL)

#### SUGGESTIONS
(same format as CRITICAL)

### RECOMMENDATIONS
- Recommendation 1: Use standard patterns
- Recommendation 2: Improve error handling

## METADATA
**Confidence:** 0.9
**Relevance:** 0.85
\`\`\`
`;
    } else if (context.source === 'odai-observe') {
      prompt += `
## Expected Format (ODAI Observe):
\`\`\`markdown
## OBSERVATIONS

### PATTERNS
- Pattern 1
- Pattern 2

### CONFLICTS
- Conflict 1

### GAPS
- Gap 1

## METADATA
**Quality Score:** 8.5
\`\`\`
`;
    } else if (context.source === 'odai-distill') {
      prompt += `
## Expected Format (ODAI Distill):
\`\`\`markdown
## SYNTHESIS

### CORE REQUIREMENTS
- Requirement 1
- Requirement 2

### KEY CONSTRAINTS
- Constraint 1

### IMPLEMENTATION PRINCIPLES
- Principle 1

## METADATA
**Quality Score:** 9.0
**Scoring Rationale:** Why this score
\`\`\`
`;
    } else if (context.source === 'orchestrator') {
      prompt += `
## Expected Format (Orchestrator Plan):
\`\`\`markdown
## TASK
code_generation

## SUMMARY
Brief description

## STEPS

### STEP 1: filename.ts
**Operation:** create
**Rationale:** Why this is needed
**Priority:** 1

### STEP 2: another-file.ts
**Operation:** modify
**Rationale:** Standard: patterns work, "quotes" work, colons: everywhere!
**Priority:** 2

## METADATA
**Required Files:** file1.ts, file2.ts
**Affected Files:** output1.ts, output2.ts
**Complexity:** medium
**Confidence:** 0.95
\`\`\`
`;
    }

    if (context.additionalContext) {
      prompt += `\n## Additional Context\n${context.additionalContext}\n`;
    }

    prompt += `
## Malformed Markdown to Fix:
\`\`\`
${malformedMarkdown}
\`\`\`

## Your Task:
Fix the structure ONLY. Preserve all content exactly. Output the corrected markdown.`;

    return prompt;
  }
}

/**
 * Helper function: Parse markdown with Delimiter Technician fallback
 */
export async function parseMarkdownWithTechnician<T>(
  markdown: string,
  llmProvider: LLMProvider,
  config: LLMConfig,
  context: DelimiterContext,
  parser: (md: string) => MarkdownParseResult<T>
): Promise<T | null> {
  // Tier 1: Direct parse
  console.log(`[Markdown-Parse] Attempting to parse ${context.source}...`);
  let result = parser(markdown);
  
  if (result.success && result.data) {
    console.log(`[Markdown-Parse] ✅ Direct parse succeeded`);
    return result.data;
  }
  
  console.log(`[Markdown-Parse] ❌ Direct parse failed: ${result.error}`);
  
  // Tier 2: Delimiter Technician repair
  console.log(`[Markdown-Parse] Tier 2: Calling Delimiter Technician...`);
  
  try {
    const technician = new DelimiterTechnician(llmProvider, config);
    const repaired = await technician.repairMarkdown(markdown, context);
    
    // Try parsing repaired markdown
    result = parser(repaired);
    
    if (result.success && result.data) {
      console.log(`[Markdown-Parse] ✅ Tier 2 success - Delimiter Technician fixed it!`);
      return result.data;
    }
    
    console.log(`[Markdown-Parse] ❌ Tier 2 failed even after repair: ${result.error}`);
    
  } catch (error) {
    console.error(`[Markdown-Parse] Delimiter Technician error:`, error);
  }
  
  // All attempts failed
  console.error(`[Markdown-Parse] All parsing attempts failed for ${context.source}`);
  return null;
}

/**
 * Pre-defined contexts for common use cases
 */
export const DELIMITER_CONTEXTS = {
  SPECIALIST_AGENT: (agentRole: 'architect' | 'engineer' | 'security' | 'performance' | 'testing' | 'documentation'): DelimiterContext => ({
    source: 'specialist-agent',
    agentRole,
    expectedStructure: {
      sections: ['ANALYSIS', 'INSIGHTS', 'ISSUES', 'RECOMMENDATIONS', 'METADATA'],
      requiredFields: ['confidence', 'relevance']
    }
  }),
  
  ODAI_OBSERVE: (): DelimiterContext => ({
    source: 'odai-observe',
    expectedStructure: {
      sections: ['OBSERVATIONS', 'PATTERNS', 'CONFLICTS', 'GAPS', 'METADATA'],
      requiredFields: ['qualityScore']
    }
  }),
  
  ODAI_DISTILL: (): DelimiterContext => ({
    source: 'odai-distill',
    expectedStructure: {
      sections: ['SYNTHESIS', 'CORE REQUIREMENTS', 'KEY CONSTRAINTS', 'IMPLEMENTATION PRINCIPLES', 'METADATA'],
      requiredFields: ['qualityScore', 'scoringRationale']
    }
  }),
  
  ORCHESTRATOR_PLAN: (): DelimiterContext => ({
    source: 'orchestrator',
    expectedStructure: {
      sections: ['TASK', 'SUMMARY', 'STEPS', 'METADATA'],
      requiredFields: ['confidence', 'complexity']
    }
  })
};

