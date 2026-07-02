export const targetAdapters = [
  {
    id: "codex",
    path: ".codex/skills/<skill-id>/SKILL.md",
    loader: ".codex/AGENTS.md",
    command: "aso install readme-writer --target codex --dir ."
  },
  {
    id: "claude",
    path: ".claude/skills/<skill-id>/SKILL.md",
    loader: ".claude/CLAUDE.md",
    command: "aso install readme-writer --target claude --dir ."
  },
  {
    id: "cursor",
    path: ".cursor/rules/<skill-id>.mdc",
    loader: ".cursor/rules/agent-skill-os.mdc",
    command: "aso install readme-writer --target cursor --dir ."
  },
  {
    id: "generic",
    path: "agent-skills/<skill-id>/SKILL.md",
    loader: ".agent-skill-os/usage.md",
    command: "aso install readme-writer --target generic --dir ."
  }
] as const;

export const useCases = [
  {
    slug: "code-review",
    packId: "developer-productivity",
    skillIds: ["code-reviewer", "test-writer", "bug-reproducer", "pr-summarizer"],
    command: "aso install-pack developer-productivity --target codex --dir ."
  },
  {
    slug: "developer-productivity",
    packId: "developer-productivity",
    skillIds: ["code-reviewer", "test-writer", "bug-reproducer", "refactor-planner", "readme-writer", "pr-summarizer"],
    command: "aso install-pack developer-productivity --target codex --dir ."
  },
  {
    slug: "open-source-launch",
    packId: "launch-kit",
    skillIds: ["prd-writer", "landing-page-copywriter", "launch-post-writer", "readme-writer", "demo-video-planner"],
    command: "aso install-pack launch-kit --target codex --dir ."
  },
  {
    slug: "repo-maintenance",
    packId: "repo-maintainer",
    skillIds: ["issue-triage", "pr-summarizer", "release-notes-writer", "changelog-writer", "contributing-guide-writer"],
    command: "aso install-pack repo-maintainer --target codex --dir ."
  },
  {
    slug: "ai-video-creator",
    packId: "ai-video-creator",
    skillIds: ["short-video-script-writer", "youtube-title-thumbnail-ideas", "demo-video-planner", "source-summarizer"],
    command: "aso install-pack ai-video-creator --target codex --dir ."
  }
] as const;

export type TargetAdapter = (typeof targetAdapters)[number];
export type UseCase = (typeof useCases)[number];
