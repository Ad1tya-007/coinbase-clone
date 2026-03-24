import { CoinDetailView } from "@/components/markets/coin-detail-view"

export default async function CoinDetailPage({
  params,
}: {
  params: Promise<{ coinId: string }>
}) {
  const { coinId } = await params
  return <CoinDetailView coinId={coinId} />
}
