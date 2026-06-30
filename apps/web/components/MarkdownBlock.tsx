export function MarkdownBlock({ body }: { body: string }) {
  return (
    <div className="markdown-block">
      {body.split("\n").map((line, index) => {
        if (line.startsWith("# ")) return <h1 key={index}>{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={index}>{line.slice(3)}</h2>;
        if (line.startsWith("- ")) return <p key={index} className="list-line">{line}</p>;
        if (/^\d+\. /.test(line)) return <p key={index} className="list-line">{line}</p>;
        if (!line.trim()) return <div key={index} className="spacer" />;
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}
