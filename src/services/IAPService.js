class IAPService {
  constructor() {
    this.PRODUCT_PRO = 'omnidex_pro_remove_ads';
    // Acquisto singolo legacy (mantenuto per retrocompatibilità)
    this.PRODUCT_ULTRA = 'omnidex_ultra_ai';
    // Nuovi abbonamenti Ultra
    this.PRODUCT_ULTRA_MONTHLY = 'omnidex_ultra_monthly';
    this.PRODUCT_ULTRA_YEARLY = 'omnidex_ultra_yearly';
    this.listeners = [];
    this.store = null;
    this._storeReadyResolve = null;
    this._storeReady = new Promise((resolve) => { this._storeReadyResolve = resolve; });
    
    // Migrazione vecchi utenti
    const legacyPro = localStorage.getItem('user_is_pro') === 'true';
    let savedTier = localStorage.getItem('user_tier');
    if (!savedTier && legacyPro) savedTier = 'pro';
    
    this.tier = savedTier || 'free'; // 'free', 'pro', 'ultra'
  }

  /**
   * Registra un callback per ricevere aggiornamenti sullo stato Pro
   */
  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.tier);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notifica tutti i sottoscrittori
   */
  notify() {
    this.listeners.forEach(callback => {
      try {
        callback(this.tier);
      } catch (e) {
        console.error("❌ IAP subscriber error:", e);
      }
    });
    // Emette evento globale
    window.dispatchEvent(new CustomEvent('tier-status-changed', { detail: this.tier }));
  }

  /**
   * Inizializza lo store nativo (se su piattaforma mobile) o la simulazione (se su browser)
   * Gestisce in modo robusto la race-condition attendendo il caricamento di cordova (deviceready)
   */
  init() {
    try {
      const isNative = window.Capacitor?.isNativePlatform?.();

      if (!isNative) {
        console.log("💰 [IAP] Web Browser: inizializzazione simulazione acquisti.");
        return;
      }

      // Funzione interna per configurare ed avviare lo store nativo
      const configureStore = () => {
        if (!window.CdvPurchase) {
          console.warn("💰 [IAP] configureStore invocato ma window.CdvPurchase è undefined.");
          return;
        }

        const { store, ProductType, Platform } = window.CdvPurchase;
        this.store = store;
        
        console.log("💰 [IAP] Native Platform: inizializzazione dello Store Billing v13.");

        // Configura la registrazione dei prodotti
        this.store.register([{
          id: this.PRODUCT_PRO,
          type: ProductType.NON_CONSUMABLE,
        }, {
          // Legacy: acquisto singolo Ultra (per chi l'ha già comprato)
          id: this.PRODUCT_ULTRA,
          type: ProductType.NON_CONSUMABLE,
        }, {
          // Nuovo abbonamento mensile Ultra
          id: this.PRODUCT_ULTRA_MONTHLY,
          type: ProductType.PAID_SUBSCRIPTION,
        }, {
          // Nuovo abbonamento annuale Ultra
          id: this.PRODUCT_ULTRA_YEARLY,
          type: ProductType.PAID_SUBSCRIPTION,
        }]);

        // Gestisce gli aggiornamenti del prodotto
        this.store.when()
          .approved((transaction) => {
            console.log("💰 [IAP] Transazione approvata:", transaction);
            // Finalizza la transazione nativa
            transaction.verify();
          })
          .verified((receipt) => {
            console.log("💰 [IAP] Ricevuta verificata/processata.");
            receipt.finish();
          })
          .finished((transaction) => {
            console.log("💰 [IAP] Transazione completata:", transaction.products[0].id);
            const pid = transaction.products[0].id;
            if (pid === this.PRODUCT_ULTRA || pid === this.PRODUCT_ULTRA_MONTHLY || pid === this.PRODUCT_ULTRA_YEARLY) {
              this.setTier('ultra');
            } else if (pid === this.PRODUCT_PRO && this.tier !== 'ultra') {
              this.setTier('pro');
            }
          })
          .updated((product) => {
            const pid = product.id;
            const isUltraProduct = pid === this.PRODUCT_ULTRA || pid === this.PRODUCT_ULTRA_MONTHLY || pid === this.PRODUCT_ULTRA_YEARLY;
            
            if (product.owned) {
              console.log(`💰 [IAP] Prodotto attivo: ${pid}`);
              if (isUltraProduct) {
                this.setTier('ultra');
              } else if (pid === this.PRODUCT_PRO && this.tier !== 'ultra') {
                this.setTier('pro');
              }
            } else if (isUltraProduct && product.type === 'paid subscription') {
              // Abbonamento Ultra scaduto o annullato
              const hasLegacyUltra = this.store.get(this.PRODUCT_ULTRA)?.owned;
              if (!hasLegacyUltra && this.tier === 'ultra') {
                console.log('💰 [IAP] Abbonamento Ultra scaduto. Downgrade a Free.');
                this.setTier('free');
              }
            }
          });

        // Gestisce gli errori di transazione
        this.store.error((error) => {
          console.error("💰 [IAP] Store error:", error);
        });

        // Marca lo store come pronto quando il catalogo prodotti è caricato
        this.store.ready(() => {
          console.log("💰 [IAP] Store pronto! Prodotti disponibili:", this.store.products.map(p => p.id));
          if (this._storeReadyResolve) {
            this._storeReadyResolve();
            this._storeReadyResolve = null;
          }
        });

        // Inizializza lo store per la piattaforma Google Play
        this.store.initialize([Platform.GOOGLE_PLAY]);
      };

      // Risolve la race condition: se CdvPurchase non è ancora stato iniettato, attendiamo 'deviceready'
      if (window.CdvPurchase) {
        configureStore();
      } else {
        console.log("💰 [IAP] In attesa dell'evento 'deviceready' per caricare CdvPurchase...");
        document.addEventListener('deviceready', () => {
          console.log("💰 [IAP] Ricevuto evento 'deviceready'. Inizializzazione dello store.");
          configureStore();
        }, { once: true });
      }
    } catch (e) {
      console.error("❌ [IAP] Errore critico durante l'inizializzazione di CdvPurchase:", e);
    }
  }

  /**
   * Cambia lo stato del tier e notifica l'applicazione
   */
  setTier(newTier) {
    this.tier = newTier;
    localStorage.setItem('user_tier', newTier);
    this.notify();
  }

  getTier() {
    return this.tier;
  }
  
  isPro() {
    return this.tier === 'pro' || this.tier === 'ultra';
  }

  isUltra() {
    return this.tier === 'ultra';
  }

  /**
   * Avvia l'acquisto di un prodotto
   * @param {string} tierType - 'pro' | 'ultra_monthly' | 'ultra_yearly'
   */
  async purchaseTier(tierType) {
    const isNative = window.Capacitor?.isNativePlatform?.();
    let productId;
    if (tierType === 'ultra_monthly') productId = this.PRODUCT_ULTRA_MONTHLY;
    else if (tierType === 'ultra_yearly') productId = this.PRODUCT_ULTRA_YEARLY;
    else if (tierType === 'pro') productId = this.PRODUCT_PRO;
    else productId = this.PRODUCT_ULTRA_MONTHLY; // default

    if (!isNative) {
      // Flusso di simulazione Web bloccato: d'ora in poi solo gli abbonati sull'app nativa possono salire di tier
      alert("L'acquisto di abbonamenti e versioni Pro è disponibile solo sull'app mobile ufficiale.");
      return false;
    }

    // Flusso nativo Google Play Store v13
    if (this.store) {
      try {
        console.log(`💰 [IAP] In attesa che lo store sia pronto per ordinare: ${productId}`);
        // Aspetta che lo store abbia caricato il catalogo prima di procedere
        await Promise.race([
          this._storeReady,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Store timeout dopo 10 secondi')), 10000))
        ]);

        console.log(`💰 [IAP] Ordinazione prodotto nativo: ${productId}`);
        const product = this.store.get(productId);
        const offer = product?.getOffer();
        
        if (offer) {
          this.store.order(offer);
          return true;
        } else if (product) {
          this.store.order(product);
          return true;
        } else {
          const errorMsg = `Prodotto '${productId}' non trovato sul Play Store. Assicurati che l'In-App Purchase sia attivo e configurato sulla console Google Play per questo pacchetto.`;
          console.error("💰 [IAP]", errorMsg);
          alert("⚠️ Errore: " + errorMsg);
          return false;
        }
      } catch (err) {
        const errorMsg = "Impossibile avviare il pagamento: " + err.message;
        console.error("💰 [IAP]", errorMsg, err);
        alert("⚠️ Errore: " + errorMsg);
        return false;
      }
    } else {
      const errorMsg = "Lo store dei pagamenti non è ancora pronto. Se hai appena aperto l'app, riprova tra 5 secondi.";
      console.warn("💰 [IAP]", errorMsg);
      alert("ℹ️ " + errorMsg);
      return false;
    }
  }

  /**
   * Apre la schermata di gestione abbonamenti di Google Play
   */
  async manageSubscription() {
    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) {
      alert('Gestione abbonamento disponibile solo sull\'app Android.');
      return;
    }
    try {
      const { App } = await import('@capacitor/app');
      await App.openAppSettings();
    } catch (e) {
      console.warn('💰 [IAP] Impossibile aprire gestione abbonamenti:', e);
    }
  }

  /**
   * Ripristina gli acquisti effettuati in precedenza (Richiesto da Google)
   */
  async restorePurchases() {
    const isNative = window.Capacitor?.isNativePlatform?.();

    if (!isNative) {
      console.log("💰 [IAP] Simulazione ripristino acquisti.");
      alert("✅ [Test] Acquisti simulati ripristinati con successo!");
      return true;
    }

    if (this.store) {
      try {
        console.log("💰 [IAP] Richiesta ripristino acquisti nativi.");
        await this.store.restore();
        alert("ℹ️ Richiesta inviata. Se possiedi già la versione Pro sul tuo account Google Play, la pubblicità verrà disattivata a breve.");
        return true;
      } catch (err) {
        const errorMsg = "Errore durante il ripristino degli acquisti: " + err.message;
        console.error("💰 [IAP]", errorMsg);
        alert("⚠️ Errore: " + errorMsg);
        return false;
      }
    } else {
      alert("⚠️ Lo store dei pagamenti non è pronto.");
      return false;
    }
  }

  // ======================================
  // Tracciamento AI Daily Limits (Free Tier)
  // ======================================
  getDailyAiCount() {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('ai_usage_date');
    if (saved !== today) {
      // Nuovo giorno, reset counter e token extra
      localStorage.setItem('ai_usage_date', today);
      localStorage.setItem('ai_usage_count', '0');
      localStorage.setItem('extra_ai_tokens', '0');
      return 0;
    }
    return parseInt(localStorage.getItem('ai_usage_count') || '0', 10);
  }

  incrementDailyAiCount() {
    const count = this.getDailyAiCount();
    localStorage.setItem('ai_usage_count', (count + 1).toString());
    // Trigger un evento per aggiornare l'interfaccia (es. disabilitare la barra)
    window.dispatchEvent(new CustomEvent('ai-usage-updated'));
    return count + 1;
  }
  
  getExtraAiTokens() {
    return parseInt(localStorage.getItem('extra_ai_tokens') || '0', 10);
  }

  addExtraAiToken() {
    const extra = this.getExtraAiTokens();
    localStorage.setItem('extra_ai_tokens', (extra + 1).toString());
    // Emette un evento globale in modo che la UI sappia che c'è un token in più
    window.dispatchEvent(new CustomEvent('ai-usage-updated'));
  }

  hasReachedAiLimit() {
    if (this.isUltra()) return this.getDailyAiCount() >= 50; // Ultra: 50 analisi/giorno
    if (this.isPro()) return false;                           // Pro: illimitato
    const limit = 10 + this.getExtraAiTokens();              // Free: 10/giorno + extra
    return this.getDailyAiCount() >= limit;
  }

  /**
   * Debug helper: Reimposta lo stato a Gratis (per scopi di test)
   */
  resetToFree() {
    this.setTier('free');
    localStorage.setItem('ai_usage_count', '0');
    console.log("💰 [IAP] Stato resettato a Versione Gratuita.");
  }
}

export default new IAPService();
