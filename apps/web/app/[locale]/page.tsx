import { Bot, Boxes, Code2, Terminal } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillCard } from "../../components/SkillCard";
import { Link } from "../../i18n/navigation";
import { skills } from "../../lib/registry";

const featuredIds = ["readme-writer", "code-reviewer", "prd-writer", "short-video-script-writer", "issue-triage", "release-notes-writer"];
const featured = featuredIds.map((id) => skills.find((skill) => skill.id === id)).filter(Boolean);

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1>Agent Skill OS</h1>
          <p>{t("tagline")}</p>
          <div className="hero-actions">
            <Link className="button primary" href="/skills">{t("viewSkills")}</Link>
            <Link className="button secondary" href="/showcase">{t("showcase")}</Link>
          </div>
        </div>
        <div className="terminal-preview" aria-label="CLI preview">
          <div className="terminal-bar"><span /><span /><span /></div>
          <pre>{["pnpm add -g agent-skill-os", "aso install readme-writer --target codex --dir .", "aso install-pack developer-productivity --target codex --dir ."].join("\n")}</pre>
        </div>
      </section>

      <section className="quick-band" id="quick-start">
        <div>
          <Terminal size={22} />
          <h2>{t("quickStart")}</h2>
        </div>
        <pre>pnpm add -g agent-skill-os{"\n"}aso install-pack developer-productivity --target codex --dir .</pre>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>{t("featuredSkills")}</h2>
          <Link href="/skills">{t("browseAll")}</Link>
        </div>
        <div className="grid">
          {featured.map((skill) => skill ? <SkillCard key={skill.id} skill={skill} /> : null)}
        </div>
      </section>

      <section className="feature-band">
        <div><Bot size={24} /><h3>{t("worksWithTitle")}</h3><p>{t("worksWithBody")}</p></div>
        <div><Boxes size={24} /><h3>{t("whyTitle")}</h3><p>{t("whyBody")}</p></div>
        <div><Code2 size={24} /><h3>{t("localTitle")}</h3><p>{t("localBody")}</p></div>
      </section>
    </main>
  );
}
