import { projects } from "@/data/projects"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TiltCard } from "@/components/tilt-card"
import { SplitText } from "@/components/split-text"

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <SplitText as="h1" className="text-3xl font-bold" stagger={0.04}>项目</SplitText>

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <TiltCard key={p.title} maxTilt={6}>
            <Card className="h-full flex flex-col transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xl font-semibold">{p.title}</h2>
                  {p.year && (
                    <span className="shrink-0 text-xs text-muted-foreground font-mono">
                      {p.year}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-4 pt-2">
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      Source
                    </a>
                  )}
                  {p.demo && (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}
