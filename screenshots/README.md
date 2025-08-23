# Doodlr Screenshots for Google Play Store

This directory contains screenshots of the Doodlr app running on different Android device sizes for Google Play Store submission.

## Current Screenshots

### 7" Tablet Screenshots (1024x600 resolution)
- `doodlr_7inch_tablet_screenshot.png` - Initial screenshot from 7" tablet emulator
- `doodlr_7inch_tablet_screenshot_2.png` - Additional screenshot from 7" tablet emulator

### 10" Tablet Screenshots (1280x800 resolution)
- `doodlr_10inch_tablet_screenshot.png` - Screenshot from 10" tablet emulator
- `doodlr_10inch_tablet_screenshot_2.png` - Additional screenshot from 10" tablet emulator

### Phone Screenshots (~6.5" display)
- `doodlr_phone_screenshot_1.png` - Phone screenshot from physical device
- `doodlr_phone_screenshot_2.png` - Phone screenshot from physical device
- `doodlr_phone_screenshot_3.png` - Phone screenshot from physical device
- `doodlr_phone_screenshot_4.png` - Phone screenshot from physical device
- `doodlr_phone_screenshot_5.png` - Phone screenshot from physical device
- `doodlr_phone_screenshot_6.png` - Phone screenshot from physical device

## Device Specifications

### 7" Tablet Emulator
- **Device**: Tablet_7inch_API_34
- **Resolution**: 1024x600
- **DPI**: 160x160
- **Android Version**: API 34 (Android 14)

### 10" Tablet Emulator (Coming Soon)
- **Device**: Tablet_10inch_API_34
- **Resolution**: 1280x800
- **DPI**: 160x160
- **Android Version**: API 34 (Android 14)

## How to Take New Screenshots

### Using ADB (Recommended)
```bash
# Take screenshot
adb shell screencap -p /sdcard/screenshot_name.png

# Pull to computer
adb pull /sdcard/screenshot_name.png screenshots/
```

### From Within Emulator
1. Use the emulator's built-in screenshot feature
2. Pull the file: `adb pull /sdcard/filename.png screenshots/`

## Google Play Store Requirements

Google Play Store requires screenshots from:
- Phone (you already have these from your physical device)
- 7" tablet
- 10" tablet

## Notes
- Screenshots should show different features of the app
- Consider taking screenshots in both portrait and landscape orientations
- Make sure the app looks good at different zoom levels 