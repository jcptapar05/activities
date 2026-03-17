import React from "react"

const Container = ({ children }: { children: React.ReactNode }) => {
  return <main className="container mx-auto px-4 py-10">{children}</main>
}

export default Container
