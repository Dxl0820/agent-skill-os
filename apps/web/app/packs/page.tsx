import { Package } from "lucide-react";
import { packs } from "../../lib/registry";

export default function PacksPage() {
  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">Skill Packs</span>
        <h1>Install a complete workflow in one command.</h1>
        <p>Packs combine related skills for developer productivity, repo maintenance, launches, and video creation.</p>
      </div>
      <div className="pack-grid">
        {packs.map((pack) => (
          <article className="pack-card" key={pack.id}>
            <Package size={22} />
            <h2>{pack.name}</h2>
            <p>{pack.summary}</p>
            <pre>aso install-pack {pack.id} --target codex --dir .</pre>
            <div className="tags">
              {pack.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
