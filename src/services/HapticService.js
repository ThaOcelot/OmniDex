/**
 * HapticService — Wrapper per il feedback aptico nativo (Capacitor).
 * Su browser/desktop il fallback è silenzioso (nessun errore).
 */
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const HapticService = {
  /** Leggero — per tap su elementi secondari */
  async light() {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
  },

  /** Medio — per azioni primarie (condivisione, ecc.) */
  async medium() {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
  },

  /** Successo — feedback positivo (gioco aggiunto, completato) */
  async success() {
    try { await Haptics.notification({ type: NotificationType.Success }); } catch {}
  },

  /** Errore — feedback negativo */
  async error() {
    try { await Haptics.notification({ type: NotificationType.Error }); } catch {}
  },
};

export default HapticService;
