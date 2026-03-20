"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === "/login"

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen p-4 pb-20 md:ml-56 md:p-6 md:pb-6">{children}</main>
      <BottomNav />
    </>
  )
}
