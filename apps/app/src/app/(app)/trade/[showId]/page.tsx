import ShowTradingView from "@/components/dashboard/trade/ShowTradingView";

type Props = { params: Promise<{ showId: string }> };

export default async function ShowTradingPage({ params }: Props) {
  const { showId } = await params;
  return <ShowTradingView showId={showId} />;
}
