import { ArrowRight, Film, Rocket, Wrench } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../i18n/navigation";

const scenarios = [
  {
    key: "developerProductivity",
    icon: Wrench,
    command: "aso install-pack developer-productivity --target codex --dir .",
    skills: ["code-reviewer", "test-writer", "bug-reproducer", "refactor-planner", "readme-writer", "pr-summarizer"]
  },
  {
    key: "launchKit",
    icon: Rocket,
    command: "aso install-pack launch-kit --target codex --dir .",
    skills: ["prd-writer", "landing-page-copywriter", "launch-post-writer", "readme-writer", "demo-video-planner"]
  },
  {
    key: "aiVideoCreator",
    icon: Film,
    command: "aso install-pack ai-video-creator --target codex --dir .",
    skills: ["short-video-script-writer", "youtube-title-thumbnail-ideas", "demo-video-planner", "source-summarizer"]
  }
] as const;

export default async function ShowcasePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("showcase");

  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>
      <div className="showcase-grid">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <article className="showcase-card" key={scenario.key}>
              <div className="showcase-title">
                <Icon size={24} />
                <h2>{t(`scenarios.${scenario.key}.name`)}</h2>
              </div>
              <div className="showcase-block">
                <strong>{t("installCommand")}</strong>
                <pre>{scenario.command}</pre>
              </div>
              <div className="showcase-block">
                <strong>{t("installedSkills")}</strong>
                <div className="tags">
                  {scenario.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </div>
              <div className="showcase-block">
                <strong>{t("expectedOutput")}</strong>
                <p>{t(`scenarios.${scenario.key}.output`)}</p>
              </div>
              <div className="showcase-block">
                <strong>{t("useful")}</strong>
                <p>{t(`scenarios.${scenario.key}.useful`)}</p>
              </div>
              <Link className="card-action" href="/packs">
                {t("viewPacks")}
                <ArrowRight size={16} />
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
