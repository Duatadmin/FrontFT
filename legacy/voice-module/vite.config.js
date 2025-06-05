// vite.config.js
export default {
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    lib: {
      entry: 'index.js',
      name: 'VoiceModule',
      fileName: 'voice-module',
      formats: ['es', 'umd'],
    },
  },
};
