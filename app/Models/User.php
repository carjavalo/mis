<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; // ← CAMBIO IMPORTANTE
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable  // ← EXTENDER DE Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $fillable = [
        'nombre',
        'correo',
        'password',
        'telefono',
        'rol',
    ];

    protected $casts = [
        'rol' => UserRole::class,
    ];


    public function checkPassword($password)
    {
        return Hash::check($password, $this->password);
    }
    public function documentPermissions()
    {
        return $this->hasMany(UserDocumentPermission::class);
    }

    /**
     * Documentos a los que tiene acceso el usuario
     */
    public function accessibleDocuments()
    {
        return $this->belongsToMany(DynamicForm::class, 'user_document_permissions', 'user_id', 'document_id')
            ->withPivot('can_view', 'can_edit', 'can_delete')
            ->wherePivot('can_view', true);
    }

    /**
     * Verificar si el usuario tiene acceso a un documento
     */
    public function canAccessDocument($documentId, $permission = 'view')
    {
        // Los administradores y super-administradores tienen acceso completo a todo
        if ($this->rol === UserRole::ADMIN || $this->rol === UserRole::SUPER_ADMIN) {
            return true;
        }

        $permissionRecord = $this->documentPermissions()
            ->where('document_id', $documentId)
            ->first();

        if (!$permissionRecord) {
            return false;
        }

        switch ($permission) {
            case 'view':
                return $permissionRecord->can_view;
            case 'edit':
                return $permissionRecord->can_edit;
            case 'delete':
                return $permissionRecord->can_delete;
            default:
                return false;
        }
    }
}
