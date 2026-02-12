<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $fillable = ['name', 'slug', 'description'];

    public function documents()
    {
        return $this->hasMany(DynamicForm::class);
    }
}
