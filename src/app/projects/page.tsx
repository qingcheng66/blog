import { projects } from "@/data/projects"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">项目</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <h2 className="text-xl font-semibold">{p.title}</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tech.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                {p.github && (
                  <a href={p.github} target="_blank" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                    GitHub
                  </a>
                )}
                {p.demo && (
                  <a href={p.demo} target="_blank" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                    Demo
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
