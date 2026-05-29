const appConfig = require('../../app.json');

describe('Expo app config', () => {
  it('uses the Fantasy Petanque public name and slug', () => {
    expect(appConfig.expo.name).toBe('Fantasy Pétanque');
    expect(appConfig.expo.slug).toBe('fantasy-petanque');
  });

  it('uses branded assets for native launch surfaces', () => {
    expect(appConfig.expo.icon).toBe('./assets/app-icon.png');
    expect(appConfig.expo.splash.image).toBe('./assets/app-splash-icon.png');
    expect(appConfig.expo.splash.backgroundColor).toBe('#28261F');
    expect(appConfig.expo.android.adaptiveIcon.foregroundImage).toBe('./assets/app-adaptive-icon.png');
    expect(appConfig.expo.android.adaptiveIcon.backgroundColor).toBe('#28261F');
    expect(appConfig.expo.web.favicon).toBe('./assets/app-favicon.png');
    expect(appConfig.expo.plugins).toContainEqual([
      'expo-splash-screen',
      {
        image: './assets/app-splash-icon.png',
        imageWidth: 298,
        resizeMode: 'contain',
        backgroundColor: '#28261F',
      },
    ]);
  });
});
