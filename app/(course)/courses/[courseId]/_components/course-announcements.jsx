import { Bell } from "lucide-react";

export const CourseAnnouncements = ({ announcements = [] }) => (
  <section className="space-y-4">
    <div className="pb-2 border-b border-ink-100">
      <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
        Official Dispatches
      </div>
      <h2 className="font-serif text-2xl font-medium text-ink-950">
        Course Bulletins & Announcements
      </h2>
    </div>

    {announcements.length === 0 ? (
      <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-xs font-mono text-ink-400">
        No administrative notices or cohort memos posted yet.
      </div>
    ) : (
      <div className="space-y-3">
        {announcements.map((item) => (
          <article
            key={item.id}
            className="border border-ink-200/90 rounded-xl p-5 bg-white shadow-subtle space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif font-medium text-base text-ink-950">
                {item.title}
              </h3>
              <div className="text-[11px] font-mono text-ink-400 shrink-0">
                {item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </div>
            </div>
            <p className="text-xs md:text-sm text-ink-700 whitespace-pre-wrap leading-relaxed font-sans">
              {item.content}
            </p>
          </article>
        ))}
      </div>
    )}
  </section>
);
