<?php

use App\Mcp\Servers\AppServer;
use Laravel\Mcp\Facades\Mcp;

// Register local MCP server for iFlow and other AI assistants
// Local servers run as Artisan commands and are perfect for AI assistant integrations
Mcp::local('app', AppServer::class);

// Example: Register web server for HTTP-accessible MCP endpoints
// Mcp::web('/mcp/demo', \App\Mcp\Servers\PublicServer::class);
