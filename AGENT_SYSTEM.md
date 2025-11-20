# CodeMind Agent System

> **The hierarchical multi-agent architecture that powers CodeMind's cognitive reasoning**

**Version**: 1.0  
**Last Updated**: November 2025

---

## Table of Contents

1. [Overview](#overview)
2. [The Six Specialist Agents](#the-six-specialist-agents)
3. [Agent Implementation](#agent-implementation)
4. [ODAI Synthesis Cycle](#odai-synthesis-cycle)
5. [N² Self-Correction Loop](#n²-self-correction-loop)
6. [Prompt Engineering](#prompt-engineering)
7. [Agent Coordination](#agent-coordination)
8. [Performance Optimization](#performance-optimization)

---

## Overview

### The Three-Layer Architecture

CodeMind's cognitive architecture mirrors human problem-solving:

```
┌─────────────────────────────────────────────────────────────┐
│              Meta-Cognitive Layer (N²)                       │
│           "Is this solution good enough?"                    │
│                                                               │
│  • Self-evaluates output quality (0-10)                     │
│  • Identifies specific weaknesses                            │
│  • Triggers refinement when needed                           │
│  • Ensures consistency across iterations                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│           Synthesis Layer (Central Consciousness)            │
│        "How do we integrate all perspectives?"               │
│                                                               │
│  ODAI Cycle:                                                 │
│  • Observe: What does each agent see?                       │
│  • Distill: What are the core truths?                       │
│  • Adapt: How do we resolve conflicts?                      │
│  • Integrate: What's the unified solution?                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│         Specialist Layer (Six Cognitive Perspectives)        │
│     "What matters from my specialized viewpoint?"            │
│                                                               │
│  Each agent analyzes code through their lens:                │
│  🎨 Architecture • 🔧 Engineering • 🔒 Security             │
│  ⚡ Performance • 🧪 Testing • 📚 Documentation             │
└───────────────────────────────────────────────────────────────┘
```

### Why Hierarchical?

**Single Agent Problems**:
- Can't be expert at everything
- No self-validation
- Inconsistent across domains
- Black-box reasoning

**Flat Multi-Agent Problems**:
- Agents compete rather than collaborate
- No clear decision mechanism
- Redundant analysis
- Coordination overhead

**Hierarchical Solution**:
✅ Specialization at lower layer
✅ Synthesis at middle layer
✅ Quality control at top layer
✅ Clear information flow

---

## The Six Specialist Agents

### 🎨 Architect Agent

**Role**: Software Architecture & Design

**Cognitive Focus**: Structure, patterns, maintainability, scalability

**What They Check**:
- ✅ SOLID principles adherence
- ✅ Design pattern appropriateness
- ✅ Separation of concerns
- ✅ Code organization and modularity
- ✅ Dependency management
- ✅ Future extensibility
- ⚠️ Over-engineering
- ⚠️ Tight coupling
- ⚠️ God classes/functions

**Example Analysis**:
```typescript
// User request: "Add user authentication"

Architect Analysis:
1. Use Strategy pattern for multiple auth methods (OAuth, JWT, local)
2. Separate authentication (identity verification) from authorization (permissions)
3. Implement middleware pattern for route protection
4. Consider repository pattern for user data access
5. Plan for future: 2FA, SSO, social login

Concerns:
- Current UserController is too large, violates SRP
- Auth logic mixed with business logic
- No clear boundary for auth module

Recommendations:
- Create separate AuthService
- Use dependency injection for flexibility
- Establish clear interfaces (IAuthProvider, IUserRepository)
```

**Agent Personality**: Thinks long-term, considers maintainability over quick fixes, values clean architecture.

---

### 🔧 Engineer Agent

**Role**: Implementation Correctness & Best Practices

**Cognitive Focus**: Correctness, edge cases, error handling, robustness

**What They Check**:
- ✅ Logic correctness
- ✅ Edge case handling
- ✅ Error handling and recovery
- ✅ Input validation
- ✅ Null/undefined checks
- ✅ Type safety
- ✅ Language idioms
- ⚠️ Off-by-one errors
- ⚠️ Race conditions
- ⚠️ Resource leaks

**Example Analysis**:
```typescript
// User request: "Add pagination to user list"

Engineer Analysis:
1. Validate page and limit parameters (positive integers)
2. Handle empty results gracefully
3. Check for integer overflow on large page numbers
4. Return total count for pagination UI
5. Handle database connection failures

Edge Cases to Consider:
- page=0 or negative
- limit > max allowed (DoS risk)
- Database contains 0 users
- Last page with partial results
- Concurrent modifications during pagination

Error Handling:
- Invalid parameters → 400 Bad Request with clear message
- Database error → 500 with retry suggestion
- Timeout → 504 Gateway Timeout

Implementation:
```typescript
async function getPaginatedUsers(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<User>> {
  // Validate inputs
  if (page < 1 || limit < 1) {
    throw new ValidationError('Page and limit must be positive');
  }
  if (limit > 100) {
    throw new ValidationError('Limit cannot exceed 100');
  }
  
  // Calculate offset safely
  const offset = (page - 1) * limit;
  
  try {
    const [users, total] = await Promise.all([
      userRepository.find({ skip: offset, take: limit }),
      userRepository.count()
    ]);
    
    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrevious: page > 1
      }
    };
  } catch (error) {
    logger.error('Pagination failed', { page, limit, error });
    throw new DatabaseError('Failed to retrieve users');
  }
}
```
```

**Agent Personality**: Paranoid about edge cases, insists on proper error handling, values robustness over cleverness.

---

### 🔒 Security Agent

**Role**: Security & Privacy Protection

**Cognitive Focus**: Vulnerabilities, data protection, threat mitigation

**What They Check**:
- ✅ Authentication and authorization
- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Sensitive data exposure
- ✅ Cryptographic security
- ⚠️ Hardcoded secrets
- ⚠️ Insecure dependencies
- ⚠️ Privilege escalation

**Example Analysis**:
```typescript
// User request: "Add search functionality"

Security Analysis:
1. SQL Injection Risk: HIGH
   - User input directly in query → Use parameterized queries
   
2. XSS Risk: MEDIUM  
   - Search results rendered in HTML → Escape output
   
3. DoS Risk: MEDIUM
   - Expensive search on large dataset → Add rate limiting
   
4. Data Exposure Risk: LOW
   - Search might reveal sensitive data → Check permissions
   
5. Injection via Special Characters: MEDIUM
   - Wildcards in LIKE queries → Escape special chars

Secure Implementation:
```typescript
async function searchUsers(query: string, userId: string): Promise<User[]> {
  // 1. Sanitize input
  const sanitized = this.sanitizeSearchQuery(query);
  
  // 2. Rate limit
  await this.rateLimiter.checkLimit(userId, 'search', 10, 60); // 10/min
  
  // 3. Use parameterized query (prevents SQL injection)
  const results = await this.db.query(
    'SELECT id, name, email FROM users WHERE name ILIKE $1 AND is_public = true',
    [`%${sanitized}%`]
  );
  
  // 4. Filter by permissions
  const filtered = results.filter(user => 
    this.authService.canView(userId, user.id)
  );
  
  // 5. Sanitize output (prevent XSS)
  return filtered.map(user => ({
    ...user,
    name: this.escapeHtml(user.name),
    email: this.maskEmail(user.email) // privacy
  }));
}

private sanitizeSearchQuery(query: string): string {
  // Remove SQL wildcards and special characters
  return query
    .replace(/[_%\\]/g, '\\$&') // Escape SQL LIKE wildcards
    .substring(0, 100); // Limit length
}
```
```

Vulnerabilities Found:
- ❌ No rate limiting (DoS)
- ❌ Potential SQL injection if query not parameterized
- ❌ XSS if output not escaped
- ❌ Data leakage if permissions not checked

Security Level: 🔒🔒⚫⚫⚫ (2/5 - UNSAFE)
```

**Agent Personality**: Paranoid, assumes malicious input, zero-trust mindset, values defense-in-depth.

---

### ⚡ Performance Agent

**Role**: Optimization & Scalability

**Cognitive Focus**: Time complexity, space complexity, bottlenecks, scaling

**What They Check**:
- ✅ Algorithm efficiency (Big O)
- ✅ Database query optimization
- ✅ Caching opportunities
- ✅ Memory usage
- ✅ Network calls
- ✅ Concurrent operations
- ⚠️ N+1 query problems
- ⚠️ Unnecessary loops
- ⚠️ Memory leaks

**Example Analysis**:
```typescript
// User request: "Get user with all their posts and comments"

Performance Analysis:

Current Implementation (PROBLEMATIC):
```typescript
async function getUserWithContent(userId: string) {
  const user = await db.users.findOne(userId);           // Query 1
  
  const posts = await db.posts.findMany({ 
    where: { authorId: userId } 
  });                                                     // Query 2
  
  for (const post of posts) {
    post.comments = await db.comments.findMany({         // Query 3..N
      where: { postId: post.id }
    });
  }
  
  return { user, posts };
}
```

Issues:
1. N+1 Query Problem: 1 + 1 + N queries
   - For 100 posts → 102 database queries
   - Each query ~10ms → 1+ second total
   
2. Sequential Execution:
   - No parallelization
   - Blocks on each query
   
3. No Pagination:
   - Loading ALL posts → memory issue for power users
   - No limit on comments → unbounded growth

Optimized Implementation:
```typescript
async function getUserWithContent(
  userId: string,
  options: { postLimit?: number; commentLimit?: number } = {}
) {
  const { postLimit = 20, commentLimit = 10 } = options;
  
  // Single query with joins
  const result = await db.$queryRaw`
    SELECT 
      u.*,
      json_agg(DISTINCT jsonb_build_object(
        'id', p.id,
        'title', p.title,
        'createdAt', p.created_at
      )) FILTER (WHERE p.id IS NOT NULL) as posts,
      json_agg(DISTINCT jsonb_build_object(
        'id', c.id,
        'content', c.content,
        'postId', c.post_id
      )) FILTER (WHERE c.id IS NOT NULL) as comments
    FROM users u
    LEFT JOIN (
      SELECT * FROM posts 
      WHERE author_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${postLimit}
    ) p ON p.author_id = u.id
    LEFT JOIN (
      SELECT * FROM comments 
      WHERE post_id IN (
        SELECT id FROM posts WHERE author_id = ${userId} LIMIT ${postLimit}
      )
      ORDER BY created_at DESC
      LIMIT ${commentLimit}
    ) c ON c.post_id = p.id
    WHERE u.id = ${userId}
    GROUP BY u.id
  `;
  
  return result[0];
}
```

Performance Improvements:
- Queries: 102 → 1 (100x reduction)
- Time: ~1000ms → ~20ms (50x faster)
- Memory: O(all data) → O(limited data)
- Scalability: Poor → Good

Additional Optimizations:
1. Add caching (Redis) for frequently accessed users
2. Use CDN for user avatars
3. Consider GraphQL for flexible data fetching
4. Add database indexes on foreign keys

Complexity:
- Time: O(N) → O(1) per query
- Space: O(unlimited) → O(postLimit + commentLimit)
```

**Agent Personality**: Obsessed with efficiency, thinks about scale, values fast execution paths, questions every loop.

---

### 🧪 Testing Agent

**Role**: Testability & Quality Assurance

**Cognitive Focus**: Test coverage, testability, test scenarios, QA

**What They Check**:
- ✅ Unit test requirements
- ✅ Integration test scenarios
- ✅ Edge case test coverage
- ✅ Mocking dependencies
- ✅ Test data setup
- ✅ Testability of design
- ⚠️ Hard-to-test code
- ⚠️ Missing assertions
- ⚠️ Flaky test risks

**Example Analysis**:
```typescript
// User request: "Add email verification"

Testing Analysis:

Code Testability Assessment:
✅ Good separation of concerns (EmailService injectable)
✅ Time-dependent logic uses injected clock (testable)
⚠️ Direct database calls (should use repository)
❌ Hard-coded email templates (not testable)
❌ No interface for EmailProvider (can't mock)

Required Tests:

1. Unit Tests (EmailVerificationService):
```typescript
describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let mockEmailProvider: MockEmailProvider;
  let mockTokenGenerator: MockTokenGenerator;
  let mockUserRepository: MockUserRepository;
  let mockClock: MockClock;
  
  beforeEach(() => {
    mockEmailProvider = new MockEmailProvider();
    mockTokenGenerator = new MockTokenGenerator();
    mockUserRepository = new MockUserRepository();
    mockClock = new MockClock('2025-01-01T00:00:00Z');
    
    service = new EmailVerificationService(
      mockEmailProvider,
      mockTokenGenerator,
      mockUserRepository,
      mockClock
    );
  });
  
  describe('sendVerificationEmail', () => {
    it('should generate token and send email', async () => {
      const user = { id: '123', email: 'test@example.com' };
      mockTokenGenerator.generate.mockResolvedValue('token-abc');
      
      await service.sendVerificationEmail(user);
      
      expect(mockTokenGenerator.generate).toHaveBeenCalledWith(user.id);
      expect(mockEmailProvider.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Verify your email',
        html: expect.stringContaining('token-abc')
      });
    });
    
    it('should throw if email sending fails', async () => {
      mockEmailProvider.send.mockRejectedValue(new Error('SMTP error'));
      
      await expect(
        service.sendVerificationEmail({ id: '123', email: 'test@example.com' })
      ).rejects.toThrow('Failed to send verification email');
    });
    
    it('should handle invalid email addresses', async () => {
      await expect(
        service.sendVerificationEmail({ id: '123', email: 'invalid' })
      ).rejects.toThrow(ValidationError);
    });
  });
  
  describe('verifyToken', () => {
    it('should verify valid token and mark user as verified', async () => {
      const user = { id: '123', verified: false };
      mockUserRepository.findByVerificationToken.mockResolvedValue(user);
      mockClock.now.mockReturnValue(new Date('2025-01-01T00:30:00Z')); // 30 min later
      
      const result = await service.verifyToken('token-abc');
      
      expect(result.success).toBe(true);
      expect(mockUserRepository.update).toHaveBeenCalledWith('123', {
        verified: true,
        verificationToken: null
      });
    });
    
    it('should reject expired token', async () => {
      const user = { 
        id: '123', 
        verified: false,
        tokenExpiresAt: new Date('2025-01-01T01:00:00Z')
      };
      mockUserRepository.findByVerificationToken.mockResolvedValue(user);
      mockClock.now.mockReturnValue(new Date('2025-01-01T02:00:00Z')); // 2 hours later
      
      const result = await service.verifyToken('token-abc');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Token expired');
    });
    
    it('should reject invalid token', async () => {
      mockUserRepository.findByVerificationToken.mockResolvedValue(null);
      
      const result = await service.verifyToken('invalid-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });
    
    it('should handle already verified users gracefully', async () => {
      const user = { id: '123', verified: true };
      mockUserRepository.findByVerificationToken.mockResolvedValue(user);
      
      const result = await service.verifyToken('token-abc');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Email already verified');
    });
  });
});
```

2. Integration Tests:
```typescript
describe('Email Verification Integration', () => {
  it('should complete full verification flow', async () => {
    // 1. Create user
    const user = await createUser({ email: 'test@example.com' });
    
    // 2. Send verification email
    await emailService.sendVerificationEmail(user);
    
    // 3. Extract token from sent email
    const sentEmail = await testEmailProvider.getLastSent();
    const token = extractTokenFromEmail(sentEmail.html);
    
    // 4. Verify token
    const result = await emailService.verifyToken(token);
    
    expect(result.success).toBe(true);
    
    // 5. Confirm user is verified in database
    const updatedUser = await userRepository.findById(user.id);
    expect(updatedUser.verified).toBe(true);
  });
});
```

3. E2E Tests:
```typescript
test('user can verify email via link', async ({ page }) => {
  // 1. Sign up
  await page.goto('/signup');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'Password123!');
  await page.click('button[type=submit]');
  
  // 2. Check for verification message
  await expect(page.locator('text=Check your email')).toBeVisible();
  
  // 3. Get verification email (from test inbox)
  const email = await testInbox.waitForEmail('test@example.com');
  const verificationLink = extractLink(email.html);
  
  // 4. Click verification link
  await page.goto(verificationLink);
  
  // 5. Verify success message
  await expect(page.locator('text=Email verified')).toBeVisible();
  
  // 6. Login should work now
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'Password123!');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});
```

Test Coverage Goals:
- Line coverage: >90%
- Branch coverage: >85%
- Critical paths: 100%

Suggested Test Data:
- Valid email: test@example.com
- Invalid email: invalid, @example.com, test@
- Expired token: Create with past expiry
- Used token: Mark as already used
- Malformed token: random-string-123

Quality Gates:
- All tests must pass before merge
- No decrease in coverage
- Performance tests for email sending (<100ms)
```

**Agent Personality**: QA mindset, thinks about "what could go wrong", values comprehensive testing, catches assumptions.

---

### 📚 Documentation Agent

**Role**: Code Clarity & Documentation

**Cognitive Focus**: Readability, understandability, documentation quality

**What They Check**:
- ✅ Code clarity and naming
- ✅ Comment quality
- ✅ API documentation
- ✅ Type definitions
- ✅ Example usage
- ✅ README completeness
- ⚠️ Unclear variable names
- ⚠️ Missing documentation
- ⚠️ Outdated comments

**Example Analysis**:
```typescript
// User request: "Add webhook functionality"

Documentation Analysis:

Code Clarity Issues:
❌ Function name 'processWH' is unclear (what's WH?)
❌ Variable 'x' has no meaning
❌ No comments explaining webhook signature verification
⚠️ Complex regex without explanation

Improved Version:
```typescript
/**
 * Webhook handler for external service notifications
 * 
 * Processes incoming webhook events, verifies signatures,
 * and dispatches to appropriate handlers.
 * 
 * @param request - Incoming HTTP request with webhook payload
 * @returns Response indicating success or failure
 * 
 * @example
 * ```typescript
 * const response = await handleWebhook(req);
 * if (response.status === 200) {
 *   console.log('Webhook processed successfully');
 * }
 * ```
 * 
 * Security:
 * - Verifies HMAC signature using shared secret
 * - Rejects requests with invalid/missing signatures
 * - Implements replay attack prevention
 * 
 * Supported Events:
 * - user.created
 * - user.updated
 * - user.deleted
 * - payment.succeeded
 * - payment.failed
 */
async function handleWebhook(
  request: WebhookRequest
): Promise<WebhookResponse> {
  // Step 1: Verify webhook signature (security)
  const isValid = await verifyWebhookSignature(
    request.body,
    request.headers['x-webhook-signature'],
    process.env.WEBHOOK_SECRET
  );
  
  if (!isValid) {
    logger.warn('Invalid webhook signature', {
      ip: request.ip,
      timestamp: Date.now()
    });
    return { status: 401, error: 'Invalid signature' };
  }
  
  // Step 2: Parse event type
  const event = parseWebhookEvent(request.body);
  
  // Step 3: Prevent replay attacks (check timestamp)
  const eventAge = Date.now() - event.timestamp;
  const MAX_EVENT_AGE_MS = 5 * 60 * 1000; // 5 minutes
  
  if (eventAge > MAX_EVENT_AGE_MS) {
    logger.warn('Webhook event too old', { eventAge, eventId: event.id });
    return { status: 400, error: 'Event expired' };
  }
  
  // Step 4: Check for duplicate (idempotency)
  const alreadyProcessed = await checkEventProcessed(event.id);
  if (alreadyProcessed) {
    logger.info('Duplicate webhook event', { eventId: event.id });
    return { status: 200, message: 'Already processed' };
  }
  
  // Step 5: Dispatch to handler
  try {
    await dispatchWebhookEvent(event);
    await markEventProcessed(event.id);
    
    return { status: 200, message: 'Processed successfully' };
  } catch (error) {
    logger.error('Webhook processing failed', { error, event });
    return { status: 500, error: 'Processing failed' };
  }
}

/**
 * Verifies HMAC-SHA256 signature for webhook authenticity
 * 
 * Computes expected signature and compares with provided signature
 * using constant-time comparison to prevent timing attacks.
 * 
 * @param payload - Raw request body (string)
 * @param signature - Signature from x-webhook-signature header
 * @param secret - Shared secret for HMAC computation
 * @returns true if signature is valid, false otherwise
 * 
 * @example
 * ```typescript
 * const isValid = await verifyWebhookSignature(
 *   '{"event":"user.created"}',
 *   'sha256=abc123...',
 *   'my-secret-key'
 * );
 * ```
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  const receivedSignature = signature.replace('sha256=', '');
  
  // Constant-time comparison prevents timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature)
  );
}
```

README Section to Add:
```markdown
## Webhooks

CodeMind can send webhooks to notify your application of events.

### Configuration

Set up webhooks in your dashboard:
1. Go to Settings → Webhooks
2. Add endpoint URL (must be HTTPS)
3. Copy the signing secret
4. Select events to subscribe to

### Security

All webhooks include an HMAC-SHA256 signature in the `x-webhook-signature` header.

Verify signatures to ensure requests are from CodeMind:

```typescript
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expected}`;
}
```

### Event Types

| Event | Description | Payload |
|-------|-------------|---------|
| `user.created` | New user signed up | `{ userId, email, timestamp }` |
| `user.updated` | User profile updated | `{ userId, changes, timestamp }` |
| `payment.succeeded` | Payment processed | `{ userId, amount, timestamp }` |

### Handling Webhooks

```typescript
app.post('/webhooks/codemind', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = req.body;
  
  switch (event.type) {
    case 'user.created':
      await handleUserCreated(event.data);
      break;
    case 'payment.succeeded':
      await handlePaymentSucceeded(event.data);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.status(200).json({ received: true });
});
```

### Retries

CodeMind will retry failed webhooks (non-200 status):
- 3 attempts total
- Exponential backoff (1min, 5min, 15min)
- Event marked as failed after 3 attempts

### Testing

Use our webhook testing tool to send test events:
```bash
curl -X POST https://api.codemind.dev/webhooks/test \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"type": "user.created", "url": "https://your-app.com/webhooks"}'
```
```

Type Definitions:
```typescript
/**
 * Webhook event structure
 */
interface WebhookEvent {
  /** Unique event identifier (UUID) */
  id: string;
  
  /** Event type (e.g., "user.created") */
  type: string;
  
  /** Unix timestamp (milliseconds) when event occurred */
  timestamp: number;
  
  /** Event-specific payload data */
  data: Record<string, any>;
  
  /** API version (for backward compatibility) */
  apiVersion: string;
}

/**
 * Webhook request from external service
 */
interface WebhookRequest {
  /** HTTP headers including signature */
  headers: {
    'x-webhook-signature': string;
    'content-type': 'application/json';
  };
  
  /** Raw request body */
  body: string;
  
  /** Client IP address */
  ip: string;
}
```
```

Documentation Quality Score: 8.5/10
- ✅ Clear function names
- ✅ Comprehensive comments
- ✅ Type definitions
- ✅ Examples provided
- ✅ Security considerations explained
- ⚠️ Could add sequence diagram for flow
- ⚠️ Missing troubleshooting guide
```

**Agent Personality**: Thinks like a new team member reading code, values clarity, catches confusing names, insists on examples.

---

## Agent Implementation

### Base Agent Class

```typescript
/**
 * Base class for all specialist agents
 * 
 * Each agent analyzes code from their specialized perspective
 * and returns structured analysis.
 */
abstract class Agent {
  /** Agent's specialized role */
  abstract readonly role: AgentRole;
  
  /** Cognitive perspective/focus */
  abstract readonly perspective: string;
  
  /** Output format specification */
  abstract readonly outputFormat: OutputFormat;
  
  constructor(
    protected llmProvider: LLMProvider,
    protected config: AgentConfig
  ) {}
  
  /**
   * Analyze code from this agent's perspective
   * 
   * @param request - User request/instruction
   * @param code - Code to analyze
   * @param context - Surrounding code context
   * @param repairDirective - Optional directive from previous iteration
   * @returns Structured analysis from this agent's perspective
   */
  async analyze(
    request: string,
    code: string,
    context: CodeContext,
    repairDirective?: string
  ): Promise<AgentAnalysis> {
    const prompt = this.buildPrompt(request, code, context, repairDirective);
    
    const response = await this.llmProvider.generate(prompt, {
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens
    });
    
    return this.parseResponse(response.content);
  }
  
  /**
   * Build prompt for this agent
   * Includes role, perspective, and specific instructions
   */
  protected abstract buildPrompt(
    request: string,
    code: string,
    context: CodeContext,
    repairDirective?: string
  ): string;
  
  /**
   * Parse LLM response into structured format
   */
  protected abstract parseResponse(
    response: string
  ): AgentAnalysis;
}

/**
 * Structured analysis output from an agent
 */
interface AgentAnalysis {
  /** Agent that produced this analysis */
  agent: AgentRole;
  
  /** Key insights (4-6 bullet points) */
  insights: string[];
  
  /** Issues found (categorized by severity) */
  issues: {
    critical: Issue[];
    warnings: Issue[];
    suggestions: Issue[];
  };
  
  /** Specific recommendations */
  recommendations: string[];
  
  /** Confidence in this analysis (0-1) */
  confidence: number;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}
```

### Example: Security Agent Implementation

```typescript
class SecurityAgent extends Agent {
  readonly role = AgentRole.SECURITY;
  readonly perspective = 'Security vulnerabilities, data protection, threat mitigation';
  readonly outputFormat = OutputFormat.STRUCTURED;
  
  protected buildPrompt(
    request: string,
    code: string,
    context: CodeContext,
    repairDirective?: string
  ): string {
    return `You are an expert security engineer reviewing code for vulnerabilities.

Your role: ${this.perspective}

User request: ${request}

Code to analyze:
\`\`\`${context.language}
${code}
\`\`\`

Context:
- File: ${context.filePath}
- Framework: ${context.framework || 'Unknown'}
- Dependencies: ${context.dependencies.join(', ')}

${repairDirective ? `Previous issues to address:\n${repairDirective}\n` : ''}

Analyze this code for security issues. Focus on:
1. Authentication and authorization
2. Input validation and sanitization
3. Injection vulnerabilities (SQL, XSS, command injection)
4. Data exposure (sensitive info in logs, errors, etc.)
5. Cryptographic security
6. Dependency vulnerabilities

Return JSON:
{
  "insights": [
    "Key security observation 1",
    "Key security observation 2",
    ...
  ],
  "issues": {
    "critical": [
      { "type": "sql_injection", "line": 42, "description": "...", "fix": "..." }
    ],
    "warnings": [
      { "type": "weak_crypto", "line": 15, "description": "...", "fix": "..." }
    ],
    "suggestions": [
      { "type": "rate_limiting", "description": "...", "fix": "..." }
    ]
  },
  "recommendations": [
    "Use parameterized queries to prevent SQL injection",
    "Implement rate limiting on login endpoint",
    ...
  ],
  "confidence": 0.95
}

Be specific. Reference line numbers. Provide actionable fixes.`;
  }
  
  protected parseResponse(response: string): AgentAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        agent: this.role,
        ...parsed
      };
    } catch (error) {
      throw new Error(`Failed to parse Security Agent response: ${error.message}`);
    }
  }
}
```

---

## ODAI Synthesis Cycle

### The Four Phases

**ODAI** = **O**bserve → **D**istill → **A**dapt → **I**ntegrate

This mirrors human meta-cognitive synthesis.

```typescript
class ODAISynthesizer {
  constructor(
    private llmProvider: LLMProvider,
    private qualityThreshold: number = 9.0
  ) {}
  
  async synthesize(
    request: string,
    analyses: AgentAnalysis[],
    context: CodeContext
  ): Promise<SynthesisResult> {
    // Phase 1: Observe
    const observation = await this.observe(request, analyses, context);
    
    // Phase 2: Distill
    const distillation = await this.distill(observation, analyses);
    
    // Check quality
    if (distillation.qualityScore >= this.qualityThreshold) {
      // Phase 4: Integrate (quality met)
      return await this.integrate(distillation, context);
    } else {
      // Phase 3: Adapt (quality not met)
      return await this.adapt(distillation);
    }
  }
  
  /**
   * Phase 1: Observe
   * "What does each agent see? What patterns emerge?"
   */
  private async observe(
    request: string,
    analyses: AgentAnalysis[],
    context: CodeContext
  ): Promise<Observation> {
    const prompt = `You are the Central Consciousness analyzing multiple agent perspectives.

User Request: ${request}

Agent Analyses:
${analyses.map(a => `
${a.agent}:
Insights: ${a.insights.join('; ')}
Issues: ${JSON.stringify(a.issues, null, 2)}
Recommendations: ${a.recommendations.join('; ')}
`).join('\n')}

Observe and identify:
1. What is the core user need?
2. What patterns/themes appear across agents?
3. What conflicts exist between agents?
4. What critical issues were raised?
5. What is the unified direction?

Return JSON:
{
  "coreNeed": "The essential thing user wants",
  "patterns": ["Pattern 1", "Pattern 2"],
  "conflicts": ["Conflict 1", "Conflict 2"],
  "criticalIssues": ["Issue 1", "Issue 2"],
  "unifiedDirection": "High-level solution approach"
}`;

    const response = await this.llmProvider.generate(prompt, {
      model: 'gpt-4-turbo',
      temperature: 0.3
    });
    
    return JSON.parse(response.content);
  }
  
  /**
   * Phase 2: Distill
   * "What are the core truths? How good is this?"
   */
  private async distill(
    observation: Observation,
    analyses: AgentAnalysis[]
  ): Promise<Distillation> {
    const prompt = `Based on observation and agent analyses, distill core truths.

Observation:
${JSON.stringify(observation, null, 2)}

Distill:
1. Core requirements (what MUST be in solution)
2. Key constraints (what solution CANNOT violate)
3. Implementation principles (HOW to implement)
4. Quality score (0-10): How well do current analyses address the need?
   - 9-10: Excellent, ready to implement
   - 7-8: Good, but missing details
   - 5-6: Mediocre, significant gaps
   - 0-4: Poor, fundamental issues
5. Scoring rationale (WHY that score)

Return JSON:
{
  "coreRequirements": ["Req 1", "Req 2"],
  "keyConstraints": ["Constraint 1", "Constraint 2"],
  "implementationPrinciples": ["Principle 1", "Principle 2"],
  "qualityScore": 8.5,
  "scoringRationale": "Detailed explanation..."
}`;

    const response = await this.llmProvider.generate(prompt, {
      model: 'gpt-4-turbo',
      temperature: 0.2
    });
    
    return JSON.parse(response.content);
  }
  
  /**
   * Phase 3: Adapt (if quality < threshold)
   * "What's missing? How do we fix it?"
   */
  private async adapt(
    distillation: Distillation
  ): Promise<SynthesisResult> {
    const prompt = `Quality score ${distillation.qualityScore} is below threshold ${this.qualityThreshold}.

Current State:
${JSON.stringify(distillation, null, 2)}

Generate repair directive:
1. What specific issues prevent higher quality?
2. What information is missing?
3. What should each agent focus on in next iteration?

Return JSON:
{
  "success": false,
  "qualityScore": ${distillation.qualityScore},
  "repairDirective": {
    "overallGuidance": "General guidance for all agents",
    "agentSpecific": {
      "architect": "Specific for architect",
      "engineer": "Specific for engineer",
      ...
    },
    "focusAreas": ["Area 1", "Area 2"]
  }
}`;

    const response = await this.llmProvider.generate(prompt, {
      model: 'gpt-4-turbo',
      temperature: 0.3
    });
    
    return JSON.parse(response.content);
  }
  
  /**
   * Phase 4: Integrate (if quality >= threshold)
   * "Generate the final solution"
   */
  private async integrate(
    distillation: Distillation,
    context: CodeContext
  ): Promise<SynthesisResult> {
    const prompt = `Generate final code implementation based on synthesis.

Requirements:
${distillation.coreRequirements.join('\n')}

Constraints:
${distillation.keyConstraints.join('\n')}

Principles:
${distillation.implementationPrinciples.join('\n')}

Context:
- Language: ${context.language}
- Framework: ${context.framework}
- Existing code:
\`\`\`
${context.existingCode}
\`\`\`

Generate:
1. Complete, production-ready code
2. Inline comments explaining key decisions
3. Clear explanation of what changed and why

Return JSON:
{
  "success": true,
  "qualityScore": ${distillation.qualityScore},
  "code": "... generated code ...",
  "explanation": "What was implemented and why",
  "keyDecisions": {
    "architecture": "Why this design",
    "security": "Security measures taken",
    "performance": "Optimizations applied",
    ...
  }
}`;

    const response = await this.llmProvider.generate(prompt, {
      model: 'gpt-4-turbo',
      temperature: 0.4,
      maxTokens: 4000
    });
    
    return JSON.parse(response.content);
  }
}
```

---

## N² Self-Correction Loop

### The Meta-Cognitive Layer

```typescript
class N2Controller {
  constructor(
    private maxIterations: number = 4,
    private qualityThreshold: number = 9.0
  ) {}
  
  /**
   * Execute N² loop: iterative refinement until quality threshold met
   * 
   * @returns Final result with iteration history
   */
  async execute(
    request: string,
    agents: Agent[],
    synthesizer: ODAISynthesizer,
    context: CodeContext
  ): Promise<N2Result> {
    const history: Iteration[] = [];
    let currentRepairDirective: RepairDirective | undefined;
    
    for (let i = 0; i < this.maxIterations; i++) {
      console.log(`N² Iteration ${i + 1}/${this.maxIterations}`);
      
      // Execute all agents in parallel
      const startTime = Date.now();
      const analyses = await Promise.all(
        agents.map(agent => 
          agent.analyze(
            request,
            context.code,
            context,
            currentRepairDirective?.agentSpecific?.[agent.role]
          )
        )
      );
      const agentTime = Date.now() - startTime;
      
      // Synthesize
      const synthStart = Date.now();
      const synthesis = await synthesizer.synthesize(
        request,
        analyses,
        context
      );
      const synthTime = Date.now() - synthStart;
      
      // Record iteration
      history.push({
        iteration: i + 1,
        analyses,
        synthesis,
        qualityScore: synthesis.qualityScore,
        agentExecutionTime: agentTime,
        synthesisTime: synthTime
      });
      
      // Check if we've met quality threshold
      if (synthesis.success && synthesis.qualityScore >= this.qualityThreshold) {
        return {
          success: true,
          output: synthesis.code,
          explanation: synthesis.explanation,
          qualityScore: synthesis.qualityScore,
          iterations: i + 1,
          history,
          totalTime: Date.now() - history[0].analyses[0].timestamp
        };
      }
      
      // Prepare for next iteration
      if (i < this.maxIterations - 1) {
        currentRepairDirective = synthesis.repairDirective;
        console.log(`Quality ${synthesis.qualityScore}/10 below threshold. Refining...`);
      }
    }
    
    // Max iterations reached - return best attempt
    const lastSynthesis = history[history.length - 1].synthesis;
    
    return {
      success: false,
      output: lastSynthesis.code,
      explanation: lastSynthesis.explanation,
      qualityScore: lastSynthesis.qualityScore,
      iterations: this.maxIterations,
      history,
      warning: 'Max iterations reached without meeting quality threshold',
      totalTime: Date.now() - history[0].analyses[0].timestamp
    };
  }
}

interface N2Result {
  success: boolean;
  output: string;
  explanation: string;
  qualityScore: number;
  iterations: number;
  history: Iteration[];
  warning?: string;
  totalTime: number;
}

interface Iteration {
  iteration: number;
  analyses: AgentAnalysis[];
  synthesis: SynthesisResult;
  qualityScore: number;
  agentExecutionTime: number;
  synthesisTime: number;
}
```

### When N² Triggers

```typescript
// Example: First iteration produces score of 7.5
Iteration 1:
  Agents analyze → Synthesizer produces code
  Quality Score: 7.5/10
  Rationale: "Missing input validation, no error handling"
  
  → Repair Directive:
    - Engineer: "Add comprehensive input validation"
    - Engineer: "Implement error handling for all failure modes"
    - Security: "Sanitize user inputs"

Iteration 2:
  Agents re-analyze with directive → Synthesizer produces improved code
  Quality Score: 8.8/10
  Rationale: "Good validation and errors, but performance could be better"
  
  → Repair Directive:
    - Performance: "Optimize database queries"
    - Performance: "Add caching for repeated lookups"

Iteration 3:
  Agents re-analyze → Synthesizer produces final code
  Quality Score: 9.3/10
  Rationale: "Excellent implementation, all concerns addressed"
  
  ✓ Accept and present to user
```

---

## Prompt Engineering

### Critical Prompt Principles

1. **Clear Role Definition**: "You are an expert security engineer..."
2. **Specific Focus**: "Analyze for SQL injection, XSS, CSRF..."
3. **Structured Output**: "Return JSON with this exact schema..."
4. **Contextual Information**: Provide file path, framework, dependencies
5. **Actionable Guidance**: "Reference line numbers, provide fixes"

### Agent Prompt Template

```typescript
const AGENT_PROMPT_TEMPLATE = `You are an expert ${ROLE}.

Your specialized perspective: ${PERSPECTIVE}

${REPAIR_DIRECTIVE ? `IMPORTANT - Previous iteration issues to address:\n${REPAIR_DIRECTIVE}\n` : ''}

User Request: ${USER_REQUEST}

Code to analyze:
\`\`\`${LANGUAGE}
${CODE}
\`\`\`

Context:
- File: ${FILE_PATH}
- Framework: ${FRAMEWORK}
- Related symbols: ${SYMBOLS}
- Recent changes: ${RECENT_CHANGES}

Analyze this code from your ${ROLE} perspective. Focus on:
${FOCUS_AREAS.map(a => `- ${a}`).join('\n')}

Return structured JSON:
{
  "insights": [
    "Key observation 1 (be specific)",
    "Key observation 2 (be specific)",
    ...
  ],
  "issues": {
    "critical": [
      {
        "type": "issue_type",
        "line": <line_number>,
        "description": "What's wrong",
        "fix": "How to fix it",
        "impact": "Why this matters"
      }
    ],
    "warnings": [ /* same structure */ ],
    "suggestions": [ /* same structure */ ]
  },
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    ...
  ],
  "confidence": <0.0-1.0>
}

Be specific. Reference code. Provide concrete fixes. Think step-by-step.`;
```

### Synthesis Prompt Template

```typescript
const SYNTHESIS_PROMPT_TEMPLATE = `You are the Central Consciousness synthesizing multiple expert perspectives.

User Request: ${USER_REQUEST}

Expert Analyses:
${AGENT_ANALYSES}

Execute ODAI Cycle:

1. OBSERVE:
   - What is the core user need?
   - What patterns emerge across experts?
   - What conflicts exist?
   - What critical issues were raised?

2. DISTILL:
   - Core requirements (MUST have)
   - Key constraints (CANNOT violate)
   - Implementation principles (HOW to build)
   - Quality score (0-10): How well do we understand requirements?
   - Scoring rationale

3. ${QUALITY_BELOW_THRESHOLD ? 'ADAPT' : 'INTEGRATE'}:
   ${QUALITY_BELOW_THRESHOLD ? 
     'Generate repair directive for next iteration' : 
     'Generate final production-ready code'}

Return JSON:
{
  "observation": {
    "coreNeed": "...",
    "patterns": [...],
    "conflicts": [...],
    "criticalIssues": [...]
  },
  "distillation": {
    "coreRequirements": [...],
    "keyConstraints": [...],
    "implementationPrinciples": [...],
    "qualityScore": <0-10>,
    "scoringRationale": "..."
  },
  ${QUALITY_BELOW_THRESHOLD ? `
  "repairDirective": {
    "overallGuidance": "...",
    "agentSpecific": {
      "architect": "...",
      "engineer": "...",
      "security": "...",
      "performance": "...",
      "testing": "...",
      "documentation": "..."
    },
    "focusAreas": [...]
  },
  "success": false
  ` : `
  "code": "... complete implementation ...",
  "explanation": "What was built and why",
  "keyDecisions": {
    "architecture": "...",
    "security": "...",
    "performance": "...",
    "testing": "...",
    "documentation": "..."
  },
  "success": true
  `}
}`;
```

---

## Agent Coordination

### Execution Patterns

#### 1. Parallel Execution (Default)
```typescript
// All agents analyze simultaneously
const analyses = await Promise.all(
  agents.map(agent => agent.analyze(request, code, context))
);
// Total time = max(individual agent times)
```

#### 2. Sequential Execution (Rare)
```typescript
// Sometimes order matters (e.g., architect before performance)
const analyses: AgentAnalysis[] = [];
for (const agent of agents) {
  const analysis = await agent.analyze(request, code, context);
  analyses.push(analysis);
  
  // Next agent can see previous analyses
  context.previousAnalyses = analyses;
}
```

#### 3. Conditional Execution
```typescript
// Only run certain agents based on request type
function selectAgents(request: Request): Agent[] {
  const agents: Agent[] = [engineerAgent]; // Always include
  
  if (request.involvesDatabase) {
    agents.push(performanceAgent); // For query optimization
  }
  if (request.involvesUserInput) {
    agents.push(securityAgent); // For injection prevention
  }
  if (request.isPublicAPI) {
    agents.push(documentationAgent); // For API docs
  }
  
  return agents;
}
```

### Agent Dependencies

```typescript
interface AgentDependency {
  agent: Agent;
  dependsOn: Agent[];
  canRunInParallel: boolean;
}

// Define dependencies
const dependencies: AgentDependency[] = [
  {
    agent: architectAgent,
    dependsOn: [],
    canRunInParallel: true
  },
  {
    agent: performanceAgent,
    dependsOn: [architectAgent], // Needs to know architecture first
    canRunInParallel: false
  },
  // ...
];

// Execute respecting dependencies
async function executeWithDependencies(
  agents: AgentDependency[]
): Promise<AgentAnalysis[]> {
  const completed = new Map<Agent, AgentAnalysis>();
  const results: AgentAnalysis[] = [];
  
  while (completed.size < agents.length) {
    // Find agents ready to run (dependencies met)
    const ready = agents.filter(a => 
      !completed.has(a.agent) &&
      a.dependsOn.every(dep => completed.has(dep))
    );
    
    // Run ready agents in parallel
    const analyses = await Promise.all(
      ready.map(a => a.agent.analyze(...))
    );
    
    // Mark as completed
    ready.forEach((a, i) => {
      completed.set(a.agent, analyses[i]);
      results.push(analyses[i]);
    });
  }
  
  return results;
}
```

---

## Performance Optimization

### Caching Strategies

```typescript
class AgentCache {
  private cache = new LRU<string, AgentAnalysis>({
    max: 1000,
    ttl: 1000 * 60 * 60 // 1 hour
  });
  
  getCacheKey(
    agent: Agent,
    request: string,
    code: string,
    context: CodeContext
  ): string {
    // Hash based on agent + code + critical context
    const hash = crypto.createHash('sha256');
    hash.update(agent.role);
    hash.update(request);
    hash.update(code);
    hash.update(context.filePath);
    // Don't include timestamp or user-specific data
    return hash.digest('hex');
  }
  
  async get(
    agent: Agent,
    request: string,
    code: string,
    context: CodeContext
  ): Promise<AgentAnalysis | null> {
    const key = this.getCacheKey(agent, request, code, context);
    return this.cache.get(key) || null;
  }
  
  async set(
    agent: Agent,
    request: string,
    code: string,
    context: CodeContext,
    analysis: AgentAnalysis
  ): Promise<void> {
    const key = this.getCacheKey(agent, request, code, context);
    this.cache.set(key, analysis);
  }
}
```

### Timeout Handling

```typescript
async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Agent timeout')), timeoutMs)
    )
  ]);
}

// Usage
const analyses = await Promise.all(
  agents.map(agent =>
    executeWithTimeout(
      () => agent.analyze(request, code, context),
      5000 // 5 second timeout per agent
    ).catch(error => {
      logger.warn(`Agent ${agent.role} timed out`, { error });
      // Return fallback analysis
      return createFallbackAnalysis(agent);
    })
  )
);
```

### Progressive Enhancement

```typescript
// Start with fast agents, add slower ones progressively
async function progressiveAnalysis(
  agents: Agent[],
  request: string,
  code: string,
  context: CodeContext
): Promise<AgentAnalysis[]> {
  // Tier 1: Fast agents (always run)
  const fastAgents = [engineerAgent, documentationAgent];
  const fastAnalyses = await Promise.all(
    fastAgents.map(a => a.analyze(request, code, context))
  );
  
  // Show intermediate results to user
  showIntermediateResults(fastAnalyses);
  
  // Tier 2: Medium agents (run if time permits)
  const mediumAgents = [securityAgent, performanceAgent];
  const mediumAnalyses = await Promise.all(
    mediumAgents.map(a => a.analyze(request, code, context))
  );
  
  // Update results
  showIntermediateResults([...fastAnalyses, ...mediumAnalyses]);
  
  // Tier 3: Slow agents (run in background)
  const slowAgents = [testingAgent, architectAgent];
  const slowAnalyses = await Promise.all(
    slowAgents.map(a => a.analyze(request, code, context))
  );
  
  // Final update
  return [...fastAnalyses, ...mediumAnalyses, ...slowAnalyses];
}
```

---

## Next Steps

1. **Implement Base Agent Class** - Foundation for all agents
2. **Build First Agent** - Security agent as proof of concept
3. **Implement ODAI Synthesizer** - Central synthesis logic
4. **Add N² Controller** - Quality control loop
5. **Test End-to-End** - Full agent system with real code
6. **Optimize Performance** - Caching, parallelization, timeouts
7. **Build Remaining Agents** - All six agents complete

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed steps.

---

**The agent system is the heart of CodeMind. It's where the psychological alpha lives - the hierarchical cognition, multi-perspective synthesis, and self-correction that makes CodeMind fundamentally different from single-model AI code assistants.**
