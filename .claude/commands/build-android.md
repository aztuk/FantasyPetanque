# Skill : build-android

Génère un APK Android via EAS Build et guide l'installation sur le téléphone.

## Étapes

### 1. Vérifier les prérequis

Vérifier que les outils sont disponibles :

```bash
eas --version
```

Si EAS CLI n'est pas installé :
```bash
npm install -g eas-cli
```

Vérifier que l'utilisateur est connecté à Expo :
```bash
eas whoami
```

Si non connecté → demander à l'utilisateur de lancer `eas login` avec son compte Expo (email : quentingillon1@gmail.com).

### 2. Vérifier la config EAS

Vérifier si `app/eas.json` existe. S'il n'existe pas, le créer :

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Vérifier aussi que `app/app.json` contient bien :
- `expo.slug` — non vide (actuellement `"app"`, à renommer si besoin)
- `expo.android.package` — actuellement `"com.aztuk.app"`

### 3. Lancer le build

Depuis le dossier `app/` :

```bash
cd app && eas build --profile preview --platform android
```

- Si c'est le premier build du projet, EAS demandera de lier le projet à un compte Expo — confirmer.
- Le build se fait dans le cloud (~5-10 min).
- À la fin, EAS affiche une URL de téléchargement de l'APK.

### 4. Installer sur le téléphone

Deux méthodes au choix :

**Via QR code** (plus simple) :
- EAS affiche un QR code à la fin du build.
- Scanner avec le téléphone → télécharge et installe l'APK directement.
- Si Android bloque l'installation : Paramètres → Sécurité → Autoriser les sources inconnues pour le navigateur utilisé.

**Via ADB** (si le téléphone est branché en USB) :
```bash
adb install chemin/vers/le/fichier.apk
```

### 5. Notes importantes

- Le profil `preview` génère un APK installable directement.
- Le profil `production` génère un AAB (format Google Play Store uniquement).
- L'APK `preview` n'expire pas — il reste utilisable indéfiniment sur le téléphone.
- Pour mettre à jour l'app, relancer un build et réinstaller l'APK.
- Le slug `"app"` dans `app.json` est générique — envisager de le renommer en `"fantasy-petanque"` pour éviter les conflits sur le compte Expo.
