# AI and agents pack

Applies when the project calls a model, or when agents work on the project.

The idea behind every rule here: a model will sometimes follow text it should not. What matters is what it can do when that happens.

### AI-01  Untrusted text never carries authority
**Rule.** Content the model reads from users, web pages, documents, emails, issues, tool results or other agents is treated as data. It cannot change the model's instructions, permissions or goals.
**Why.** Prompt injection, direct and indirect. Hidden instructions in a pull request, a fetched page or a retrieved document steer the model.
**Check.** Trace each place outside text enters the context. For each, ask what the worst instruction hidden there could cause. If the answer is "an action", AI-02 must contain it.
**Fix.** Separate instructions from data in the prompt, strip or flag markup that hides text, and rely on AI-02 rather than on the model noticing.
**Sources.** OWASP LLM Top 10 2026 (Prompt Injection) · MITRE ATLAS AML.T0051 · Wiki: [Threat frameworks](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Threat-Frameworks-STRIDE-ATTACK-ATLAS)

### AI-02  Limits live in credentials, not in prompts
**Rule.** Anything an agent must not do is prevented by what its credentials and tools allow, not by a sentence telling it not to.
**Why.** Excessive agency. Injected text can contradict a written rule. It cannot grant a permission the token does not have.
**Check.** List each tool and credential the agent holds. For each, name the most damaging call possible. If that call is not needed, it should be impossible.
**Fix.** Scope tokens per task, make destructive tools require human approval, give read-only access by default, and run agents in a sandbox with no route to production.
**Sources.** OWASP LLM Top 10 2026 (Excessive Agency) · OWASP Top 10 for Agentic Applications 2026 · MITRE ATLAS AML.T0053

### AI-03  Secrets stay out of context
**Rule.** API keys, tokens and customer data the task does not need are never placed where the model or its tools can read them.
**Why.** Whatever is in context can be leaked, by injection, by a tool call, or by the agent writing it into a commit or a public comment.
**Check.** Inspect the agent's environment variables, readable files and tool configs. Search agent-authored commits and pull requests for secret patterns.
**Fix.** Inject secrets only into the process that needs them, outside the agent's view. Add secret scanning with push protection.
**Sources.** OWASP LLM Top 10 2026 (Sensitive Information Disclosure) · MITRE ATLAS AML.T0057, AML.T0055

### AI-04  Treat model output as untrusted input
**Rule.** Model output is validated or escaped before it reaches a shell, a database, a browser, a file path or another system.
**Why.** Output that is rendered or executed turns an injection into code execution, cross-site scripting or data exfiltration through a rendered link or image.
**Check.** Find every place output is passed to `eval`, a shell, SQL, HTML rendering or an HTTP request. Each has validation or a strict schema.
**Fix.** Use structured output with schema validation, parameterized queries, HTML escaping, and an allowlist for URLs the UI will load.
**Sources.** OWASP LLM Top 10 2026 (Improper Output Handling) · MITRE ATLAS AML.T0077

### AI-05  Verify every package an AI suggests
**Rule.** A dependency proposed by a model is confirmed to exist, to be the intended project, and to be maintained before it is installed.
**Why.** Models invent package names. Attackers register those names with malicious code.
**Check.** New dependencies in agent-authored changes have a registry page, a source repository and history that predates the suggestion.
**Fix.** Require human review for any new dependency. Block installs in agent sessions unless the plan names the package.
**Sources.** MITRE ATLAS AML.T0060, AML.T0011.001

### AI-06  Protect the instructions agents read
**Rule.** Files that steer agents (`AGENTS.md`, `CLAUDE.md`, prompts, skills, MCP configs) change only through reviewed pull requests, with the same care as code that deploys.
**Why.** A merged change to those files persists. It poisons every later agent session.
**Check.** Those paths are covered by required review (CODEOWNERS or branch protection).
**Fix.** Add them to CODEOWNERS and require approval from a person.
**Sources.** MITRE ATLAS AML.T0080, AML.T0081

### AI-07  Vet tools, MCP servers and models like dependencies
**Rule.** Every MCP server, plugin, tool and model the project uses comes from a known source, is pinned to a version, and is listed in `seniorsec.json`.
**Why.** A tool's description and results enter the model's context. A malicious or compromised tool can inject instructions or exfiltrate data.
**Check.** The `ai.tools` and `ai.mcp_servers` lists in the profile match what the configs actually load.
**Fix.** Remove unused tools, pin versions, and prefer first-party servers.
**Sources.** OWASP LLM Top 10 2026 (Supply Chain) · MITRE ATLAS AML.T0099

### AI-08  Cap spend and loops
**Rule.** Model usage has a budget, a rate limit and a maximum step count per task.
**Why.** A looping agent or an abusive user can burn quota fast, which is both a bill and a denial of service.
**Check.** Provider-side spend limits are set. Agent runs have a step or time cap.
**Fix.** Set limits at the provider, add per-user rate limiting, and stop runs at a ceiling.
**Sources.** OWASP LLM Top 10 2026 (Unbounded Consumption) · MITRE ATLAS AML.T0034

### AI-09  Keep model endpoints private
**Rule.** Self-hosted model servers, vector stores and agent control ports are not reachable from the internet without authentication.
**Why.** Exposed inference servers and vector databases are scanned for and abused.
**Check.** From outside the network, the model port and vector store do not answer.
**Fix.** Bind to localhost or a private network and put identity-aware access in front.
**Sources.** MITRE ATLAS AML.T0132
