<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Artisan;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;

#[IsDestructive]
class RunArtisanTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = <<<'MARKDOWN'
        Execute Artisan commands in the Laravel application. This tool allows running various Laravel CLI commands.
        Use with caution as some commands may modify the application state.
    MARKDOWN;

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $command = $request->string('command');
        $args = $request->array('args', []);

        try {
            $exitCode = Artisan::call($command, $args);
            $output = Artisan::output();

            $result = [
                'command' => $command,
                'args' => $args,
                'exit_code' => $exitCode,
                'output' => $output,
            ];

            return Response::text(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } catch (\Exception $e) {
            return Response::error('Artisan command failed: '.$e->getMessage());
        }
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\Contracts\JsonSchema\JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'command' => $schema->string()
                ->description('The Artisan command to execute (e.g., "migrate", "route:list", "cache:clear")')
                ->required(),
            'args' => $schema->array()
                ->description('Array of arguments and options to pass to the command')
                ->items($schema->string())
                ->default([]),
        ];
    }
}
