# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# React Native specific rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep React Native bridge
-keep class com.facebook.react.bridge.** { *; }

# Keep JavaScript interface
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Keep React Native modules
-keep class com.facebook.react.modules.** { *; }

# Keep Expo modules
-keep class expo.modules.** { *; }
-keep class expo.core.** { *; }

# Keep WebSocket classes
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Keep JSON parsing classes
-keep class com.google.gson.** { *; }
-keep class org.json.** { *; }

# Keep network-related classes
-keep class retrofit2.** { *; }

# Keep debugging information
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Exceptions,InnerClasses

# Keep package names for debugging
-keepnames class com.romp.doodlr.** { *; }

# Keep main activity
-keep class com.romp.doodlr.MainActivity { *; }
-keep class com.romp.doodlr.MainApplication { *; }

# Keep React Native bundle
-keep class com.facebook.react.bundle.** { *; }

# Keep Hermes engine
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep WebView if used
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep custom native modules
-keep class com.romp.doodlr.** { *; }

# Keep all classes in the main package
-keep class com.romp.doodlr.** {
    public protected *;
}

# Keep React Native dev support
-dontwarn com.facebook.react.devsupport.**
-keep class com.facebook.react.devsupport.** { *; }

# Keep React Native bundle
-keep class com.facebook.react.bundle.** { *; }

# Keep React Native bridge
-keep class com.facebook.react.bridge.** { *; }

# Keep React Native modules
-keep class com.facebook.react.modules.** { *; }

# Keep React Native views
-keep class com.facebook.react.views.** { *; }

# Keep React Native components
-keep class com.facebook.react.uimanager.** { *; }

# Keep React Native events
-keep class com.facebook.react.uimanager.events.** { *; }

# Keep React Native bridge
-keep class com.facebook.react.bridge.** { *; }

# Keep React Native modules
-keep class com.facebook.react.modules.** { *; }

# Keep React Native views
-keep class com.facebook.react.views.** { *; }

# Keep React Native components
-keep class com.facebook.react.uimanager.** { *; }

# Keep React Native events
-keep class com.facebook.react.uimanager.events.** { *; } 