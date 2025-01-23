<# 
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                     MORNING DEV ENVIRONMENT AUTOMATION                       ║
    ║                                                                              ║
    ║  What this script does:                                                      ║
    ║  1. Initial cleanup and checks:                                              ║
    ║     - Stops existing processes like node, metro, and gradle                  ║
    ║     - Handles device connections and wireless debugging                      ║
    ║     - Manages app installation state                                         ║
    ║                                                                              ║
    ║  Author: Github.com/Dpope32                                                  ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
#>

# Get package name from app.json
try {
    $appJson = Get-Content -Raw -Path "../app.json" | ConvertFrom-Json
    $packageName = $appJson.expo.android.package
    if (-not $packageName) {
        Write-Host "Error: Could not find Android package name in app.json"
        exit 1
    }
} catch {
    Write-Host "Error: Could not read app.json or parse package name"
    exit 1
}

# Check if a device is connected
$deviceCheck = adb devices
if ($deviceCheck -match "device$") {
    Write-Host "Device found, proceeding with build process..."
} else {
    Write-Host "No device found. Please connect a device or start an emulator."
    exit 1
}

# Uninstall the app if it exists
Write-Host "Uninstalling previous version..."
$uninstallResult = adb uninstall $packageName 2>&1
if ($uninstallResult -match "Success") {
    Write-Host "Successfully uninstalled previous version"
} elseif ($uninstallResult -match "package .* not found") {
    Write-Host "App not previously installed, proceeding with build"
} else {
    Write-Host "Warning: Uninstall may have failed, proceeding anyway..."
}

# Kill any existing Metro processes
Write-Host "Stopping any existing Metro processes..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "metro" } | Stop-Process -Force

# Kill any existing Gradle daemon processes
Write-Host "Stopping any existing Gradle processes..."
try {
    if (Test-Path "../android/gradlew") {
        Start-Process "../android/gradlew" -ArgumentList "--stop" -NoNewWindow -Wait -ErrorAction Stop
        Write-Host "Successfully stopped Gradle daemon"
    } else {
        Write-Host "Gradle wrapper not found, skipping Gradle daemon stop"
    }
} catch {
    Write-Host "Warning: Failed to stop Gradle daemon, proceeding anyway..."
}

# Clear Android build folder
Write-Host "Clearing Android build folder..."
if (Test-Path "../android/app/build") {
    Remove-Item -Recurse -Force "../android/app/build"
}

# Clear Metro bundler cache
Write-Host "Clearing Metro bundler cache..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$env:APPDATA\Expo\metro-cache"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$env:TEMP\metro-*"

# Run the build
Write-Host "Starting Android build..."
$devices = adb devices
$deviceMatch = $devices | Select-String "(\S+)\s+device$"
if ($deviceMatch) {
    $deviceId = $deviceMatch.Matches[0].Groups[1].Value
    Write-Host "Building for device: $deviceId"
    Write-Host "Building with Gradle..."
    if (Test-Path "../android/gradlew") {
        Set-Location ../android
        ./gradlew assembleDebug
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Installing APK..."
            adb -s $deviceId install -r app/build/outputs/apk/debug/app-debug.apk
        } else {
            Write-Host "Gradle build failed"
            exit 1
        }
        Set-Location ..  # Move back to project root from android directory
        
        # Start Metro bundler after successful installation
        Write-Host "Starting Metro bundler..."
        Start-Process "npx" -ArgumentList "expo start --clear" -NoNewWindow
    } else {
        Write-Host "Error: Gradle wrapper not found"
        exit 1
    }
} else {
    Write-Host "Error: No device found"
    exit 1
}

Write-Host "Build and installation completed successfully!"
