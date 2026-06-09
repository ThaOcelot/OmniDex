import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';
import { Keyboard } from '@capacitor/keyboard';
import IAPService from './IAPService';

class AdService {
  constructor() {
    this.initialized = false;
    this.bannerVisible = false;
    
    // ID blocchi di test AdMob di Google (Android)
    this.BANNER_AD_ID = 'ca-app-pub-3940256099942544/6300978111';
    this.INTERSTITIAL_AD_ID = 'ca-app-pub-3940256099942544/1033173712';
    this.REWARDED_AD_ID = 'ca-app-pub-3940256099942544/5224354917';

    // Ascolta quando l'utente passa a Pro per nascondere i banner immediatamente
    window.addEventListener('pro-status-changed', (e) => {
      const isPro = e.detail;
      if (isPro) {
        this.hideBanner();
        console.log("📢 [AdService] Utente passato a PRO. Annunci rimossi permanentemente.");
      }
    });

    const isNative = window.Capacitor?.isNativePlatform?.();
    if (isNative) {
      Keyboard.addListener('keyboardWillShow', () => {
        if (this.bannerVisible && !IAPService.isPro()) {
          AdMob.hideBanner().catch(console.error);
        }
      });
      Keyboard.addListener('keyboardDidHide', () => {
        if (this.bannerVisible && !IAPService.isPro()) {
          AdMob.resumeBanner().catch(console.error);
        }
      });
    }
  }

  /**
   * Inizializza AdMob nativo
   */
  async init() {
    if (IAPService.isPro()) {
      console.log("📢 [AdService] Inizializzazione saltata: l'utente è PRO.");
      return;
    }

    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) {
      this.initialized = true;
      console.log("📢 [AdService] Web Browser: inizializzazione mockup pubblicità.");
      return;
    }

    try {
      if (this.initialized) return;
      
      // Inizializza l'SDK AdMob nativo
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: []
      });

      this.initialized = true;
      console.log("📢 [AdService] AdMob nativo inizializzato con successo.");
    } catch (e) {
      console.error("📢 [AdService] Errore inizializzazione AdMob nativo:", e);
    }
  }

  /**
   * Mostra il banner pubblicitario in fondo allo schermo
   */
  async showBanner() {
    if (IAPService.isPro()) return;
    if (!this.initialized) await this.init();

    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) {
      this.bannerVisible = true;
      // Innesca evento custom per informare il componente React AdBanner di mostrare il mockup
      window.dispatchEvent(new CustomEvent('ad-banner-visibility', { detail: true }));
      console.log("📢 [AdService] Mostrato mockup banner AdMob.");
      return;
    }

    try {
      if (this.bannerVisible) return;

      const options = {
        adId: this.BANNER_AD_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true // Forza gli annunci di test per sviluppo sicuro
      };

      // Ascolta la dimensione effettiva del banner per comunicarla al layout React
      await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
        const height = info?.height || 60;
        window.dispatchEvent(new CustomEvent('ad-banner-height', { detail: height }));
        console.log(`📢 [AdService] Banner height: ${height}px`);
      });

      await AdMob.showBanner(options);
      this.bannerVisible = true;
      console.log("📢 [AdService] Banner nativo AdMob mostrato.");
    } catch (e) {
      console.error("📢 [AdService] Errore nel caricamento del banner nativo:", e);
    }
  }

  /**
   * Nasconde e distrugge il banner pubblicitario
   */
  async hideBanner() {
    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) {
      this.bannerVisible = false;
      window.dispatchEvent(new CustomEvent('ad-banner-visibility', { detail: false }));
      return;
    }

    try {
      if (!this.bannerVisible) return;
      await AdMob.removeBanner();
      this.bannerVisible = false;
      console.log("📢 [AdService] Banner nativo AdMob rimosso.");
    } catch (e) {
      console.error("📢 [AdService] Errore nel rimuovere il banner nativo:", e);
    }
  }

  /**
   * Mostra un annuncio Interstitial (pop-up a tutto schermo)
   * Tipicamente da mostrare al completamento di un quiz o di un'azione significativa.
   */
  async showInterstitial() {
    if (IAPService.isPro()) return;
    if (!this.initialized) await this.init();

    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) {
      console.log("📢 [AdService] Simulazione Annuncio Interstitial (Fullscreen pop-up).");
      return;
    }

    try {
      // Carica l'interstitial
      await AdMob.prepareInterstitial({
        adId: this.INTERSTITIAL_AD_ID,
        isTesting: true
      });

      // Mostra l'interstitial caricato
      await AdMob.showInterstitial();
      console.log("📢 [AdService] Annuncio Interstitial mostrato.");
    } catch (e) {
      console.error("📢 [AdService] Errore nel caricare/mostrare l'Interstitial:", e);
    }
  }

  /**
   * Mostra un annuncio con premio (Rewarded Video)
   * Usato per far guadagnare all'utente Free crediti AI aggiuntivi.
   */
  async showRewardedAd(onRewarded, onFailed) {
    if (!this.initialized) await this.init();

    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) {
      console.log("📢 [AdService] Simulazione Annuncio Rewarded.");
      // Simula il tempo di visione e poi eroga il premio
      setTimeout(() => {
        if (onRewarded) onRewarded();
      }, 2000);
      return;
    }

    try {
      await AdMob.prepareRewardVideoAd({
        adId: this.REWARDED_AD_ID,
        isTesting: true // Mantieni a true finché non vai in produzione!
      });

      let rewardGiven = false;

      // Ascolta il completamento dell'annuncio
      const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem) => {
        console.log("📢 [AdService] Utente premiato!", rewardItem);
        rewardGiven = true;
        if (onRewarded) onRewarded();
      });

      // Ascolta la chiusura dell'annuncio per capire se ha completato la visione
      const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        if (!rewardGiven && onFailed) {
          console.log("📢 [AdService] Utente ha chiuso l'annuncio prima di ricevere il premio.");
          onFailed("Hai chiuso l'annuncio prima di ricevere il premio.");
        }
        rewardListener.remove();
        dismissListener.remove();
      });

      await AdMob.showRewardVideoAd();
      console.log("📢 [AdService] Annuncio Rewarded mostrato.");
    } catch (e) {
      console.error("📢 [AdService] Errore nel caricare/mostrare il Rewarded Ad:", e);
      if (onFailed) onFailed("Impossibile caricare il video al momento. Riprova più tardi.");
    }
  }
}

export default new AdService();
