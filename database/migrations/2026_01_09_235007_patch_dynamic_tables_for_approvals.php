<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\DynamicForm;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Obtener todos los formularios existentes
        $forms = DynamicForm::all();

        foreach ($forms as $form) {
            // Verificar si la tabla física existe
            if (Schema::hasTable($form->table_name)) {
                Schema::table($form->table_name, function (Blueprint $table) use ($form) {

                    // Añadir columna created_by si no existe
                    if (!Schema::hasColumn($form->table_name, 'created_by')) {
                        $table->unsignedBigInteger('created_by')->nullable()->after('id');
                        $table->index('created_by');
                    }

                    // Añadir columna status si no existe
                    if (!Schema::hasColumn($form->table_name, 'status')) {
                        $table->enum('status', ['draft', 'in_review', 'approved', 'returned'])
                            ->default('draft')
                            ->after('created_by');
                        $table->index('status');
                    }

                    // Añadir columnas de revisión
                    if (!Schema::hasColumn($form->table_name, 'reviewer_id')) {
                        $table->unsignedBigInteger('reviewer_id')->nullable();
                    }
                    if (!Schema::hasColumn($form->table_name, 'reviewed_at')) {
                        $table->timestamp('reviewed_at')->nullable();
                    }
                    if (!Schema::hasColumn($form->table_name, 'review_comments')) {
                        $table->text('review_comments')->nullable();
                    }
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $forms = DynamicForm::all();

        foreach ($forms as $form) {
            if (Schema::hasTable($form->table_name)) {
                Schema::table($form->table_name, function (Blueprint $table) use ($form) {
                    $columns = ['created_by', 'status', 'reviewer_id', 'reviewed_at', 'review_comments'];
                    foreach ($columns as $col) {
                        if (Schema::hasColumn($form->table_name, $col)) {
                            $table->dropColumn($col);
                        }
                    }
                });
            }
        }
    }
};
