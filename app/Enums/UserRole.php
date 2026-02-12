<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super-admin';
    case USER = 'user';
    case EDITOR = 'editor';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}