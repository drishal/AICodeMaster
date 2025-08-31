{
  config,
  pkgs,
  sdk,
  ...
}:
{
  packages = with pkgs; [
    python3
    virtualenv
    android-tools
    openjdk17
    python3Packages.pandas
    python3Packages.numpy
    python3Packages.ipython
    python3Packages.pyls-spyder
    python3Packages.openai
    #nixgl.auto.nixGLDefault
    # basedpyright
  ];
  android = {
    enable = true;
    abis = [
      "x86_64"
    ];
    platforms.version = [
      "34"
      "35"
    ];
    emulator = {
      enable = false;
    };
    googleAPIs.enable = true;
    ndk.enable = true;
    sources.enable = false;
    systemImages.enable = true;
    extraLicenses = [
      "android-sdk-preview-license"
      "android-googletv-license"
      "android-sdk-arm-dbt-license"
      "google-gdk-license"
      "intel-android-extra-license"
      "intel-android-sysimage-license"
      "mips-android-sysimage-license"
    ];
  };
  languages = {
    python = {
      enable = true;
      venv.enable = true;
      venv.requirements = ''
        Appium-Python-Client
        openpyxl
      '';
    };
  };
}
