import ShowDetails from "@/components/dashboard/watch/ShowDetails";

// Mock data 
const mockShowData = {
  id: "quantum-dreams",
  title: "Quantum Dreams: Genesis",
  description:
    "A mind-bending journey through parallel realities. Join the creator as they explore the boundaries between consciousness and digital existence in this exclusive 8-episode series.",
  fullDescription:
    "In 2045, Earth receives its first extraterrestrial transmission. Dr. Maya Foster leads a covert team to unravel the cryptic patterns hidden within the signal, only to discover that some messages are better left unread. A mind-bending journey through parallel realities. Join the creator as they explore the boundaries between consciousness and digital existence in this exclusive 8-episode series. As the team delves deeper into the mystery, they uncover connections between the transmission and ancient artifacts found across the globe, suggesting that humanity's first contact may not be with aliens, but with a future version of ourselves.",
  bannerUrl: "/images/featured-movie1.png",
  genres: ["Sci-fi", "Thriller"],
  creator: {
    id: "alex-chen",
    name: "Alex Chen",
    avatarUrl: "/images/alex-chen.svg",
    bio: "Award-winning sci-fi creator with 5+ years of storytelling experience",
    followers: "52k",
    views: "2.5M",
    pixEarned: "200k",
    socials: {
      instagram: "https://instagram.com/alexchen",
      twitter: "https://twitter.com/alexchen",
      youtube: "https://youtube.com/@alexchen",
      tiktok: "https://tiktok.com/@alexchen",
    },
  },
  stats: {
    views: "1.2M",
    likes: "1.2M",
    comments: "1.2M",
    episodes: "8",
    pixEarned: "1.2M",
  },
  episodes: [
    {
      id: "ep-1",
      number: 1,
      title: "First Contact",
      description:
        "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
      thumbnailUrl: "/images/movie1.png",
      duration: "15m",
      views: "1.2k Views",
      uploadedAt: "1 week ago",
      earnAmount: "20 $PIX",
      progress: 100,
    },
    {
      id: "ep-2",
      number: 2,
      title: "First Contact",
      description:
        "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
        thumbnailUrl: "/images/movie1.png",
      duration: "15m",
      views: "1.2k Views",
      uploadedAt: "1 week ago",
      earnAmount: "20 $PIX",
      progress: 60,
    },
    {
      id: "ep-3",
      number: 3,
      title: "First Contact",
      description:
        "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
        thumbnailUrl: "/images/movie1.png",
      duration: "15m",
      views: "1.2k Views",
      uploadedAt: "1 week ago",
      earnAmount: "20 $PIX",
      progress: 30,
    },
    {
      id: "ep-4",
      number: 4,
      title: "First Contact",
      description:
        "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
        thumbnailUrl: "/images/movie1.png",
      duration: "15m",
      views: "1.2k Views",
      uploadedAt: "1 week ago",
      earnAmount: "20 $PIX",
      progress: 0,
    },
    {
      id: "ep-5",
      number: 5,
      title: "First Contact",
      description:
        "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
        thumbnailUrl: "/images/movie1.png",
      duration: "15m",
      views: "1.2k Views",
      uploadedAt: "1 week ago",
      earnAmount: "20 $PIX",
      progress: 0,
      isLocked: true,
    },
  ],
  userProgress: {
    episodesWatched: 7,
    totalEpisodes: 10,
    totalEarned: "240 $PIX",
    nextReward: "Unlock Episode 4",
  },
  comments: [
    {
      id: "c1",
      author: {
        name: "Alex Chen",
        avatarUrl: "/images/alex-chen.svg",
        isTopFan: true,
      },
      content:
        "The plot twist in Episode 3 was absolutely mind-blowing! Can't wait to see what happens next 🔥",
      likes: 180,
      timestamp: "5h ago",
    },
    {
      id: "c2",
      author: {
        name: "Alex Chen",
        avatarUrl: "/images/alex-chen.svg",
        isTopFan: true,
      },
      content:
        "The plot twist in Episode 3 was absolutely mind-blowing! Can't wait to see what happens next 🔥",
      likes: 180,
      timestamp: "5h ago",
    },
    {
      id: "c3",
      author: {
        name: "Alex Chen",
        avatarUrl: "/images/alex-chen.svg",
        isTopFan: true,
      },
      content:
        "The plot twist in Episode 3 was absolutely mind-blowing! Can't wait to see what happens next 🔥",
      likes: 180,
      timestamp: "5h ago",
    },
  ],
  otherShows: [
    {
      id: "1",
      title: "Point of Impact",
      thumbnailUrl: "/images/movie4.png",
      creatorName: "Alex Chen",
      views: "1.2M",
      likes: "1.2M",
      genre: "Drama",
      episodeCount: 10,
      description:
        "Six years ago, Regina chose to break up with her boyfriend Julian to avoid...",
    },
    {
      id: "2",
      title: "Last Text",
      thumbnailUrl: "/images/movie3.png",
      creatorName: "Alex Chen",
      views: "1.2M",
      likes: "1.2M",
    },
    {
      id: "3",
      title: "Second Chance",
      thumbnailUrl: "/images/movie2.png",
      creatorName: "Alex Chen",
      views: "1.2M",
      likes: "1.2M",
    },
    {
      id: "4",
      title: "Code Black",
      thumbnailUrl: "/images/movie5.png",
      creatorName: "Alex Chen",
      views: "1.2M",
      likes: "1.2M",
    },
  ],
};

export default function ShowDetailsPage() {
  return <ShowDetails show={mockShowData} />;
}