import { createClient } from '@supabase/supabase-js';
import type { Player } from '../types';

interface Game {
  id?: number; // Facultatif si géré par la base
  date: Date;
  name: string;
  players: Player[];
}

// Initialise le client Supabase uniquement si les variables d'environnement sont disponibles
let supabase: ReturnType<typeof createClient> | null = null;

const initializeSupabase = () => {
  const supabaseUrl = 'https://uhenpkoirvnvrcohxrcc.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        'Les informations de connexion à Supabase sont manquantes. Assurez-vous que les variables d’environnement sont correctement configurées.'
    );
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  return supabase;
};

// Fonction pour enregistrer un jeu dans la base de données
export const saveGame = async (game: Game): Promise<void> => {
  const client = initializeSupabase();

  try {
    const { error } = await client
        .from('games')
        .insert([
          {
            date: game.date.toISOString(),
            name: game.name,
            players: game.players, // Sauvegarde les joueurs
          },
        ]);

    if (error) {
      console.error('Erreur lors de la sauvegarde du jeu :', error);
      throw new Error(`Impossible de sauvegarder le jeu : ${error.message}`);
    }
  } catch (e) {
    console.error('Erreur inattendue lors de la sauvegarde du jeu :', e);
    throw e;
  }
};

// Fonction pour charger les jeux depuis la base de données
// Fonction pour charger les jeux depuis la base de données
export const loadGames = async (): Promise<Game[]> => {
  const client = initializeSupabase();

  try {
    const { data, error } = await client
        .from('games') // Nom de la table
        .select('*'); // Sélectionne toutes les colonnes

    if (error) {
      console.error('Erreur lors du chargement des jeux :', error);
      throw new Error(`Impossible de charger les jeux : ${error.message}`);
    }

    // Assurez-vous de convertir les données au format `Game` attendu
    const games: Game[] = data.map((game: any) => ({
      id: game.id,
      date: new Date(game.date),
      name: game.name,
      players: game.players,
    }));

    return games;
  } catch (e) {
    console.error('Erreur inattendue lors du chargement des jeux :', e);
    throw e;
  }
};
