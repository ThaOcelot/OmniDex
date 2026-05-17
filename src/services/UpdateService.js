/**
 * UpdateService — Controlla se è disponibile una nuova versione su GitHub Pages.
 *
 * Meccanismo:
 * - Ad ogni deploy, GitHub Actions scrive public/version.json con buildTime e commit.
 * - Al lancio dell'app, fetchinamo questo file (senza cache) e confrontiamo il
 *   buildTime con quello salvato in localStorage.
 * - Se diverso → nuova versione disponibile.
 * - Quando l'utente conferma l'aggiornamento, ricarichiamo la pagina (forza il
 *   WebView a scaricare l'ultima build da GitHub Pages).
 */

const VERSION_URL = 'https://thaocelot.github.io/OmniDex/version.json';
const STORED_BUILD_KEY = 'omnidex_last_build_time';

class UpdateService {
  /**
   * Recupera le info di versione dal server remoto.
   * Usa cache-busting con timestamp per evitare risposte stantie.
   */
  async fetchRemoteVersion() {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  /**
   * Controlla se è disponibile un aggiornamento.
   * Ritorna { hasUpdate, buildTime, commit, isFirstRun } oppure { hasUpdate: false }.
   */
  async checkForUpdate() {
    try {
      const remote = await this.fetchRemoteVersion();

      // In sviluppo locale (version = 'local') non mostrare aggiornamenti
      if (!remote?.buildTime || remote.version === 'local') {
        return { hasUpdate: false };
      }

      const stored = localStorage.getItem(STORED_BUILD_KEY);

      if (!stored) {
        // Prima esecuzione: salva la versione corrente silenziosamente
        localStorage.setItem(STORED_BUILD_KEY, remote.buildTime);
        return { hasUpdate: false, isFirstRun: true };
      }

      if (remote.buildTime !== stored) {
        return {
          hasUpdate: true,
          buildTime: remote.buildTime,
          commit: remote.commit || '',
          version: remote.version || ''
        };
      }

      return { hasUpdate: false };
    } catch (e) {
      console.warn('🔄 Update check failed:', e.message);
      return { hasUpdate: false };
    }
  }

  /**
   * Conferma e applica l'aggiornamento:
   * salva il nuovo buildTime e forza il reload per scaricare la nuova build.
   */
  applyUpdate(buildTime) {
    if (buildTime) {
      localStorage.setItem(STORED_BUILD_KEY, buildTime);
    }
    window.location.reload(true);
  }

  /**
   * Segna la versione corrente come vista (per "Più tardi").
   */
  dismissUpdate(buildTime) {
    if (buildTime) {
      localStorage.setItem(STORED_BUILD_KEY, buildTime);
    }
  }

  /**
   * Restituisce il buildTime attualmente salvato in locale.
   */
  getStoredVersion() {
    return localStorage.getItem(STORED_BUILD_KEY) || null;
  }
}

export default new UpdateService();
