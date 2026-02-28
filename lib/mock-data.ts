export interface User {
  id: string
  name: string
  username: string
  avatar: string
  bio?: string
  followers: number
  following: number
  isFollowing?: boolean
  isOnline?: boolean
}

export interface Post {
  id: string
  author: User
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
}

export interface Story {
  id: string
  user: User
  hasNew: boolean
}

export interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "mention"
  user: User
  content: string
  createdAt: string
  isRead: boolean
  postImage?: string
}

export interface Message {
  id: string
  user: User
  lastMessage: string
  createdAt: string
  unread: number
}

export const currentUser: User = {
  id: "me",
  name: "Minh Tran",
  username: "minhtran",
  avatar: "/images/avatar-1.jpg",
  bio: "Full-stack developer | Photography enthusiast | Coffee addict",
  followers: 1248,
  following: 532,
  isOnline: true,
}

export const users: User[] = [
  {
    id: "1",
    name: "Linh Nguyen",
    username: "linhnguyen",
    avatar: "/images/avatar-2.jpg",
    bio: "Graphic Designer | Dreamer",
    followers: 3420,
    following: 189,
    isFollowing: true,
    isOnline: true,
  },
  {
    id: "2",
    name: "Duc Pham",
    username: "ducpham",
    avatar: "/images/avatar-3.jpg",
    bio: "Travel blogger | 30 countries and counting",
    followers: 12500,
    following: 423,
    isFollowing: false,
    isOnline: false,
  },
  {
    id: "3",
    name: "Hoa Le",
    username: "hoale",
    avatar: "/images/avatar-4.jpg",
    bio: "Foodie | Startup founder",
    followers: 8900,
    following: 312,
    isFollowing: true,
    isOnline: true,
  },
  {
    id: "4",
    name: "Khanh Vu",
    username: "khanhvu",
    avatar: "/images/avatar-1.jpg",
    bio: "Music producer | Night owl",
    followers: 5600,
    following: 278,
    isFollowing: false,
    isOnline: false,
  },
  {
    id: "5",
    name: "Mai Tran",
    username: "maitran",
    avatar: "/images/avatar-2.jpg",
    bio: "Yoga instructor | Wellness advocate",
    followers: 9200,
    following: 645,
    isFollowing: true,
    isOnline: true,
  },
]

export const posts: Post[] = [
  {
    id: "p1",
    author: users[0],
    content: "Just captured this amazing sunset at the beach today. Nature never fails to inspire me.",
    image: "/images/post-1.jpg",
    likes: 284,
    comments: 42,
    shares: 18,
    isLiked: true,
    isBookmarked: false,
    createdAt: "2h ago",
  },
  {
    id: "p2",
    author: users[2],
    content: "Found the perfect coffee spot for remote working. The latte art here is on another level!",
    image: "/images/post-2.jpg",
    likes: 156,
    comments: 23,
    shares: 7,
    isLiked: false,
    isBookmarked: true,
    createdAt: "4h ago",
  },
  {
    id: "p3",
    author: users[1],
    content: "Weekend hiking with the crew. Nothing beats getting lost in nature with good company. The view from the top was absolutely breathtaking.",
    image: "/images/post-3.jpg",
    likes: 432,
    comments: 67,
    shares: 29,
    isLiked: false,
    isBookmarked: false,
    createdAt: "6h ago",
  },
  {
    id: "p4",
    author: users[3],
    content: "Just finished my latest track after 3 weeks of production. Can't wait to share it with everyone. Music is the universal language that connects us all.",
    likes: 89,
    comments: 15,
    shares: 4,
    isLiked: true,
    isBookmarked: false,
    createdAt: "8h ago",
  },
  {
    id: "p5",
    author: users[4],
    content: "Morning yoga session by the river. Starting the day with gratitude and mindfulness. Remember to take a moment for yourself today.",
    likes: 312,
    comments: 34,
    shares: 21,
    isLiked: false,
    isBookmarked: true,
    createdAt: "12h ago",
  },
]

export const stories: Story[] = [
  { id: "s1", user: currentUser, hasNew: false },
  { id: "s2", user: users[0], hasNew: true },
  { id: "s3", user: users[1], hasNew: true },
  { id: "s4", user: users[2], hasNew: true },
  { id: "s5", user: users[3], hasNew: false },
  { id: "s6", user: users[4], hasNew: true },
]

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "like",
    user: users[0],
    content: "liked your post",
    createdAt: "2m ago",
    isRead: false,
    postImage: "/images/post-1.jpg",
  },
  {
    id: "n2",
    type: "follow",
    user: users[1],
    content: "started following you",
    createdAt: "15m ago",
    isRead: false,
  },
  {
    id: "n3",
    type: "comment",
    user: users[2],
    content: "commented on your post: \"This is incredible!\"",
    createdAt: "1h ago",
    isRead: true,
    postImage: "/images/post-2.jpg",
  },
  {
    id: "n4",
    type: "mention",
    user: users[3],
    content: "mentioned you in a comment",
    createdAt: "3h ago",
    isRead: true,
  },
  {
    id: "n5",
    type: "like",
    user: users[4],
    content: "liked your photo",
    createdAt: "5h ago",
    isRead: true,
    postImage: "/images/post-3.jpg",
  },
  {
    id: "n6",
    type: "follow",
    user: users[0],
    content: "started following you",
    createdAt: "1d ago",
    isRead: true,
  },
]

export const messages: Message[] = [
  {
    id: "m1",
    user: users[0],
    lastMessage: "Hey! Are you coming to the event tonight?",
    createdAt: "5m ago",
    unread: 2,
  },
  {
    id: "m2",
    user: users[2],
    lastMessage: "Check out this new restaurant I found!",
    createdAt: "30m ago",
    unread: 1,
  },
  {
    id: "m3",
    user: users[1],
    lastMessage: "The hiking photos turned out amazing",
    createdAt: "2h ago",
    unread: 0,
  },
  {
    id: "m4",
    user: users[3],
    lastMessage: "Let me know what you think of the track",
    createdAt: "4h ago",
    unread: 0,
  },
  {
    id: "m5",
    user: users[4],
    lastMessage: "See you at the yoga class tomorrow!",
    createdAt: "1d ago",
    unread: 0,
  },
]

export const trendingTopics = [
  { tag: "#Photography", posts: "12.5K posts" },
  { tag: "#TravelVietnam", posts: "8.3K posts" },
  { tag: "#CoffeeLovers", posts: "6.7K posts" },
  { tag: "#TechStartup", posts: "5.1K posts" },
  { tag: "#FoodieLife", posts: "4.9K posts" },
]
