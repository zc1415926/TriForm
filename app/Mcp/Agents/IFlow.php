<?php

declare(strict_types=1);

namespace App\Mcp\Agents;

use Laravel\Boost\Contracts\SupportsGuidelines;
use Laravel\Boost\Contracts\SupportsMcp;
use Laravel\Boost\Contracts\SupportsSkills;
use Laravel\Boost\Install\Agents\Agent;
use Laravel\Boost\Install\Enums\Platform;

/**
 * iFlow CLI Agent implementation for Laravel Boost.
 *
 * iFlow CLI (心流 CLI) is an interactive CLI agent specializing in software engineering tasks.
 */
class IFlow extends Agent implements SupportsGuidelines, SupportsMcp, SupportsSkills
{
    /**
     * Get the agent name identifier.
     */
    public function name(): string
    {
        return 'iflow';
    }

    /**
     * Get the display name for the agent.
     */
    public function displayName(): string
    {
        return 'iFlow CLI';
    }

    /**
     * Get the system-wide detection configuration.
     *
     * @return array{paths?: string[], command?: string, files?: string[]}
     */
    public function systemDetectionConfig(Platform $platform): array
    {
        return match ($platform) {
            Platform::Darwin, Platform::Linux => [
                'command' => 'command -v iflow',
            ],
            Platform::Windows => [
                'command' => 'where iflow 2>nul',
            ],
        };
    }

    /**
     * Get the project-specific detection configuration.
     *
     * @return array{paths?: string[], files?: string[]}
     */
    public function projectDetectionConfig(): array
    {
        return [
            'paths' => ['.iflow'],
            'files' => ['IFLOW.md'],
        ];
    }

    /**
     * Get the MCP configuration file path.
     */
    public function mcpConfigPath(): string
    {
        return '.iflow/settings.json';
    }

    /**
     * Get the guidelines file path.
     */
    public function guidelinesPath(): string
    {
        return config('boost.agents.iflow.guidelines_path', 'IFLOW.md');
    }

    /**
     * Get the skills directory path.
     */
    public function skillsPath(): string
    {
        return config('boost.agents.iflow.skills_path', '.iflow/skills');
    }
}
