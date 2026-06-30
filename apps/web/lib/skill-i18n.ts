import type { Locale } from "../i18n/routing";
import type { SkillMetadata } from "./registry";

type SkillText = {
  name?: string;
  summary?: string;
  description?: string;
};

export type LocalizedSkillMetadata = SkillMetadata & {
  categoryLabel: string;
  difficultyLabel: string;
  tagLabels: string[];
  searchText: string;
};

const skillTextByLocale: Partial<Record<Locale, Record<string, SkillText>>> = {
  "zh-CN": {
    "api-docs-writer": {
      name: "API 文档写作助手",
      summary: "根据代码或接口说明生成实用的 API 文档。"
    },
    "bug-reproducer": {
      name: "Bug 复现助手",
      summary: "把 Bug 报告转成可复现步骤和最小失败用例。"
    },
    "changelog-writer": {
      name: "更新日志写作助手",
      summary: "把提交、PR 或发布说明整理成清晰的 changelog。"
    },
    "code-reviewer": {
      name: "代码审查助手",
      summary: "审查代码中的 Bug、风险、边界情况和测试缺口。"
    },
    "competitor-researcher": {
      name: "竞品研究助手",
      summary: "把竞品研究整理成可比较的定位和功能笔记。"
    },
    "contributing-guide-writer": {
      name: "贡献指南写作助手",
      summary: "为开源仓库创建贡献者入门和贡献规则。"
    },
    "demo-video-planner": {
      name: "Demo 视频规划助手",
      summary: "规划包含镜头、旁白和屏幕操作的产品 Demo 视频。"
    },
    "dependency-upgrade-planner": {
      name: "依赖升级规划助手",
      summary: "分析依赖升级风险并生成安全上线计划。"
    },
    "issue-triage": {
      name: "Issue 分诊助手",
      summary: "总结 Issue、判断优先级，并建议标签和下一步动作。"
    },
    "landing-page-copywriter": {
      name: "落地页文案助手",
      summary: "撰写落地页 Hero、页面区块、CTA 和转化文案。"
    },
    "launch-post-writer": {
      name: "发布帖写作助手",
      summary: "为 X、Hacker News、Reddit、掘金和知乎创建发布帖。"
    },
    "performance-reviewer": {
      name: "性能审查助手",
      summary: "识别可能的性能瓶颈并给出可执行优化建议。"
    },
    "pr-summarizer": {
      name: "PR 摘要助手",
      summary: "总结 Pull Request 改动、风险和审查重点。"
    },
    "prd-writer": {
      name: "PRD 写作助手",
      summary: "把产品想法整理成清晰的产品需求文档。"
    },
    "readme-writer": {
      name: "README 写作助手",
      summary: "为开源项目生成高转化 GitHub README。"
    },
    "refactor-planner": {
      name: "重构规划助手",
      summary: "把重构拆成小步、可回滚、可测试的执行计划。"
    },
    "release-notes-writer": {
      name: "发布说明写作助手",
      summary: "根据提交、PR 和 Issue 生成发布说明。"
    },
    "roadmap-planner": {
      name: "路线图规划助手",
      summary: "把需求和反馈转化成实用的产品路线图。"
    },
    "short-video-script-writer": {
      name: "短视频脚本助手",
      summary: "撰写 15 秒、30 秒和 60 秒短视频脚本。"
    },
    "source-summarizer": {
      name: "资料摘要助手",
      summary: "把资料来源总结成简洁、结构化、可追溯的笔记。"
    },
    "technical-decision-record": {
      name: "技术决策记录助手",
      summary: "撰写包含背景、选项和影响的架构决策记录。"
    },
    "test-writer": {
      name: "测试编写助手",
      summary: "根据代码行为生成单元测试、边界测试和回归用例。"
    },
    "user-story-mapper": {
      name: "用户故事拆解助手",
      summary: "把需求拆成用户故事、流程和验收标准。"
    },
    "youtube-title-thumbnail-ideas": {
      name: "YouTube 标题封面助手",
      summary: "生成 YouTube 标题、封面文案和开场 Hook。"
    }
  },
  ja: {
    "api-docs-writer": {
      name: "API ドキュメント作成アシスタント",
      summary: "コードやインターフェースメモから実用的な API ドキュメントを生成します。"
    },
    "bug-reproducer": {
      name: "バグ再現アシスタント",
      summary: "バグ報告を再現手順と最小の失敗ケースに整理します。"
    },
    "changelog-writer": {
      name: "変更履歴作成アシスタント",
      summary: "コミット、PR、リリースノートを明確な changelog にまとめます。"
    },
    "code-reviewer": {
      name: "コードレビューアシスタント",
      summary: "コードのバグ、リスク、境界条件、テスト不足をレビューします。"
    },
    "competitor-researcher": {
      name: "競合調査アシスタント",
      summary: "競合調査を比較しやすいポジショニングと機能メモに整理します。"
    },
    "contributing-guide-writer": {
      name: "コントリビューションガイド作成アシスタント",
      summary: "OSS リポジトリ向けの参加手順と貢献ルールを作成します。"
    },
    "demo-video-planner": {
      name: "デモ動画プランナー",
      summary: "シーン、ナレーション、画面操作を含む製品デモ動画を計画します。"
    },
    "dependency-upgrade-planner": {
      name: "依存関係アップグレード計画アシスタント",
      summary: "依存関係アップグレードのリスクを分析し、安全な展開計画を作ります。"
    },
    "issue-triage": {
      name: "Issue トリアージアシスタント",
      summary: "Issue を要約し、優先度、ラベル、次のアクションを提案します。"
    },
    "landing-page-copywriter": {
      name: "ランディングページコピー作成アシスタント",
      summary: "Hero、セクション、CTA、コンバージョン文案を作成します。"
    },
    "launch-post-writer": {
      name: "ローンチ投稿作成アシスタント",
      summary: "X、Hacker News、Reddit、Juejin、Zhihu 向けのローンチ投稿を作ります。"
    },
    "performance-reviewer": {
      name: "パフォーマンスレビューアシスタント",
      summary: "想定される性能ボトルネックと実践的な最適化案を特定します。"
    },
    "pr-summarizer": {
      name: "PR 要約アシスタント",
      summary: "Pull Request の変更点、リスク、レビュー観点を要約します。"
    },
    "prd-writer": {
      name: "PRD 作成アシスタント",
      summary: "製品アイデアを明確なプロダクト要求仕様書に整理します。"
    },
    "readme-writer": {
      name: "README 作成アシスタント",
      summary: "OSS プロジェクト向けに訴求力の高い GitHub README を作成します。"
    },
    "refactor-planner": {
      name: "リファクタリング計画アシスタント",
      summary: "リファクタリングを小さく、戻しやすく、テスト可能な手順に分解します。"
    },
    "release-notes-writer": {
      name: "リリースノート作成アシスタント",
      summary: "コミット、PR、Issue からリリースノートを作成します。"
    },
    "roadmap-planner": {
      name: "ロードマップ計画アシスタント",
      summary: "要求とフィードバックを実践的なプロダクトロードマップに変換します。"
    },
    "short-video-script-writer": {
      name: "ショート動画脚本アシスタント",
      summary: "15 秒、30 秒、60 秒のショート動画脚本を作成します。"
    },
    "source-summarizer": {
      name: "資料要約アシスタント",
      summary: "資料を簡潔で構造化された追跡可能なメモに要約します。"
    },
    "technical-decision-record": {
      name: "技術決定記録アシスタント",
      summary: "背景、選択肢、影響を含むアーキテクチャ決定記録を作成します。"
    },
    "test-writer": {
      name: "テスト作成アシスタント",
      summary: "コードの振る舞いから単体テスト、境界テスト、回帰ケースを生成します。"
    },
    "user-story-mapper": {
      name: "ユーザーストーリーマッピングアシスタント",
      summary: "要求をユーザーストーリー、フロー、受け入れ基準に分解します。"
    },
    "youtube-title-thumbnail-ideas": {
      name: "YouTube タイトル・サムネイル案アシスタント",
      summary: "YouTube タイトル、サムネイル文言、冒頭フックを生成します。"
    }
  }
};

const categoryLabels: Record<string, Record<Locale, string>> = {
  documentation: { en: "Documentation", "zh-CN": "文档", ja: "ドキュメント" },
  coding: { en: "Coding", "zh-CN": "编码", ja: "コーディング" },
  github: { en: "GitHub", "zh-CN": "GitHub", ja: "GitHub" },
  product: { en: "Product", "zh-CN": "产品", ja: "プロダクト" },
  content: { en: "Content", "zh-CN": "内容", ja: "コンテンツ" },
  research: { en: "Research", "zh-CN": "研究", ja: "リサーチ" }
};

const difficultyLabels: Record<string, Record<Locale, string>> = {
  beginner: { en: "Beginner", "zh-CN": "入门", ja: "初級" },
  intermediate: { en: "Intermediate", "zh-CN": "中级", ja: "中級" },
  advanced: { en: "Advanced", "zh-CN": "高级", ja: "上級" }
};

const tagLabels: Partial<Record<string, Record<Locale, string>>> = {
  acceptance: { en: "Acceptance", "zh-CN": "验收", ja: "受け入れ" },
  adr: { en: "ADR", "zh-CN": "ADR", ja: "ADR" },
  api: { en: "API", "zh-CN": "API", ja: "API" },
  architecture: { en: "Architecture", "zh-CN": "架构", ja: "アーキテクチャ" },
  bug: { en: "Bug", "zh-CN": "Bug", ja: "バグ" },
  changelog: { en: "Changelog", "zh-CN": "更新日志", ja: "変更履歴" },
  commits: { en: "Commits", "zh-CN": "提交", ja: "コミット" },
  competitors: { en: "Competitors", "zh-CN": "竞品", ja: "競合" },
  contributing: { en: "Contributing", "zh-CN": "贡献", ja: "貢献" },
  copy: { en: "Copy", "zh-CN": "文案", ja: "コピー" },
  debugging: { en: "Debugging", "zh-CN": "调试", ja: "デバッグ" },
  decision: { en: "Decision", "zh-CN": "决策", ja: "意思決定" },
  demo: { en: "Demo", "zh-CN": "Demo", ja: "デモ" },
  dependencies: { en: "Dependencies", "zh-CN": "依赖", ja: "依存関係" },
  docs: { en: "Docs", "zh-CN": "文档", ja: "ドキュメント" },
  github: { en: "GitHub", "zh-CN": "GitHub", ja: "GitHub" },
  hook: { en: "Hook", "zh-CN": "开场钩子", ja: "フック" },
  issues: { en: "Issues", "zh-CN": "Issue", ja: "Issue" },
  labels: { en: "Labels", "zh-CN": "标签", ja: "ラベル" },
  landing: { en: "Landing", "zh-CN": "落地页", ja: "ランディング" },
  launch: { en: "Launch", "zh-CN": "发布", ja: "ローンチ" },
  market: { en: "Market", "zh-CN": "市场", ja: "市場" },
  marketing: { en: "Marketing", "zh-CN": "营销", ja: "マーケティング" },
  notes: { en: "Notes", "zh-CN": "说明", ja: "ノート" },
  onboarding: { en: "Onboarding", "zh-CN": "入门", ja: "オンボーディング" },
  optimization: { en: "Optimization", "zh-CN": "优化", ja: "最適化" },
  performance: { en: "Performance", "zh-CN": "性能", ja: "パフォーマンス" },
  plan: { en: "Plan", "zh-CN": "计划", ja: "計画" },
  planning: { en: "Planning", "zh-CN": "规划", ja: "計画" },
  positioning: { en: "Positioning", "zh-CN": "定位", ja: "ポジショニング" },
  prd: { en: "PRD", "zh-CN": "PRD", ja: "PRD" },
  product: { en: "Product", "zh-CN": "产品", ja: "プロダクト" },
  profiling: { en: "Profiling", "zh-CN": "性能分析", ja: "プロファイリング" },
  "pull-request": { en: "Pull Request", "zh-CN": "Pull Request", ja: "Pull Request" },
  quality: { en: "Quality", "zh-CN": "质量", ja: "品質" },
  readme: { en: "README", "zh-CN": "README", ja: "README" },
  refactor: { en: "Refactor", "zh-CN": "重构", ja: "リファクタリング" },
  reference: { en: "Reference", "zh-CN": "参考", ja: "リファレンス" },
  regression: { en: "Regression", "zh-CN": "回归", ja: "回帰" },
  release: { en: "Release", "zh-CN": "发布", ja: "リリース" },
  reproduction: { en: "Reproduction", "zh-CN": "复现", ja: "再現" },
  requirements: { en: "Requirements", "zh-CN": "需求", ja: "要求" },
  research: { en: "Research", "zh-CN": "研究", ja: "リサーチ" },
  review: { en: "Review", "zh-CN": "审查", ja: "レビュー" },
  risk: { en: "Risk", "zh-CN": "风险", ja: "リスク" },
  roadmap: { en: "Roadmap", "zh-CN": "路线图", ja: "ロードマップ" },
  screens: { en: "Screens", "zh-CN": "屏幕", ja: "画面" },
  script: { en: "Script", "zh-CN": "脚本", ja: "脚本" },
  shorts: { en: "Shorts", "zh-CN": "短视频", ja: "ショート" },
  social: { en: "Social", "zh-CN": "社交", ja: "ソーシャル" },
  sources: { en: "Sources", "zh-CN": "资料来源", ja: "資料" },
  stories: { en: "Stories", "zh-CN": "用户故事", ja: "ストーリー" },
  summary: { en: "Summary", "zh-CN": "摘要", ja: "要約" },
  testing: { en: "Testing", "zh-CN": "测试", ja: "テスト" },
  thumbnail: { en: "Thumbnail", "zh-CN": "封面", ja: "サムネイル" },
  triage: { en: "Triage", "zh-CN": "分诊", ja: "トリアージ" },
  upgrade: { en: "Upgrade", "zh-CN": "升级", ja: "アップグレード" },
  video: { en: "Video", "zh-CN": "视频", ja: "動画" },
  vitest: { en: "Vitest", "zh-CN": "Vitest", ja: "Vitest" },
  youtube: { en: "YouTube", "zh-CN": "YouTube", ja: "YouTube" }
};

export function getCategoryLabel(category: string, locale: Locale) {
  return categoryLabels[category]?.[locale] ?? categoryLabels[category]?.en ?? category;
}

export function getDifficultyLabel(difficulty: string, locale: Locale) {
  return difficultyLabels[difficulty]?.[locale] ?? difficultyLabels[difficulty]?.en ?? difficulty;
}

export function getTagLabel(tag: string, locale: Locale) {
  return tagLabels[tag]?.[locale] ?? tagLabels[tag]?.en ?? tag;
}

export function localizeSkill(skill: SkillMetadata, locale: Locale): LocalizedSkillMetadata {
  const text = skillTextByLocale[locale]?.[skill.id];
  const tagLabelValues = skill.tags.map((tag) => getTagLabel(tag, locale));
  const localizedSkill = {
    ...skill,
    name: text?.name ?? skill.name,
    summary: text?.summary ?? skill.summary,
    description: text?.description ?? skill.description,
    categoryLabel: getCategoryLabel(skill.category, locale),
    difficultyLabel: getDifficultyLabel(skill.difficulty, locale),
    tagLabels: tagLabelValues
  };

  return {
    ...localizedSkill,
    searchText: [
      localizedSkill.id,
      localizedSkill.name,
      localizedSkill.summary,
      localizedSkill.description,
      localizedSkill.category,
      localizedSkill.categoryLabel,
      localizedSkill.difficulty,
      localizedSkill.difficultyLabel,
      localizedSkill.tags.join(" "),
      localizedSkill.tagLabels.join(" ")
    ].join(" ").toLowerCase()
  };
}

export function localizeSkills(skills: SkillMetadata[], locale: Locale) {
  return skills.map((skill) => localizeSkill(skill, locale));
}
