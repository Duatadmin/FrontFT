interface ProcessEnv {
  [key: string]: string | undefined;
  NODE_ENV?: 'development' | 'production' | 'test';
}

declare var process: {
  env: ProcessEnv;
};
