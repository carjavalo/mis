<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DynamicForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'table_name',
        'columns_config',
        'created_by',
        'document_type_id',
        'is_notification_enabled',
        'notification_time'
    ];

    protected $casts = [
        'columns_config' => 'array',
        'is_notification_enabled' => 'boolean',
    ];

    public function type()
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }

    public function userPermissions()
    {
        return $this->hasMany(UserDocumentPermission::class, 'document_id');
    }

    /**
     * Usuarios que tienen acceso a este documento
     */
    public function authorizedUsers()
    {
        return $this->belongsToMany(User::class, 'user_document_permissions', 'document_id', 'user_id')
            ->withPivot('can_view', 'can_edit', 'can_delete');
    }
}
