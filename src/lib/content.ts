import fs from "fs/promises"
import path from "path"

// 数据存储根目录 — Next.js standalone 模式下 process.cwd() 指向项目根
// 开发: ~/Documents/blog/content/
// 生产: /app/content/ (Docker volume 挂载)
const CONTENT_DIR = path.join(process.cwd(), "content")
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles")
const UPLOADS_DIR = path.join(CONTENT_DIR, "uploads")

// ── 工具: 确保目录存在 ──

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {
    // 目录已存在
  }
}

async function readJSON<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJSON(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")
}

// ── 类型 ──

export interface Article {
  slug: string
  title: string
  description: string
  date: string // "2026-07-18"
  tags: string[]
  cover?: string
  pinned?: boolean
  views: number
}

export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  github?: string
  demo?: string
  year: string
}

export interface Thought {
  id: string
  verb: string
  target: string
  href?: string
  date: string // "7月23日" 或 "7月29日 14:30"
}

export interface GalleryItem {
  id: string
  src: string
  label: string
  /** 可选分组名（如「苏州」「长沙」「旅行」）；缺省时归入「未分类」组 */
  album?: string
}

export interface About {
  name: string
  title: string
  city: string
  bio: string
  skills: string[]
  contacts: {
    github: string
    wechat: string
    email: string
  }
}

/** 单首曲目 — 播放列表元素 */
export interface MusicTrack {
  id: string           // 唯一 id
  trackName: string    // 曲目标题
  artist?: string      // 艺术家（可选）
  file: string         // 音频文件路径，如 "/music/bg.mp3"
}

/** @deprecated 由 MusicTrack 替代，保留用于向后兼容 */
export interface MusicConfig {
  trackName: string    // 曲目标题
  artist?: string      // 艺术家（可选）
  file: string         // 音频文件路径，如 "/music/bg.mp3"
}

/** 生成音乐曲目 id */
function makeMusicId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  }
}

export interface BackgroundConfig {
  mode: "image" | "none"
  src: string                      // 背景图路径，如 "/content/uploads/bg.webp"
  overlay: string                  // 暗色遮罩，如 "rgba(20,12,6,0.45)"
  animation: "kenburns" | "none"
}

// Welcome 启动屏配置
export interface WelcomeConfig {
  enabled: boolean
  title: string
  subtitle: string
  background?: string // 可选动态图 URL，如 /content/uploads/welcome-bg.gif
  showParticles: boolean
}

// 站点设置 — settings.json，结构可扩展（REQ-008 已加入 welcome 区块）
export interface Settings {
  background?: BackgroundConfig
  welcome?: WelcomeConfig
}

// ── 文章 ──

const ARTICLES_JSON = path.join(CONTENT_DIR, "articles.json")

export async function getArticles(): Promise<Article[]> {
  await ensureDir(CONTENT_DIR)
  const articles = await readJSON<Article[]>(ARTICLES_JSON, [])
  // 按日期倒序
  return articles.sort((a, b) => (b.date > a.date ? 1 : -1))
}

export async function getArticleBySlug(
  slug: string
): Promise<{ meta: Article; content: string } | null> {
  const articles = await getArticles()
  const meta = articles.find((a) => a.slug === slug)
  if (!meta) return null

  const mdPath = path.join(ARTICLES_DIR, `${slug}.md`)
  let content = ""
  try {
    content = await fs.readFile(mdPath, "utf-8")
  } catch {
    content = ""
  }

  return { meta, content }
}

export async function saveArticle(
  slug: string,
  meta: Article,
  content: string
): Promise<void> {
  await ensureDir(ARTICLES_DIR)

  // 更新 articles.json
  const articles = await getArticles()
  const idx = articles.findIndex((a) => a.slug === slug)
  if (idx >= 0) {
    articles[idx] = meta
  } else {
    articles.push(meta)
  }
  await writeJSON(ARTICLES_JSON, articles)

  // 写入正文 .md 文件
  await fs.writeFile(path.join(ARTICLES_DIR, `${slug}.md`), content, "utf-8")
}

export async function deleteArticle(slug: string): Promise<void> {
  // 从 JSON 删除
  const articles = await getArticles()
  const filtered = articles.filter((a) => a.slug !== slug)
  await writeJSON(ARTICLES_JSON, filtered)

  // 删除 .md 文件
  try {
    await fs.unlink(path.join(ARTICLES_DIR, `${slug}.md`))
  } catch {
    // 文件不存在，忽略
  }
}

// ── 项目 ──

const PROJECTS_JSON = path.join(CONTENT_DIR, "projects.json")

export async function getProjects(): Promise<Project[]> {
  await ensureDir(CONTENT_DIR)
  return readJSON<Project[]>(PROJECTS_JSON, [])
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await writeJSON(PROJECTS_JSON, projects)
}

// ── 碎碎念 ──

const THOUGHTS_JSON = path.join(CONTENT_DIR, "thoughts.json")

export async function getThoughts(): Promise<Thought[]> {
  await ensureDir(CONTENT_DIR)
  return readJSON<Thought[]>(THOUGHTS_JSON, [])
}

export async function saveThoughts(thoughts: Thought[]): Promise<void> {
  await writeJSON(THOUGHTS_JSON, thoughts)
}

// ── 相册 ──

const GALLERY_JSON = path.join(CONTENT_DIR, "gallery.json")

export async function getGallery(): Promise<GalleryItem[]> {
  await ensureDir(CONTENT_DIR)
  return readJSON<GalleryItem[]>(GALLERY_JSON, [])
}

export async function saveGallery(items: GalleryItem[]): Promise<void> {
  await writeJSON(GALLERY_JSON, items)
}

// ── 关于 ──

const ABOUT_JSON = path.join(CONTENT_DIR, "about.json")

export async function getAbout(): Promise<About | null> {
  await ensureDir(CONTENT_DIR)
  return readJSON<About | null>(ABOUT_JSON, null)
}

export async function saveAbout(about: About): Promise<void> {
  await writeJSON(ABOUT_JSON, about)
}

// ── 音乐 ──

const MUSIC_JSON = path.join(CONTENT_DIR, "music.json")

/** 单对象 → 数组（向后兼容旧 music.json 单曲结构） */
function toList(data: unknown): MusicTrack[] {
  if (Array.isArray(data)) return data as MusicTrack[]
  if (data && typeof data === "object") {
    const obj = data as Partial<MusicConfig> & { id?: string }
    if (obj.trackName && obj.file) {
      const track: MusicTrack = {
        id: obj.id ?? makeMusicId(),
        trackName: obj.trackName,
        artist: obj.artist,
        file: obj.file,
      }
      return [track]
    }
  }
  return []
}

/** 读取完整播放列表 */
export async function getMusicList(): Promise<MusicTrack[]> {
  await ensureDir(CONTENT_DIR)
  return toList(await readJSON<unknown>(MUSIC_JSON, []))
}

/** 整体写入播放列表 */
export async function saveMusicList(list: MusicTrack[]): Promise<void> {
  await writeJSON(MUSIC_JSON, list)
}

/**
 * 读取第一首曲目（向后兼容，供 layout 直接取单曲）。
 * 返回第一首或 null；列表为空时返回 null。
 */
export async function getMusic(): Promise<MusicConfig | null> {
  const list = await getMusicList()
  const first = list[0]
  if (!first) return null
  return {
    trackName: first.trackName,
    artist: first.artist,
    file: first.file,
  }
}

/** @deprecated 由 saveMusicList 替代 — 保存单曲（追加/替换同 file） */
export async function saveMusic(music: MusicConfig): Promise<void> {
  const list = await getMusicList()
  const idx = list.findIndex((t) => t.file === music.file)
  const track: MusicTrack = {
    id: list[idx]?.id ?? makeMusicId(),
    trackName: music.trackName,
    artist: music.artist,
    file: music.file,
  }
  if (idx >= 0) {
    list[idx] = track
  } else {
    list.unshift(track)
  }
  await saveMusicList(list)
}

// ── 站点设置 ──

const SETTINGS_JSON = path.join(CONTENT_DIR, "settings.json")

export async function getSettings(): Promise<Settings> {
  await ensureDir(CONTENT_DIR)
  return readJSON<Settings>(SETTINGS_JSON, {})
}

export async function saveSettings(settings: Settings): Promise<void> {
  await writeJSON(SETTINGS_JSON, settings)
}

// ── 上传 ──

export async function saveUpload(
  filename: string,
  buffer: Buffer
): Promise<string> {
  await ensureDir(UPLOADS_DIR)
  const filePath = path.join(UPLOADS_DIR, filename)
  await fs.writeFile(filePath, buffer)
  return `/content/uploads/${filename}`
}

export function getUploadsDir(): string {
  return UPLOADS_DIR
}

export function getMusicDir(): string {
  return path.join(CONTENT_DIR, "music")
}
