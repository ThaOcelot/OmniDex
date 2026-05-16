import { registerPlugin } from '@capacitor/core';
const LocalAIPlugin = registerPlugin('LocalAIPlugin');

class TextEnhancer {
  async enhance(prompt) {
    try {
      const { content } = await LocalAIPlugin.generateContent({ 
        prompt: `RISPONDI SOLO IN LINGUA ITALIANA. MAI USARE RUSSO O CIRILLICO.
        PROMPT: ${prompt.substring(0, 500)}` 
      });
      return content?.trim() || null;
    } catch (e) {
      console.warn("🤖 AI Error:", e);
      return null;
    }
  }

  async translateDescription(text) {
    return this.enhance(`Traduci in modo epico: ${text}`);
  }

  async generatePlot(name, wikiContext) {
    return this.enhance(`Scrivi trama monumentale per ${name}. Info: ${wikiContext}`);
  }

  async generateGameplay(name) {
    return this.enhance(`Descrivi gameplay monumentale per ${name}`);
  }
}

export default new TextEnhancer();
