import { cookies } from "next/headers"

/**
 * Admin API 鉴权 — 比对 cookie admin_token 与环境变量 ADMIN_PASSWORD。
 * 返回 null 表示鉴权通过；返回 Response 表示鉴权失败（调用方直接 return）。
 */
export async function auth(): Promise<Response | null> {
  const token = (await cookies()).get("admin_token")?.value
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    return Response.json(
      { error: "服务器未配置 ADMIN_PASSWORD 环境变量" },
      { status: 500 }
    )
  }

  if (!token || token !== password) {
    return Response.json(
      { error: "未登录或登录已过期" },
      { status: 401 }
    )
  }

  return null // 鉴权通过
}
