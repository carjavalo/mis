<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dynamic_forms', function (Blueprint $table) {
            $table->foreignId('document_type_id')->nullable()->constrained('document_types')->nullOnDelete();
            $table->boolean('is_notification_enabled')->default(false);
            $table->time('notification_time')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dynamic_forms', function (Blueprint $table) {
            $table->dropForeign(['document_type_id']);
            $table->dropColumn(['document_type_id', 'is_notification_enabled', 'notification_time']);
        });
    }
};
