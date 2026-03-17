import {
  Geist_Mono,
  Montserrat_Alternates,
  Playfair_Display,
} from "next/font/google"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import Navbar from "@/components/navigations/Navbar"
import Footer from "@/components/navigations/Footer"
import Container from "@/components/Container"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Toaster } from "sonner"

declare global {
  interface Window {
    ethereum: {
      request: (args: { method: string }) => Promise<string[]>
      on: (event: string, handler: (accounts: string[]) => void) => void
    }
  }
}

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
})

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        montserratAlternates.variable,
        playfair.variable
      )}
    >
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <NuqsAdapter>
                <Navbar />
                <Container>{children}</Container>
                <Toaster />
                <Footer />
              </NuqsAdapter>
            </TooltipProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
