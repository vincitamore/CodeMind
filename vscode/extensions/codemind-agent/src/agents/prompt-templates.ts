/**
 * Prompt template utilities for consistent agent instructions
 */

/**
 * Standard YAML output instructions that all agents should include
 */
export const YAML_OUTPUT_INSTRUCTIONS = `
CRITICAL OUTPUT FORMAT INSTRUCTIONS:
1. Return ONLY valid YAML (no markdown, no code blocks, no backticks)
2. Do NOT wrap your response in \`\`\`yaml or \`\`\` markers
3. Use 2 spaces for indentation (NEVER tabs)
4. QUOTE strings containing special characters:
   - Quote if contains: : { } [ ] , & * # ? | - < > = ! % @ \\
   - Quote if starts with: @ \` | > & * ! %
   - Quote if contains quotes: use 'single' or "double" quotes
5. Multiline strings: use | or > for block scalars
6. Lists use "- " (dash-space) prefix
7. Empty arrays/objects: use [] or {}

Example of CORRECT output:
insights:
  - Key observation 1
  - Key observation 2
issues:
  critical:
    - type: issue_type
      line: 10
      description: Simple description
      fix: "Use quotes when: colons or special chars present"
      impact: Impact statement
  warnings: []
  suggestions: []
recommendations:
  - Recommendation 1
  - Recommendation 2
confidence: 0.90
relevance: 0.85

Example of WRONG output (DO NOT DO THIS):
\`\`\`yaml
insights:
- Bad indentation (use 2 spaces)
  fix: Use "dependency": "^1.0.0" without quotes (WRONG - unquoted colon)
\`\`\`
`;

/**
 * Add standard instructions to any prompt
 */
export function addStandardInstructions(prompt: string): string {
  return prompt + '\n\n' + YAML_OUTPUT_INSTRUCTIONS;
}

