<!DOCTYPE html>
<html>

<head>
    <title>Recordatorio de Documento</title>
</head>

<body>
    <h1>Hola {{ $user->nombre }}</h1>
    <p>Este es un recordatorio amable para que completes el documento: <strong>{{ $form->name }}</strong>.</p>

    <p>Por favor, ingresa al sistema para realizar tu registro diario.</p>

    <p>Gracias,<br>
        El equipo de MIS HUV</p>
</body>

</html>