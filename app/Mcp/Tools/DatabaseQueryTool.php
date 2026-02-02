<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
class DatabaseQueryTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = <<<'MARKDOWN'
        Execute read-only SQL queries against the database. Only SELECT queries are allowed for security.
        This tool is useful for inspecting data, checking table structures, and understanding the database state.
    MARKDOWN;

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $query = $request->string('query');

        // Security: Only allow SELECT queries
        $normalizedQuery = trim(strtoupper($query));
        if (! str_starts_with($normalizedQuery, 'SELECT')) {
            return Response::error('Only SELECT queries are allowed for security reasons.');
        }

        try {
            $results = DB::select(DB::raw($query));

            // Format results as JSON
            $formatted = json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            return Response::text($formatted);
        } catch (\Exception $e) {
            return Response::error('Database query failed: '.$e->getMessage());
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
            'query' => $schema->string()
                ->description('The SQL SELECT query to execute. Only SELECT queries are allowed.')
                ->required(),
        ];
    }
}
