<?php

namespace App\Http\Controllers;

use App\Models\UploadType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UploadTypeController extends Controller
{
    public function index(): Response
    {
        $uploadTypes = UploadType::latest()->get();

        return Inertia::render('upload-types/index', [
            'uploadTypes' => $uploadTypes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('upload-types/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'extensions' => 'required|array|min:1',
            'extensions.*' => 'required|string|regex:/^[a-z0-9]+$/i|max:10',
            'max_size' => 'required|integer|min:1|max:5368709120',
        ]);

        UploadType::create($validated);

        return redirect()->route('upload-types.index')->with('success', '上传类型创建成功');
    }

    public function edit(UploadType $uploadType): Response
    {
        return Inertia::render('upload-types/edit', [
            'uploadType' => $uploadType,
        ]);
    }

    public function update(Request $request, UploadType $uploadType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'extensions' => 'required|array|min:1',
            'extensions.*' => 'required|string|regex:/^[a-z0-9]+$/i|max:10',
            'max_size' => 'required|integer|min:1|max:5368709120',
        ]);

        $uploadType->update($validated);

        return redirect()->route('upload-types.index')->with('success', '上传类型更新成功');
    }

    public function destroy(UploadType $uploadType): RedirectResponse
    {
        $uploadType->delete();

        return redirect()->route('upload-types.index')->with('success', '上传类型删除成功');
    }
}
