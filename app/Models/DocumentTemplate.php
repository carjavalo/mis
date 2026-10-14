<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'codigo',
        'document_type_id',
        'version',
        'vigencia',
        'columns_config',
        'created_by',
    ];

    protected $casts = [
        'columns_config' => 'array',
        'vigencia' => 'date:Y-m-d',
    ];

    public function type()
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }
}
