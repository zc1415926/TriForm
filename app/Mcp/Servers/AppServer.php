<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\DatabaseQueryTool;
use App\Mcp\Tools\ListRoutesTool;
use App\Mcp\Tools\RunArtisanTool;
use Laravel\Mcp\Server;

class AppServer extends Server
{
    /**
     * The MCP server's name.
     */
    protected string $name = 'App Server';

    /**
     * The MCP server's version.
     */
    protected string $version = '1.0.0';

    /**
     * The MCP server's instructions for the LLM.
     */
    protected string $instructions = <<<'MARKDOWN'
        This server provides tools for interacting with the Laravel application.

        Available tools:
        - database_query: Execute read-only SELECT queries against the database
        - list_routes: List all registered routes in the application
        - run_artisan: Execute Artisan commands

        Use these tools to inspect and understand the application state, query data, and manage the application.
    MARKDOWN;

    /**
     * The tools registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        DatabaseQueryTool::class,
        ListRoutesTool::class,
        RunArtisanTool::class,
    ];

    /**
     * The resources registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Resource>>
     */
    protected array $resources = [
        //
    ];

    /**
     * The prompts registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Prompt>>
     */
    protected array $prompts = [
        //
    ];
}
