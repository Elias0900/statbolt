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
  const supabaseUrl = 'https://uhenpkoirvnvrcohxrcc.supabase.co'
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

  // Requête à la base de données
  const { data, error } = await client
      .from('games')
      .select('*')
      .order('date', { ascending: false });

  // Gestion des erreurs
  if (error) {
    console.error('Erreur lors de la récupération des jeux :', error);
    throw error;
  }

  // Transformation des données
  return data.map(game => ({
    ...game,
    date: new Date(game.date), // Convertit la date string en objet Date
    players: game.players || [] // Assure que "players" est bien mappé
  }));
};
