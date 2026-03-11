import ShowDetails from "@/components/dashboard/watch/ShowDetails";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WatchShowDetails({ params }: Props) {
  const { id } = await params;
  return <ShowDetails id={id} />;
}