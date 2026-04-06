/**
 * Puter.com AI Tools Definitions
 * Defines the functions that the AI can call to interact with GitHub repositories
 */

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

/**
 * Tool: Read a file from the repository
 */
export const readRepoFileTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'read_repo_file',
    description: 'Read the content of a file from the GitHub repository. Use this to examine code, configuration files, or any other file in the repo.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path to the file relative to the repository root (e.g., "package.json", "src/App.tsx", ".github/workflows/build-apk.yml")',
        },
      },
      required: ['file_path'],
    },
  },
};

/**
 * Tool: List files in the repository
 */
export const listRepoFilesTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'list_repo_files',
    description: 'List all files and directories in the repository. Optionally filter by directory path or file pattern.',
    parameters: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Optional: Directory path to list files from (e.g., "src", "android", ".github/workflows"). If not provided, lists root directory.',
        },
        pattern: {
          type: 'string',
          description: 'Optional: File pattern to filter by (e.g., "*.json", "*.tsx", "build*")',
        },
      },
      required: [],
    },
  },
};

/**
 * Tool: Read GitHub Actions workflow logs
 */
export const readRepoLogsTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'read_repo_logs',
    description: 'Read the logs from the latest GitHub Actions workflow runs. Use this to understand build errors, test failures, or deployment issues.',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Optional: Number of recent workflow runs to fetch (default: 3). Maximum: 10.',
        },
        include_failed_only: {
          type: 'boolean',
          description: 'Optional: If true, only return logs from failed runs (default: false)',
        },
      },
      required: [],
    },
  },
};

/**
 * Tool: Analyze a specific error from logs
 */
export const analyzeErrorTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'analyze_error',
    description: 'Analyze a specific error message from build logs and suggest fixes. Provide the error message or error context.',
    parameters: {
      type: 'object',
      properties: {
        error_message: {
          type: 'string',
          description: 'The error message or error context to analyze (e.g., "Module not found: Can\'t resolve \'@capacitor/core\'")',
        },
        file_path: {
          type: 'string',
          description: 'Optional: The file path where the error occurred, if known',
        },
      },
      required: ['error_message'],
    },
  },
};

/**
 * Tool: Create or update a file in the repository
 */
export const createOrUpdateFileTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'create_or_update_file',
    description: 'Create a new file or update an existing file in the repository. The file will be committed with a descriptive message.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path to the file relative to the repository root (e.g., "package.json", "src/utils/helper.ts")',
        },
        content: {
          type: 'string',
          description: 'The full content of the file to create or update',
        },
        commit_message: {
          type: 'string',
          description: 'The commit message describing the change (e.g., "fix: update package.json dependencies", "feat: add missing configuration")',
        },
        branch: {
          type: 'string',
          description: 'Optional: The branch to commit to (default: main or default branch)',
        },
      },
      required: ['file_path', 'content', 'commit_message'],
    },
  },
};

/**
 * Tool: Create a new file with template
 */
export const createNewFileTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'create_new_file',
    description: 'Create a new file in the repository with optional template. Useful for creating missing configuration files or source files.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path to the new file (e.g., "capacitor.config.json", ".github/workflows/build-apk.yml")',
        },
        template_type: {
          type: 'string',
          enum: [
            'capacitor_config',
            'package_json',
            'tsconfig',
            'github_workflow_apk',
            'android_manifest',
            'gradle_build',
            'custom',
          ],
          description: 'Optional: Use a predefined template. If "custom", provide the content parameter.',
        },
        content: {
          type: 'string',
          description: 'Optional: Custom content if template_type is "custom"',
        },
        commit_message: {
          type: 'string',
          description: 'The commit message for creating this file',
        },
      },
      required: ['file_path', 'commit_message'],
    },
  },
};

/**
 * Tool: Fork the repository
 */
export const forkRepoTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'fork_repo',
    description: 'Fork the current repository to the authenticated user\'s account. Useful for testing changes before submitting a pull request.',
    parameters: {
      type: 'object',
      properties: {
        fork_name: {
          type: 'string',
          description: 'Optional: Custom name for the forked repository. If not provided, uses the original name.',
        },
      },
      required: [],
    },
  },
};

/**
 * Tool: Trigger a GitHub Actions workflow
 */
export const triggerWorkflowTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'trigger_workflow',
    description: 'Trigger a GitHub Actions workflow to build the APK or run tests. This will start a new workflow run.',
    parameters: {
      type: 'object',
      properties: {
        workflow_file: {
          type: 'string',
          description: 'The workflow file name or ID (e.g., "build-apk.yml", "build-apk", "ci.yml")',
        },
        branch: {
          type: 'string',
          description: 'Optional: The branch to run the workflow on (default: main or default branch)',
        },
        inputs: {
          type: 'object',
          description: 'Optional: Workflow inputs as key-value pairs (e.g., {"build_type": "release"})',
        },
      },
      required: ['workflow_file'],
    },
  },
};

/**
 * Tool: Get the build status
 */
export const getBuildStatusTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'get_build_status',
    description: 'Get the current status of the APK build. Returns the latest workflow run status and any build artifacts.',
    parameters: {
      type: 'object',
      properties: {
        workflow_file: {
          type: 'string',
          description: 'Optional: Specific workflow file to check (default: build-apk.yml)',
        },
      },
      required: [],
    },
  },
};

/**
 * Tool: Get repository information
 */
export const getRepoInfoTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'get_repo_info',
    description: 'Get information about the repository including default branch, language, topics, and structure.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
};

/**
 * Tool: Check for missing files
 */
export const checkMissingFilesTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'check_missing_files',
    description: 'Check if required files for APK compilation are present in the repository. Returns a list of missing files and suggestions to fix them.',
    parameters: {
      type: 'object',
      properties: {
        check_type: {
          type: 'string',
          enum: ['apk_build', 'capacitor', 'android', 'all'],
          description: 'Optional: Type of check to perform (default: "all")',
        },
      },
      required: [],
    },
  },
};

/**
 * Tool: Create a pull request
 */
export const createPullRequestTool: ToolDefinition = {
  type: 'function',
  function: {
    name: 'create_pull_request',
    description: 'Create a pull request with the changes made by the AI. Useful for proposing fixes without directly committing to main.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the pull request',
        },
        description: {
          type: 'string',
          description: 'The description of the pull request explaining the changes',
        },
        from_branch: {
          type: 'string',
          description: 'The branch with the changes (default: current branch)',
        },
        to_branch: {
          type: 'string',
          description: 'The target branch (default: main)',
        },
      },
      required: ['title', 'description'],
    },
  },
};

/**
 * All available tools for Puter AI
 */
export const ALL_PUTER_TOOLS: ToolDefinition[] = [
  readRepoFileTool,
  listRepoFilesTool,
  readRepoLogsTool,
  analyzeErrorTool,
  createOrUpdateFileTool,
  createNewFileTool,
  forkRepoTool,
  triggerWorkflowTool,
  getBuildStatusTool,
  getRepoInfoTool,
  checkMissingFilesTool,
  createPullRequestTool,
];

/**
 * Get tools by category
 */
export function getToolsByCategory(category: 'read' | 'write' | 'workflow' | 'all' = 'all'): ToolDefinition[] {
  const readTools = [readRepoFileTool, listRepoFilesTool, readRepoLogsTool, getRepoInfoTool, checkMissingFilesTool];
  const writeTools = [createOrUpdateFileTool, createNewFileTool, createPullRequestTool];
  const workflowTools = [triggerWorkflowTool, getBuildStatusTool, forkRepoTool];

  switch (category) {
    case 'read':
      return readTools;
    case 'write':
      return writeTools;
    case 'workflow':
      return workflowTools;
    case 'all':
    default:
      return ALL_PUTER_TOOLS;
  }
}
