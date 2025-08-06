export interface CloudComponent {
  id: string;
  name: string;
  description: string;
  type: 'factory' | 'component' | 'template' | 'config';
  framework: string;
  version: string;
  code: string;
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    dependencies: Record<string, string>;
    stats?: {
      linesOfCode: number;
      codeReduction: number;
    };
  };
  checksum: string;
}

export interface CloudSyncStatus {
  lastSync: string;
  conflicts: CloudConflict[];
  pendingChanges: {
    local: CloudChange[];
    remote: CloudChange[];
  };
}

export interface CloudConflict {
  componentId: string;
  componentName: string;
  type: 'both-modified' | 'deleted-modified' | 'version-mismatch';
  localVersion: string;
  remoteVersion: string;
  resolution?: 'local' | 'remote' | 'manual';
}

export interface CloudChange {
  componentId: string;
  componentName: string;
  action: 'create' | 'update' | 'delete';
  timestamp: string;
}

export interface SyncOptions {
  force?: boolean;
  dryRun?: boolean;
  conflictResolution?: 'prompt' | 'local' | 'remote' | 'merge';
  pull?: boolean;
  push?: boolean;
  filter?: {
    types?: CloudComponent['type'][];
    frameworks?: string[];
    tags?: string[];
  };
}

export interface CloudConfig {
  apiUrl: string;
  wsUrl: string;
  teamId?: string;
  projectId?: string;
}

export interface PushOptions extends SyncOptions {
  message?: string;
  tags?: string[];
  all?: boolean;
}

export interface PullOptions extends SyncOptions {
  overwrite?: boolean;
  all?: boolean;
}