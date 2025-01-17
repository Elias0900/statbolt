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
export const loadGames = async (): Promise<Game[]> => {
  const client = initializeSupabase();

  try {
    const { data, error } = await client
        .from('games')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des jeux :', error);
      throw new Error(`Impossible de charger les jeux : ${error.message}`);
    }

    if (!data || !Array.isArray(data)) {
      throw new Error('Les données récupérées sont invalides ou mal formatées.');
    }

    // Transformation des données
    return data.map((game: any) => {
      if (typeof game.date !== 'string' && !(game.date instanceof Date)) {
        throw new Error(`Date invalide pour le jeu avec ID ${game.id}`);
      }

      return {
        id: game.id as number, // Force le type à `number`
        date: new Date(game.date), // Convertit en objet Date
        name: game.name || 'Nom inconnu', // Fournit une valeur par défaut
        players: Array.isArray(game.players) ? game.players : [], // Vérifie que players est un tableau
      };
    });
  } catch (e) {
    console.error('Erreur inattendue lors du chargement des jeux :', e);
    throw e;
  }
};