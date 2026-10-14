<?php

namespace App\Http\Controllers;

use App\Models\DocumentTemplate;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DocumentTemplateController extends Controller
{
    // Listar plantillas (para el selector y el módulo de gestión)
    public function index()
    {
        $templates = DocumentTemplate::with('type')->orderBy('nombre')->get();
        return response()->json($templates);
    }

    // Obtener una plantilla específica
    public function show($id)
    {
        $template = DocumentTemplate::with('type')->findOrFail($id);
        return response()->json($template);
    }

    // Crear plantilla
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/', 'unique:document_templates,codigo'],
            'document_type_id' => 'nullable|exists:document_types,id',
            'version' => 'nullable|string|max:20',
            'vigencia' => 'nullable|date',
            'columns_config' => 'required|array|min:1',
        ], [
            'codigo.unique' => 'Ya existe una plantilla con ese código.',
            'codigo.regex' => 'El código solo puede contener letras, números y guiones.',
        ]);

        $template = DocumentTemplate::create([
            'nombre' => $validated['nombre'],
            'codigo' => $validated['codigo'],
            'document_type_id' => $validated['document_type_id'] ?? null,
            'version' => $validated['version'] ?? null,
            'vigencia' => $validated['vigencia'] ?? null,
            'columns_config' => $validated['columns_config'],
            'created_by' => $request->user()->id ?? null,
        ]);

        return response()->json([
            'message' => 'Plantilla creada exitosamente',
            'template' => $template,
        ], 201);
    }

    // Actualizar plantilla
    public function update(Request $request, $id)
    {
        $template = DocumentTemplate::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'codigo' => ['sometimes', 'string', 'max:255', 'regex:/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/', Rule::unique('document_templates', 'codigo')->ignore($id)],
            'document_type_id' => 'nullable|exists:document_types,id',
            'version' => 'nullable|string|max:20',
            'vigencia' => 'nullable|date',
            'columns_config' => 'sometimes|array|min:1',
        ]);

        $template->update($validated);

        return response()->json([
            'message' => 'Plantilla actualizada exitosamente',
            'template' => $template,
        ]);
    }

    // Eliminar plantilla
    public function destroy($id)
    {
        $template = DocumentTemplate::findOrFail($id);
        $template->delete();

        return response()->json(['message' => 'Plantilla eliminada exitosamente']);
    }
}
