<?php

use App\Models\User;
use App\Models\DynamicForm;
use App\Models\DocumentType;
use App\Models\UserDocumentPermission;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "1. Getting User...\n";
    $user = User::first();
    if (!$user)
        throw new Exception("No user found.");

    echo "2. Getting DocumentType...\n";
    $type = DocumentType::firstOrCreate(
        ['slug' => 'test-type'],
        ['name' => 'Test Type', 'description' => 'Test Desc']
    );

    echo "3. UpdateOrCreate DynamicForm...\n";
    $form = DynamicForm::updateOrCreate(
        ['slug' => 'test-reminders-form'],
        [
            'name' => 'Formulario de Prueba Notificaciones',
            'table_name' => 'form_test_reminders_dummy',
            'columns_config' => [
                ['name' => 'test_field', 'type' => 'string', 'label' => 'Campo Prueba', 'required' => false, 'options' => null]
            ],
            'created_by' => $user->id,
            'document_type_id' => $type->id,
            'is_notification_enabled' => true,
            'notification_time' => '10:00'
        ]
    );
    echo "Form ID: " . $form->id . "\n";

    echo "4. Assign Permission...\n";
    UserDocumentPermission::updateOrCreate(
        [
            'user_id' => $user->id,
            'document_id' => $form->id
        ],
        ['can_view' => true]
    );

    echo "SUCCESS\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    if ($e instanceof \Illuminate\Database\QueryException) {
        echo "SQL: " . $e->getSql() . "\n";
    }
}
