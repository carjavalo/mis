<?php
// app/Models/UserDocumentPermission.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDocumentPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_id',
        'can_view',
        'can_edit',
        'can_delete'
    ];

    protected $casts = [
        'can_view' => 'boolean',
        'can_edit' => 'boolean',
        'can_delete' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function document()
    {
        return $this->belongsTo(DynamicForm::class, 'document_id');
    }
}
