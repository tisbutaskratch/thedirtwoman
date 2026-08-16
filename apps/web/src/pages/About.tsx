import { about } from "@/lib/profile";

export default function About() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <div className="flex flex-col gap-4 text-content-muted">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
