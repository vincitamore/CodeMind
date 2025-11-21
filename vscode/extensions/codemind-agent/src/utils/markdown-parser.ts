/**
 * Markdown Parser for Agent Responses
 * 
 * Parses markdown-formatted responses with section delimiters.
 * NO ESCAPING NEEDED! Colons, quotes, and any punctuation work naturally.
 */

export interface MarkdownParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Extract content between markdown code blocks or return raw content
 */
export function extractMarkdown(text: string): string {
  // Try to extract from ```markdown or ``` code blocks
  const markdownMatch = text.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }
  
  // Return raw text (no code blocks)
  return text.trim();
}

/**
 * Parse specialist agent response (Architect, Engineer, Security, etc.)
 * 
 * Expected format:
 * ## ANALYSIS
 * 
 * ### INSIGHTS
 * - Insight 1
 * - Insight 2
 * 
 * ### ISSUES
 * 
 * #### CRITICAL
 * **Type:** security_vulnerability
 * **Description:** Details here
 * **Fix:** How to fix
 * **Impact:** High
 * 
 * #### WARNINGS
 * ...
 * 
 * #### SUGGESTIONS
 * ...
 * 
 * ### RECOMMENDATIONS
 * - Recommendation 1
 * - Recommendation 2
 * 
 * ## METADATA
 * **Confidence:** 0.9
 * **Relevance:** 0.85
 */
export function parseAgentResponse(markdown: string): MarkdownParseResult<{
  insights: string[];
  issues: {
    critical: any[];
    warnings: any[];
    suggestions: any[];
  };
  recommendations: string[];
  confidence: number;
  relevance: number;
}> {
  try {
    const content = extractMarkdown(markdown);
    
    // Extract INSIGHTS
    const insights: string[] = [];
    const insightsMatch = content.match(/###\s*INSIGHTS\s*\n([\s\S]*?)(?=\n##|\n###|$)/i);
    if (insightsMatch) {
      const insightLines = insightsMatch[1].match(/^\s*[-*]\s+(.+)$/gm);
      if (insightLines) {
        insights.push(...insightLines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()));
      }
    }
    
    // Extract ISSUES
    const issues = {
      critical: [] as any[],
      warnings: [] as any[],
      suggestions: [] as any[]
    };
    
    // Extract CRITICAL issues
    const criticalMatch = content.match(/####\s*CRITICAL\s*\n([\s\S]*?)(?=\n####|\n###|\n##|$)/i);
    if (criticalMatch) {
      issues.critical = extractIssueBlocks(criticalMatch[1]);
    }
    
    // Extract WARNINGS
    const warningsMatch = content.match(/####\s*WARNINGS?\s*\n([\s\S]*?)(?=\n####|\n###|\n##|$)/i);
    if (warningsMatch) {
      issues.warnings = extractIssueBlocks(warningsMatch[1]);
    }
    
    // Extract SUGGESTIONS
    const suggestionsMatch = content.match(/####\s*SUGGESTIONS?\s*\n([\s\S]*?)(?=\n####|\n###|\n##|$)/i);
    if (suggestionsMatch) {
      issues.suggestions = extractIssueBlocks(suggestionsMatch[1]);
    }
    
    // Extract RECOMMENDATIONS
    const recommendations: string[] = [];
    const recsMatch = content.match(/###\s*RECOMMENDATIONS?\s*\n([\s\S]*?)(?=\n##|\n###|$)/i);
    if (recsMatch) {
      const recLines = recsMatch[1].match(/^\s*[-*]\s+(.+)$/gm);
      if (recLines) {
        recommendations.push(...recLines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()));
      }
    }
    
    // Extract METADATA
    const confidenceMatch = content.match(/\*\*Confidence:\*\*\s*([0-9.]+)/i);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;
    
    const relevanceMatch = content.match(/\*\*Relevance:\*\*\s*([0-9.]+)/i);
    const relevance = relevanceMatch ? parseFloat(relevanceMatch[1]) : 0.8;
    
    return {
      success: true,
      data: {
        insights,
        issues,
        recommendations,
        confidence,
        relevance
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

/**
 * Extract issue blocks from a section
 * Each issue is a block with **Field:** value patterns
 */
function extractIssueBlocks(content: string): any[] {
  const issues: any[] = [];
  
  // Split by blank lines to get individual issues
  const blocks = content.split(/\n\s*\n/);
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    const issue: any = {};
    
    // Extract fields
    const typeMatch = block.match(/\*\*Type:\*\*\s*(.+?)(?=\n|$)/i);
    if (typeMatch) issue.type = typeMatch[1].trim();
    
    const descMatch = block.match(/\*\*Description:\*\*\s*(.+?)(?=\n\*\*|$)/is);
    if (descMatch) issue.description = descMatch[1].trim();
    
    const fixMatch = block.match(/\*\*Fix:\*\*\s*(.+?)(?=\n\*\*|$)/is);
    if (fixMatch) issue.fix = fixMatch[1].trim();
    
    const impactMatch = block.match(/\*\*Impact:\*\*\s*(.+?)(?=\n|$)/i);
    if (impactMatch) issue.impact = impactMatch[1].trim();
    
    const lineMatch = block.match(/\*\*Line:\*\*\s*(\d+)/i);
    if (lineMatch) issue.line = parseInt(lineMatch[1]);
    
    if (Object.keys(issue).length > 0) {
      issues.push(issue);
    }
  }
  
  return issues;
}

/**
 * Parse ODAI Observe phase response
 * 
 * Expected format:
 * ## OBSERVATIONS
 * 
 * ### PATTERNS
 * - Pattern 1
 * - Pattern 2
 * 
 * ### CONFLICTS
 * - Conflict 1
 * 
 * ### GAPS
 * - Gap 1
 * 
 * ## METADATA
 * **Quality Score:** 8.5
 */
export function parseODAIObserve(markdown: string): MarkdownParseResult<{
  patterns: string[];
  conflicts: string[];
  gaps: string[];
  qualityScore?: number;
}> {
  try {
    const content = extractMarkdown(markdown);
    
    // Extract PATTERNS
    const patterns: string[] = [];
    const patternsMatch = content.match(/###\s*PATTERNS?\s*\n([\s\S]*?)(?=\n##|\n###|$)/i);
    if (patternsMatch) {
      const lines = patternsMatch[1].match(/^\s*[-*]\s+(.+)$/gm);
      if (lines) {
        patterns.push(...lines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()));
      }
    }
    
    // Extract CONFLICTS
    const conflicts: string[] = [];
    const conflictsMatch = content.match(/###\s*CONFLICTS?\s*\n([\s\S]*?)(?=\n##|\n###|$)/i);
    if (conflictsMatch) {
      const lines = conflictsMatch[1].match(/^\s*[-*]\s+(.+)$/gm);
      if (lines) {
        conflicts.push(...lines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()));
      }
    }
    
    // Extract GAPS
    const gaps: string[] = [];
    const gapsMatch = content.match(/###\s*GAPS?\s*\n([\s\S]*?)(?=\n##|\n###|$)/i);
    if (gapsMatch) {
      const lines = gapsMatch[1].match(/^\s*[-*]\s+(.+)$/gm);
      if (lines) {
        gaps.push(...lines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()));
      }
    }
    
    // Extract quality score
    const scoreMatch = content.match(/\*\*Quality\s*Score:\*\*\s*([0-9.]+)/i);
    const qualityScore = scoreMatch ? parseFloat(scoreMatch[1]) : undefined;
    
    return {
      success: true,
      data: {
        patterns,
        conflicts,
        gaps,
        qualityScore
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

/**
 * Parse ODAI Distill phase response
 * 
 * Expected format:
 * ## SYNTHESIS
 * 
 * ### CORE REQUIREMENTS
 * - Requirement 1
 * - Requirement 2
 * 
 * ### KEY CONSTRAINTS
 * - Constraint 1
 * 
 * ### IMPLEMENTATION PRINCIPLES
 * - Principle 1
 * 
 * ## METADATA
 * **Quality Score:** 9.0
 * **Scoring Rationale:** Why this score
 */
export function parseODAIDistill(markdown: string): MarkdownParseResult<{
  coreRequirements: string[];
  keyConstraints: string[];
  implementationPrinciples: string[];
  qualityScore: number;
  scoringRationale?: string;
}> {
  try {
    const content = extractMarkdown(markdown);
    
    // Extract CORE REQUIREMENTS
    const coreRequirements: string[] = [];
    const reqMatch = content.match(/###\s*CORE\s*REQUIREMENTS?\s*\n([\s\S]*?)(?=\n##|\n###|$)/i);
    if (reqMatch) {
      const lines = reqMatch[1].match(/^\s*[-*]\s+(.+)$/gm);
      if (lines) {
        coreRequirements.push(...lines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()));
      }
    }
    
    // Extract KEY CONSTRAINTS
    const keyConstraints: string[] = [];
    const constMatch = content.match(/###\s*KEY\s*CONSTRAINTS?\s*\n([\s\S]*?)(?=\n##|\n###|$)/i);
    if (constMatch) {
      const lines = constMatch[1].match(/^\s*[-*]\s+(.+)$/gm);
      if (lines) {
        keyConstraints.push(...lines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()));
      }
    }
    
    // Extract IMPLEMENTATION PRINCIPLES
    const implementationPrinciples: string[] = [];
    const prinMatch = content.match(/###\s*IMPLEMENTATION\s*PRINCIPLES?\s*\n([\s\S]*?)(?=\n##|\n###|$)/i);
    if (prinMatch) {
      const lines = prinMatch[1].match(/^\s*[-*]\s+(.+)$/gm);
      if (lines) {
        implementationPrinciples.push(...lines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()));
      }
    }
    
    // Extract quality score
    const scoreMatch = content.match(/\*\*Quality\s*Score:\*\*\s*([0-9.]+)/i);
    const qualityScore = scoreMatch ? parseFloat(scoreMatch[1]) : 7.0;
    
    // Extract rationale
    const rationaleMatch = content.match(/\*\*Scoring\s*Rationale:\*\*\s*(.+?)(?=\n\*\*|$)/is);
    const scoringRationale = rationaleMatch ? rationaleMatch[1].trim() : undefined;
    
    return {
      success: true,
      data: {
        coreRequirements,
        keyConstraints,
        implementationPrinciples,
        qualityScore,
        scoringRationale
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

/**
 * Validate markdown parse result and provide detailed error
 */
export function validateMarkdownParse<T>(
  result: MarkdownParseResult<T>,
  context: string
): result is { success: true; data: T } {
  if (!result.success) {
    console.error(`[Markdown-Parse] Failed to parse ${context}:`, result.error);
    return false;
  }
  
  if (!result.data) {
    console.error(`[Markdown-Parse] No data extracted for ${context}`);
    return false;
  }
  
  return true;
}

