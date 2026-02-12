<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DocumentType;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Registro Diario',
                'slug' => 'registro-diario',
                'description' => 'Documentos que deben ser diligenciados diariamente por el personal.'
            ],
            [
                'name' => 'Revisión y Control',
                'slug' => 'revision-control',
                'description' => 'Formatos de verificación y control de calidad.'
            ],
            [
                'name' => 'Auditoría',
                'slug' => 'auditoria',
                'description' => 'Documentos utilizados para procesos de auditoría interna o externa.'
            ],
        ];

        foreach ($types as $type) {
            DocumentType::firstOrCreate(
                ['slug' => $type['slug']],
                $type
            );
        }
    }
}
