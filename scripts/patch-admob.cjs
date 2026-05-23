const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'node_modules', '@capacitor-community', 'admob', 'android', 'build.gradle');

try {
  if (fs.existsSync(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    
    // Sostituisce proguard-android.txt con proguard-android-optimize.txt
    if (content.includes("proguard-android.txt")) {
      content = content.replace("proguard-android.txt", "proguard-android-optimize.txt");
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log("✅ [Patch AdMob] build.gradle modificato con successo per supportare R8/Gradle 8+.");
    } else {
      console.log("ℹ️ [Patch AdMob] build.gradle era già patchato o ottimizzato.");
    }
  } else {
    console.warn("⚠️ [Patch AdMob] build.gradle non trovato. Assicurati che @capacitor-community/admob sia installato.");
  }
} catch (e) {
  console.error("❌ [Patch AdMob] Impossibile applicare la patch:", e);
}
