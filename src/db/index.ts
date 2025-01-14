import { createClient } from '@supabase/supabase-js'
import type { Player } from '../types'

interface Game {
  date: Date
  name: string
  players: Player[]
}

// Initialize supabase client only when environment variables are available
let supabase: ReturnType<typeof createClient> | null = null;

const initializeSupabase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Please connect to Supabase using the "Connect to Supabase" button in the top right corner.');
  }
  
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  return supabase;
}

export const saveGame = async (game: Game) => {
  const client = initializeSupabase();
  const { error } = await client
    .from('games')
    .insert([
      {
        date: game.date.toISOString(),
        name: game.name,
        data: game.players
      }
    ])
  
  if (error) throw error
}

export const loadGames = async () => {
  const client = initializeSupabase();
  const { data, error } = await client
    .from('games')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) throw error
  
  return data.map(game => ({
    ...game,
    date: new Date(game.date),
    players: game.data
  }))
}