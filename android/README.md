# Android Native Setup

## App Shortcuts

Die Datei `app/src/main/res/xml/shortcuts.xml` definiert den Android App Shortcut für die
Schnelleingabe. Damit dieser aktiv wird, muss im `AndroidManifest.xml` folgendes in der
`<activity>`-Deklaration ergänzt werden:

```xml
<meta-data
  android:name="android.app.shortcuts"
  android:resource="@xml/shortcuts" />
```

## Deep Links

Der Intent-Filter für `fintrack://app/quick-add` muss im `AndroidManifest.xml` eingetragen sein:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="fintrack" android:host="app" />
</intent-filter>
```

## Shortcut-Icon

<!-- TODO: Native – bitte prüfen -->
Das Icon `@drawable/ic_shortcut_add` muss als PNG in den entsprechenden `drawable-*` Ordnern
bereitgestellt werden (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi).
Empfohlene Größe: 24dp mit Rand, Farbe Teal #1D9E75.

## Capacitor Build

```bash
npx cap sync android
npx cap open android
```
