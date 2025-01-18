import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Vous pouvez accéder au mode avec 'mode' (par exemple 'development' ou 'production')
  console.log(`Mode actuel: ${mode}`); // Affiche 'development' ou 'production' dans la console

  return {
    plugins: [vue()],
    // Configuration des variables d'environnement
    define: {
      'process.env.MODE': JSON.stringify(mode),
    },
    // Charge les fichiers .env en fonction du mode
    envPrefix: 'VITE_', // Vite ne charge que les variables commençant par VITE_
  };
})
