<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application with React + TypeScript frontend using Inertia. The main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

### Backend (PHP)
- php - ^8.2
- inertiajs/inertia-laravel (INERTIA) - ^2.0
- laravel/fortify (FORTIFY) - ^1.30
- laravel/framework (LARAVEL) - ^12.0
- laravel/wayfinder (WAYFINDER) - ^0.1.9
- laravel/pint (PINT) - ^1.24
- laravel/pail (PAIL) - ^1.2.2
- laravel/sail (SAIL) - ^1.41
- pestphp/pest (PEST) - ^4.3
- pestphp/pest-plugin-laravel - ^4.0
- phpunit/phpunit (PHPUNIT) - v12

### Frontend (JavaScript/TypeScript)
- react - ^19.2.0
- react-dom - ^19.2.0
- typescript - ^5.7.2
- @inertiajs/react - ^2.3.7
- tailwindcss - ^4.0.0
- @tailwindcss/vite - ^4.1.11
- vite - ^7.0.4
- @headlessui/react - ^2.2.0
- @radix-ui/* (multiple UI primitives)
- lucide-react - ^0.475.0
- babel-plugin-react-compiler - ^1.0.0

## Skills Activation

This project has domain-specific skills available. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

- `wayfinder-development` — Activates whenever referencing backend routes in frontend components. Use when importing from `@/actions` or `@/routes`, calling Laravel routes from TypeScript, or working with Wayfinder route functions.
- `pest-testing` — Tests applications using the Pest 4 PHP framework. Activates when writing tests, creating unit or feature tests, adding assertions, testing Livewire components, browser testing, debugging test failures, working with datasets or mocking; or when the user mentions test, spec, TDD, expects, assertion, coverage, or needs to verify functionality works.
- `developing-with-fortify` — Laravel Fortify headless authentication backend development. Activate when implementing authentication features including login, registration, password reset, email verification, two-factor authentication (2FA/TOTP), profile updates, headless auth, authentication scaffolding, or auth guards in Laravel applications.

## Frontend Stack & Architecture

### Technology Stack
- **Framework:** React 19 with TypeScript and Inertia v2
- **Styling:** Tailwind CSS 4.0 with CSS variables for theming
- **UI Components:** shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Icons:** Lucide React
- **Forms:** Headless UI + custom form components
- **Routing:** Laravel Wayfinder for type-safe route functions
- **Build Tool:** Vite 7.0.4
- **Optimizations:** React Compiler enabled, SSR support

### Directory Structure
- `resources/js/pages/` - Inertia page components
- `resources/js/components/` - Shared React components
  - `components/ui/` - shadcn/ui components
- `resources/js/components/app-*.tsx` - App shell components (header, sidebar, etc.)
- `resources/js/lib/` - Utility functions and helpers
- `resources/js/hooks/` - Custom React hooks
- `resources/js/actions/` - Wayfinder-generated controller actions
- `resources/js/routes/` - Wayfinder-generated named routes
- `resources/js/types/` - TypeScript type definitions

### Development Commands
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Build for production
- `npm run build:ssr` - Build for production with SSR
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run types` - Run TypeScript type checking
- `composer run dev` - Start full development stack (Laravel server, queue, logs, Vite)
- `composer run dev:ssr` - Start development stack with SSR

### Code Style & Quality
- **TypeScript:** Strict mode enabled, explicit return types required
- **ESLint:** Modern ESLint 9 with TypeScript support, auto-fix on lint
- **Prettier:** Code formatting with Tailwind plugin
- **React Compiler:** Enabled for automatic optimization
- **Imports:** Use `@/*` alias for `resources/js/*`

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

### React/TypeScript Conventions
- Use functional components with hooks (no class components)
- Use TypeScript interfaces and types for all props and state
- Use `clsx` and `tailwind-merge` for conditional class merging (`cn()` utility)
- Prefer shadcn/ui components over building from scratch
- Use Lucide React for icons
- Follow the existing component naming: PascalCase for components, kebab-case for files
- Use explicit return types for functions
- Leverage React Compiler optimizations (avoid unnecessary `useMemo`/`useCallback`)

### UI/UX Patterns
- Use consistent spacing and colors from Tailwind configuration
- Implement loading states (skeletons) for async operations
- Add error boundaries for robust error handling
- Use dialog/modal patterns for user interactions
- Implement responsive design (mobile-first approach)
- Follow shadcn/ui component patterns for consistency

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.
- For frontend testing, write tests that verify component behavior and user interactions.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.
- Frontend uses a modular component architecture with shadcn/ui as the base.

## Frontend Development

- **Hot Module Replacement (HMR):** Vite dev server supports HMR for instant updates
- **SSR Support:** Server-side rendering is configured and can be enabled with `composer run dev:ssr`
- **Type Safety:** All routes are type-safe via Wayfinder TypeScript generation
- **If changes not visible:** Run `npm run build` or `npm run dev` to rebuild assets
- **Full stack dev:** Use `composer run dev` to start Laravel server, queue, logs, and Vite simultaneously

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan

- Use the `list-artisan-commands` tool when you need to call an Artisan command to double-check the available parameters.

## URLs

- Whenever you share a project URL with the user, you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain/IP, and port.

## Tinker / Debugging

- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool

- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)

- Boost comes with a powerful `search-docs` tool you should use before trying other approaches when working with Laravel or Laravel ecosystem packages. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic-based queries at once. For example: `['rate limiting', 'routing rate limiting', 'routing']`. The most relevant results will be returned first.
- Do not add package names to queries; package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'.
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit".
3. Quoted Phrases (Exact Position) - query="infinite scroll" - words must be adjacent and in that order.
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit".
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms.

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.

## Constructors

- Use PHP 8 constructor property promotion in `__construct()`.
    - <code-snippet>public function __construct(public GitHub $github) { }</code-snippet>
- Do not allow empty `__construct()` methods with zero parameters unless the constructor is private.

## Type Declarations

- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<code-snippet name="Explicit Return Types and Method Params" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## Enums

- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.

## Comments

- Prefer PHPDoc blocks over inline comments. Never use comments within the code itself unless the logic is exceptionally complex.

## PHPDoc Blocks

- Add useful array shape type definitions when appropriate.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

### Frontend Testing
- Component tests should verify rendering, user interactions, and edge cases
- Use TypeScript for type safety in tests
- Test form validation and error states
- Test loading states and async operations
- Verify responsive behavior when applicable

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages/` with TypeScript (.tsx). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.

=== inertia-laravel/v2 rules ===

# Inertia v2

- Use all Inertia features from v1 and v2. Check the documentation before making changes to ensure the correct approach.
- New features: deferred props, infinite scrolling (merging props + `WhenVisible`), lazy loading on scroll, polling, prefetching.
- When using deferred props, add an empty state with a pulsing or animated skeleton (use `components/ui/skeleton.tsx`).
- SSR support is configured - use `composer run dev:ssr` for development with SSR enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

## Database

- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries.
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## Controllers & Validation

- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

## Authentication & Authorization

- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Queues

- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

## Configuration

- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, run `npm run build` or `npm run dev`.
- If TypeScript errors occur, run `npm run types` to check for type issues.
- If ESLint errors occur, run `npm run lint` to auto-fix linting issues.
- For missing CSS in production, ensure Tailwind CSS is properly built with `npm run build`.

=== laravel/v12 rules ===

# Laravel 12

- CRITICAL: ALWAYS use `search-docs` tool for version-specific Laravel documentation and updated code examples.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

## Laravel 12 Structure

- In Laravel 12, middleware are no longer registered in `app/Http/Kernel.php`.
- Middleware are configured declaratively in `bootstrap/app.php` using `Application::configure()->withMiddleware()`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- The `app\Console\Kernel.php` file no longer exists; use `bootstrap/app.php` or `routes/console.php` for console configuration.
- Console commands in `app/Console/Commands/` are automatically available and do not require manual registration.

## Database

- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 12 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models

- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.

=== wayfinder/core rules ===

# Laravel Wayfinder

Wayfinder generates TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

- IMPORTANT: Activate `wayfinder-development` skill whenever referencing backend routes in frontend components.
- Invokable Controllers: `import StorePost from '@/actions/.../StorePostController'; StorePost()`.
- Parameter Binding: Detects route keys (`{post:slug}`) — `show({ slug: "my-post" })`.
- Query Merging: `show(1, { mergeQuery: { page: 2, sort: null } })` merges with current URL, `null` removes params.
- Inertia: Use `.form()` with `<Form>` component or `form.submit(store())` with useForm.
- Type Safety: All route functions are fully typed with TypeScript - leverage this for compile-time error checking.
- Form Variants: Enabled in Vite config - use `.form()` helper for type-safe form handling.

=== pint/core rules ===

# Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test`, simply run `vendor/bin/pint` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.
- CRITICAL: ALWAYS use `search-docs` tool for version-specific Pest documentation and updated code examples.
- IMPORTANT: Activate `pest-testing` every time you're working with a Pest or testing-related task.

=== laravel/fortify rules ===

# Laravel Fortify

- Fortify is a headless authentication backend that provides authentication routes and controllers for Laravel applications.
- IMPORTANT: Always use the `search-docs` tool for detailed Laravel Fortify patterns and documentation.
- IMPORTANT: Activate `developing-with-fortify` skill when working with Fortify authentication features.

=== react/core rules ===

# React 19 with TypeScript

- Use React 19 features: Actions, useOptimistic, useFormStatus when appropriate
- TypeScript strict mode is enabled - always provide explicit types
- Functional components with hooks only (no class components)
- React Compiler is enabled - rely on automatic optimizations
- Use `@/*` path alias for imports from `resources/js/*`

## Component Guidelines

- Prefer shadcn/ui components over building from scratch
- Use `cn()` utility from `@/lib/utils` for class merging
- Implement proper loading and error states
- Use TypeScript interfaces for component props
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks

## Hooks Usage

- Use `useForm` from `@inertiajs/react` for form handling
- Use `usePage` to access page props from Inertia
- Create custom hooks in `resources/js/hooks/` for reusable logic
- Avoid unnecessary `useMemo`/`useCallback` - React Compiler handles this

=== shadcn/ui rules ===

# shadcn/ui Components

- shadcn/ui is the primary UI component library (Radix UI + Tailwind CSS)
- Components are located in `resources/js/components/ui/`
- Use existing components before creating new ones
- Follow the existing component patterns and naming
- Use `lucide-react` for icons
- Components support theming via CSS variables

## Available Components

Commonly used components include: button, input, label, dialog, dropdown-menu, select, checkbox, card, alert, badge, avatar, tooltip, skeleton, spinner, sidebar, and more.
- Check `resources/js/components/ui/` for the full list of available components.

## Adding New Components

- Use shadcn CLI to add new components when needed
- Follow the project's existing component structure
- Ensure new components support the theming system
- Add TypeScript interfaces for all props

=== tailwindcss/core rules ===

# Tailwind CSS 4.0

- Tailwind CSS 4.0 with Vite integration is used for styling
- CSS variables are used for theming (check `resources/css/app.css`)
- Use `cn()` utility for conditional class merging
- Follow existing color and spacing conventions
- Responsive design is mobile-first
- Custom styles should be minimal - prefer utility classes

## Styling Patterns

- Use semantic color tokens (e.g., `bg-primary`, `text-muted-foreground`)
- Implement consistent spacing using Tailwind's scale
- Use `@tailwindcss/vite` plugin for optimal performance
- Leverage Tailwind's CSS variables for dynamic theming

=== typescript/core rules ===

# TypeScript Best Practices

- Strict mode is enabled - no implicit any types
- Use explicit return types for functions
- Define interfaces for complex data structures
- Use type guards for runtime type checking
- Avoid `any` - use `unknown` when type is truly unknown
- Leverage utility types (Partial, Pick, Omit, etc.)
- Use enums for fixed sets of values (TitleCase naming)

## Type Definitions

- Global types are in `resources/js/types/`
- Component props should be typed with interfaces
- Route types are auto-generated by Wayfinder
- Use TypeScript for all new code

=== eslint/prettier rules ===

# Code Quality Tools

- ESLint 9 with TypeScript support is configured
- Run `npm run lint` to check and auto-fix linting issues
- Prettier is configured for consistent formatting
- Run `npm run format` to format code
- Run `npm run types` to check TypeScript types
- Both tools run automatically during development

## Linting Rules

- No unused variables or imports
- Proper indentation and formatting
- Consistent naming conventions
- Type safety enforcement
- React best practices

</laravel-boost-guidelines>
