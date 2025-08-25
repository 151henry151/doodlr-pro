# React Native specific rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

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

# Keep debugging information
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Exceptions,InnerClasses

# Enable deobfuscation file generation
-printmapping mapping.txt
-printseeds seeds.txt
-printconfiguration configuration.txt

# Keep package names for debugging
-keepnames class com.romp.doodlr.** { *; }

# Keep main activity and application
-keep class com.romp.doodlr.MainActivity { *; }
-keep class com.romp.doodlr.MainApplication { *; }

# Keep all classes in the main package
-keep class com.romp.doodlr.** {
    public protected *;
} 