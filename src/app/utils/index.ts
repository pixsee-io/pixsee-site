export type ShowCardProps = {
  id: string;
  title: string;
  thumbnailUrl: string;
  creatorName: string;
  creatorAvatar?: string;
  views: string;
  likes: string;
  genre?: string;
  episodeCount?: number;
  description?: string;
  isPlaying?: boolean;
  className?: string;
};

export type FeaturedShowData = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  creatorName: string;
  creatorAvatar?: string;
  views: string;
  likes: string;
  episodeCount?: number;
};

export const mockShows: ShowCardProps[] = [
  {
    id: "1",
    title: "Point of Impact",
    thumbnailUrl: "/images/movie1.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    genre: "Drama",
    episodeCount: 10,
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "2",
    title: "Last Text",
    thumbnailUrl: "/images/movie2.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "3",
    title: "Second Chance",
    thumbnailUrl: "/images/movie3.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "4",
    title: "Code Black",
    thumbnailUrl: "/images/movie4.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "5",
    title: "Second Chances",
    thumbnailUrl: "/images/movie5.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "6",
    title: "Crossroads",
    thumbnailUrl: "/images/movie6.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
    genre: "Drama",
  },
  {
    id: "7",
    title: "Empty Chair",
    thumbnailUrl: "/images/movie7.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "8",
    title: "Breaking Limits",
    thumbnailUrl: "/images/movie8.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
];

export const featuredShows: FeaturedShowData[] = [
  {
    id: "quantum-dreams",
    title: "Quantum Dreams: Genesis",
    description:
      "A mind-bending journey through parallel realities. Join the creator as they explore the boundaries between consciousness and digital existence in this exclusive 8-episode series.",
    thumbnailUrl: "/images/featured-movie1.png",
    creatorName: "Guillermo Rauch",
    views: "1.2M",
    likes: "12k",
    episodeCount: 8,
  },
  {
    id: "neon-nights",
    title: "Neon Nights",
    description:
      "In a cyberpunk metropolis where corporations rule, one hacker discovers a conspiracy that could change everything.",
    thumbnailUrl: "/images/featured-movie1.png",
    creatorName: "Sarah Kim",
    views: "890K",
    likes: "8.5k",
    episodeCount: 12,
  },
  {
    id: "neon-nights",
    title: "Neon Nights",
    description:
      "In a cyberpunk metropolis where corporations rule, one hacker discovers a conspiracy that could change everything.",
    thumbnailUrl: "/images/featured-movie1.png",
    creatorName: "Sarah Kim",
    views: "890K",
    likes: "8.5k",
    episodeCount: 12,
  },
];

export const publishedShows = [
  {
    id: "1",
    title: "Point of Impact",
    thumbnailUrl: "/images/movie1.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    genre: "Drama",
    episodeCount: 10,
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "2",
    title: "Last Text",
    thumbnailUrl: "/images/movie2.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "3",
    title: "Second Chance",
    thumbnailUrl: "/images/movie3.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "4",
    title: "Code Black",
    thumbnailUrl: "/images/movie4.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
];
