package com.outergames.omnidex;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LocalAIPlugin")
public class LocalAIPlugin extends Plugin {

    @PluginMethod
    public void checkModelStatus(PluginCall call) {
        System.out.println("LocalAIPlugin: Checking Model Status...");
        // Logica per controllare se i file .task (Gemma) o AICore sono pronti
        JSObject ret = new JSObject();
        boolean isInstalled = getContext().getSharedPreferences("LocalAI", 0).getBoolean("gemma_installed", false);
        
        // In un'app reale qui useresti l'SDK ML Kit per vedere se AICore è pronto
        // boolean isAICoreReady = checkAICoreAvailability();
        
        ret.put("installed", isInstalled);
        ret.put("isAICoreAvailable", false); // Default per ora
        call.resolve(ret);
    }

    @PluginMethod
    public void generateContent(PluginCall call) {
        String prompt = call.getString("prompt");
        System.out.println("LocalAIPlugin: Generating content for prompt: " + prompt);
        
        if (prompt == null) {
            call.reject("Prompt is missing");
            return;
        }

        boolean isInstalled = getContext().getSharedPreferences("LocalAI", 0).getBoolean("gemma_installed", false);
        if (!isInstalled) {
            System.out.println("LocalAIPlugin: Error - Model not installed");
            JSObject errorData = new JSObject();
            errorData.put("code", "MODEL_MISSING");
            call.reject("Model not found on device", "MODEL_MISSING", errorData);
            return;
        }

        // Simuliamo l'inferenza nativa
        JSObject ret = new JSObject();
        ret.put("content", "{\"title\": \"Gioco Local\", \"description\": \"Contenuto generato nativamente dall'IA locale sul dispositivo.\"}");
        call.resolve(ret);
    }
    
    @PluginMethod
    public void setModelInstalled(PluginCall call) {
        getContext().getSharedPreferences("LocalAI", 0).edit().putBoolean("gemma_installed", true).apply();
        call.resolve();
    }
}
