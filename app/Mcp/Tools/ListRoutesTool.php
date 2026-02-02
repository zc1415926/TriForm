<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Route;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
class ListRoutesTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = <<<'MARKDOWN'
        List all registered routes in the application. This helps understand the available endpoints and their methods.
    MARKDOWN;

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $filter = $request->string('filter', '');

        $routes = collect(Route::getRoutes()->getRoutesByType())
            ->flatten()
            ->map(function ($route) {
                return [
                    'method' => implode('|', $route->methods),
                    'uri' => $route->uri,
                    'name' => $route->getName(),
                    'action' => $route->getActionName(),
                    'middleware' => $route->middleware(),
                ];
            })
            ->when($filter, function ($collection) use ($filter) {
                return $collection->filter(function ($route) use ($filter) {
                    return str_contains(strtolower($route['uri']), strtolower($filter)) ||
                           str_contains(strtolower($route['name'] ?? ''), strtolower($filter));
                });
            })
            ->values()
            ->all();

        return Response::text(json_encode($routes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\Contracts\JsonSchema\JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'filter' => $schema->string()
                ->description('Optional filter to search routes by URI or name')
                ->default(''),
        ];
    }
}
