import { PortfolioView } from "@/components/portfolio/portfolio-view"

export default function PortfolioPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your complete investment overview
        </p>
      </div>

      <PortfolioView />
    </div>
  )
}
