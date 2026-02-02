<?php

namespace App\Http\Controllers;

use App\Models\UploadType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UploadTypeController extends Controller
{
    public function index(): \Inertia\Response
    {
        $uploadTypes = UploadType::latest()->get();

        return Inertia::render('upload-types/index', [
            'uploadTypes' => $uploadTypes,
        ]);
    }

    public function create(): \Inertia\Response
    {
        return Inertia::render('upload-types/create');
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
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

    public function edit(UploadType $uploadType): \Inertia\Response
    {
        return Inertia::render('upload-types/edit', [
            'uploadType' => $uploadType,
        ]);
    }

    public function update(Request $request, UploadType $uploadType): \Illuminate\Http\RedirectResponse
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

    public function destroy(UploadType $uploadType): \Illuminate\Http\RedirectResponse
    {
        $uploadType->delete();

        return redirect()->route('upload-types.index')->with('success', '上传类型删除成功');
    }
}
