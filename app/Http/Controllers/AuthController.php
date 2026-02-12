<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required|string',
        ]);

        // Buscar usuario por correo
        $user = User::where('correo', $request->correo)->first();

        // Verificar usuario y contraseña
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales son incorrectas.'],
            ]);
        }

        // Crear token de acceso
        $token = $user->createToken('auth-token')->plainTextToken;

        // Cargar permisos
        $user->load('documentPermissions');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'correo' => $user->correo,
                'telefono' => $user->telefono,
                'rol' => $user->rol->value, // Explicitly get the enum value
                'document_permissions' => $user->documentPermissions, // 🔽 Include permissions
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        // Revocar el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        // Cargar permisos
        $request->user()->load('documentPermissions');

        // Retornar información del usuario autenticado
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'nombre' => $request->user()->nombre,
                'correo' => $request->user()->correo,
                'telefono' => $request->user()->telefono,
                'rol' => $request->user()->rol->value, // Explicitly get the enum value
                'document_permissions' => $request->user()->documentPermissions, // 🔽 Include permissions
            ]
        ]);
    }
}