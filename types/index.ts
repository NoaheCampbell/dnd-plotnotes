export interface Campaign {
  id: number
  title: string
  description: string | null
  image_url: string | null
  progress: number | null
  sessions_count: number | null
  players_count: number | null
  last_played: Date | null
  created_at: Date
  active: boolean
} 