import type { Metadata } from "next";
import ShowDetails from "@/components/dashboard/watch/ShowDetails";

type Props = {
  params: Promise<{ id: string }>;
};

const API_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.pixsee.io";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/api/v1/shows/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("show not found");

    const json = await res.json();
    const show = (json?.data ?? json) as {
      title?: string;
      description?: string;
      cover_image_url?: string | null;
      creator?: { name?: string; username?: string } | null;
      episodes?: { thumbnail_url?: string | null }[];
    };

    const title = show?.title ?? "Watch on Pixsee";
    const description =
      show?.description?.slice(0, 200) ??
      "Watch, create, and earn on Pixsee — the on-chain streaming platform.";
    const creatorName = show?.creator?.name ?? show?.creator?.username;
    const imageUrl =
      show?.cover_image_url ??
      show?.episodes?.[0]?.thumbnail_url ??
      null;
    const pageUrl = `${APP_URL}/watch/${id}`;

    return {
      title: `${title}${creatorName ? ` · ${creatorName}` : ""} — Pixsee`,
      description,
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: "Pixsee",
        type: "video.other",
        images: imageUrl
          ? [{ url: imageUrl, width: 1280, height: 720, alt: title }]
          : [{ url: `${APP_URL}/icons/icon-512x512.png`, width: 512, height: 512, alt: "Pixsee" }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : [`${APP_URL}/icons/icon-512x512.png`],
      },
    };
  } catch {
    return {
      title: "Watch on Pixsee",
      description: "Watch, create, and earn on Pixsee — the on-chain streaming platform.",
    };
  }
}

export default async function WatchShowDetails({ params }: Props) {
  const { id } = await params;
  return <ShowDetails id={id} />;
}
