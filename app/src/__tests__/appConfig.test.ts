const appConfig = require('../../app.json');

describe('Expo app config', () => {
  it('uses the Fantasy Petanque public name and slug', () => {
    expect(appConfig.expo.name).toBe('Fantasy Pétanque');
    expect(appConfig.expo.slug).toBe('fantasy-petanque');
  });
});
