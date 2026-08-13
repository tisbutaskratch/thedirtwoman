import { contactLinks } from "@/lib/profile";

export default function Contact() {
  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="text-slate-400">
        Send word by post, raven, or whatever's quickest — I'll get back to you between garden rounds.
      </p>
      <ul className="flex flex-col gap-3">
        {contactLinks.map((link) => (
          <li
            key={link.label}
            className="flex items-center justify-between rounded-lg border border-slate-800 px-5 py-4"
          >
            <span className="text-sm font-medium uppercase tracking-widest text-slate-500">
              {link.label}
            </span>
            {link.href === "#" ? (
              <span className="text-slate-300">{link.value}</span>
            ) : (
              <a
                href={link.href}
                className="text-emerald-400 transition-colors hover:text-emerald-300"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.value}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
