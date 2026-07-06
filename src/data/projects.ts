export interface Project {
  title: string
  description: string
  tech: string[]
  github?: string
  demo?: string
}

export const projects: Project[] = [
  {
    title: "项目一",
    description: "项目简介，用几句话描述这个项目做了什么、用了什么技术、解决了什么问题。",
    tech: ["Next.js", "Python", "PostgreSQL"],
    github: "https://github.com/你的用户名/project1",
    demo: "https://project1.demo.com",
  },
  {
    title: "项目二",
    description: "项目简介，描述核心功能和你的贡献。",
    tech: ["React", "Node.js", "MongoDB"],
    github: "https://github.com/你的用户名/project2",
  },
]
