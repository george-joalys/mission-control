"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === "/login"

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <main className="ml-56 min-h-screen p-6">{children}</main>
    </>
  )
}
