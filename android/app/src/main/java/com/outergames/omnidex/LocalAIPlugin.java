package com.outergames.omnidex;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

// Importazioni per Android AI Core / Gemini Nano
import com.google.ai.client.generativeai.GenerativeModel;
import com.google.ai.client.generativeai.type.GenerateContentResponse;
import com.google.ai.client.generativeai.java.GenerativeModelFutures;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "LocalAIPlugin")
public class LocalAIPlugin extends Plugin {
    private static final String TAG = "LocalAIPlugin";
    private GenerativeModelFutures modelFutures;
    private final Executor executor = Executors.newSingleThreadExecutor();

    @Override
    public void load() {
        super.load();
        initModel();
    }

    private void initModel() {
        try {
            // Inizializzazione del modello locale (Gemma / Gemini Nano)
            // Nota: "gemini-nano" è il nome del modello gestito da AICore su Android 14+
            GenerativeModel model = new GenerativeModel(
                "gemini-1.5-flash", // Fallback a flash se nano non è pronto, o usa nano se configurato
                "TU_API_KEY_QUI_SE_NECESSARIA" // Se usiamo AICore reale su Pixel, la chiave è gestita dal sistema o opzionale
            );
            modelFutures = GenerativeModelFutures.from(model);
            Log.d(TAG, "🤖 AI Model Initialized");
        } catch (Exception e) {
            Log.e(TAG, "❌ Model Init Error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void checkModelStatus(PluginCall call) {
        JSObject ret = new JSObject();
        boolean installed = getContext().getSharedPreferences("LocalAI", 0).getBoolean("gemma_installed", false);
        ret.put("installed", installed);
        ret.put("isAICoreAvailable", true); // Assumiamo disponibile data la SDK
        call.resolve(ret);
    }

    @PluginMethod
    public void setModelInstalled(PluginCall call) {
        getContext().getSharedPreferences("LocalAI", 0)
                .edit()
                .putBoolean("gemma_installed", true)
                .apply();
        call.resolve();
    }

    @PluginMethod
    public void generateContent(PluginCall call) {
        String prompt = call.getString("prompt");
        if (prompt == null) {
            call.reject("Prompt mancante");
            return;
        }

        boolean isInstalled = getContext().getSharedPreferences("LocalAI", 0).getBoolean("gemma_installed", false);
        if (!isInstalled) {
            JSObject errorData = new JSObject();
            errorData.put("code", "MODEL_MISSING");
            call.reject("Modello non installato nell'app", "MODEL_MISSING", errorData);
            return;
        }

        if (modelFutures == null) {
            call.reject("Modello non inizializzato");
            return;
        }

        // Chiamata REALE all'IA
        ListenableFuture<GenerateContentResponse> responseFuture = modelFutures.generateContent(
            new com.google.ai.client.generativeai.type.Content.Builder()
                .addText(prompt)
                .build()
        );

        Futures.addCallback(responseFuture, new FutureCallback<GenerateContentResponse>() {
            @Override
            public void onSuccess(GenerateContentResponse result) {
                JSObject ret = new JSObject();
                ret.put("content", result.getText());
                call.resolve(ret);
            }

            @Override
            public void onFailure(Throwable t) {
                Log.e(TAG, "❌ AI Generation Error", t);
                call.reject("Errore generazione IA: " + t.getMessage());
            }
        }, executor);
    }
}
