interface Config {
  features: {
    ai: boolean;
    marketplace: boolean;
    cloudSync: boolean;
    analytics: boolean;
  };
  preferences: {
    componentStyle: 'composition' | 'declaration';
    fileNaming: 'kebab-case' | 'camelCase' | 'PascalCase';
    interactive: boolean;
    telemetry: boolean;
  };
}

const config: Config = {
  features: {
    ai: true,
    marketplace: true,
    cloudSync: true,
    analytics: false,
  },
  preferences: {
    componentStyle: 'declaration',
    fileNaming: 'kebab-case',
    interactive: true,
    telemetry: true,
  },
};

export default config;