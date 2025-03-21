export interface User {
  id: string
  name: string
  email: string
  password?: string
  image?: string | null
  role: "USER" | "ADMIN"
  points: number
  rank?: number | null
  createdAt: Date
  updatedAt: Date
  settings?: UserSettings | null
}

export interface UserSettings {
  id?: string
  userId?: string
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    newPollNotifications: boolean
    resultNotifications: boolean
    matchReminders: boolean
    leaderboardUpdates: boolean
    predictionResults: boolean
    systemAnnouncements: boolean
  }
  privacy: {
    showProfilePublicly: boolean
    showPredictionsPublicly: boolean
    showPointsPublicly: boolean
    allowTagging: boolean
  }
  theme: {
    darkMode: boolean
    highContrast: boolean
    reducedMotion: boolean
  }
  language: string
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: Omit<User, "password">
  token: string
}

// Team types
export interface Team {
  id: string
  name: string
  shortName: string
  logo: string
  primaryColor: string
}

// Match types
export type MatchStatus = "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED"

export interface Match {
  id: string
  homeTeamId: string
  homeTeam: Team
  awayTeamId: string
  awayTeam: Team
  date: Date
  venue: string
  homeScore?: number | null
  awayScore?: number | null
  status: MatchStatus
}

// Poll types
export type PollStatus = "ACTIVE" | "CLOSED" | "SETTLED"
export type PollType = "WINNER" | "MOTM" | "SCORE" | "WICKETS" | "CUSTOM"

export interface PollOption {
  id: string
  text: string
  votes?: number
  isCorrect?: boolean
}

export interface Poll {
  id: string
  matchId: string
  team1: string
  team2: string
  date: Date
  venue: string
  pollEndTime: Date
  status: PollStatus
  pollType: PollType
  question: string
  options: PollOption[]
  totalVotes?: number
}

// Vote types
export interface Vote {
  id: string
  userId: string
  pollId: string
  optionId: string
  points: number
  createdAt: Date
  poll?: Poll
  option?: PollOption
}

// Notification types
export type NotificationType =
  | "POLL_CREATED"
  | "POLL_CLOSED"
  | "POLL_SETTLED"
  | "MATCH_REMINDER"
  | "POINTS_AWARDED"
  | "SYSTEM"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: Date
  pollId?: string | null
  matchId?: string | null
}

// Statistics types
export interface PlatformStatistics {
  totalUsers: number
  totalPolls: number
  totalVotes: number
  activePolls: number
  usersJoinedToday: number
  votesToday: number
}

export interface UserStatistics {
  totalVotes: number
  correctPredictions: number
  incorrectPredictions: number
  pendingPredictions: number
  pointsEarned: number
  accuracy: number
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface ApiError {
  error: string
  details?: any
}

// Comment types
export interface Comment {
  id: string
  userId: string
  user: {
    id: string
    name: string
    username?: string
    avatar?: string
  }
  matchId: string
  text: string
  createdAt: Date
  updatedAt: Date
}

// Prediction types
export interface Prediction {
  id: string
  pollId: string
  poll: Poll
  optionId: string
  option: PollOption
  points: number
  createdAt: Date
}

// Search types
export interface SearchResults {
  users: User[]
  teams: Team[]
  matches: Match[]
  polls: Poll[]
}

