require('dotenv').config();
const albumService = require('../backend/modules/album/albumService');

async function testUiConfig() {
  console.log('--- Testing uiConfig Strategy ---');

  try {
    // 1. Create a dummy album
    console.log('\n1. Creating album with partial uiConfig...');
    const newAlbum = await albumService.createAlbum({
      title: 'Test Album UI',
      artist: 'Tester',
      uiConfig: {
        theme: 'dark',
        colors: { primary: '#FF0000' } // Should merge with other defaults
      }
    });
    console.log('Created Album ID:', newAlbum.id);
    console.log('uiConfig (Theme):', newAlbum.uiConfig.theme);
    console.log('uiConfig (Primary Color):', newAlbum.uiConfig.colors.primary);
    console.log('uiConfig (Accent - Default):', newAlbum.uiConfig.colors.accent);

    // 2. Update uiConfig
    console.log('\n2. Updating uiConfig with invalid values...');
    const updated = await albumService.updateAlbum(newAlbum.id, {
      uiConfig: {
        theme: 'invalid-theme', // Should be ignored/fallback to default
        colors: { accent: 'not-a-color' }, // Should be ignored
        branding: { footer: 'Footer Custom' }
      }
    });

    console.log('Updated uiConfig (Theme - should be default/unchanged):', updated.uiConfig.theme);
    console.log('Updated uiConfig (Footer):', updated.uiConfig.branding.footer);
    console.log(
      'Updated uiConfig (Primary - should persist from create):',
      updated.uiConfig.colors.primary
    );

    // 3. Cleanup
    console.log('\n3. Cleaning up test data...');
    await albumService.deleteAlbum(newAlbum.id);
    console.log('Test album deleted.');

    console.log('\n✅ TEST COMPLETED SUCCESSFULLY');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

testUiConfig();
