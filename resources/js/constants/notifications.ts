export interface NotificationCopy {
  title: string;
  description?: string;
}

export const notificationMessages = {
  auth: {
    loginSuccess: {
      title: "Sesión iniciada",
      description: "Bienvenido de nuevo. Estamos preparando tu panel.",
    },
    loginError: {
      title: "No pudimos iniciar sesión",
      description: "Verifica tu correo y contraseña e inténtalo nuevamente.",
    },
  },
  users: {
    loadError: {
      title: "No pudimos cargar la lista de usuarios.",
      description: "Recarga la página o vuelve a intentarlo en unos segundos.",
    },
    createSuccess: {
      title: "Usuario creado correctamente",
      description: "El nuevo usuario ya aparece en la tabla.",
    },
    createError: {
      title: "No pudimos crear al usuario.",
      description: "Revisa la información ingresada e inténtalo de nuevo.",
    },
    updateSuccess: {
      title: "Usuario actualizado",
      description: "Los cambios se guardaron exitosamente.",
    },
    updateError: {
      title: "No pudimos actualizar al usuario.",
      description: "Intenta de nuevo o contacta al administrador.",
    },
    deleteSuccess: {
      title: "Usuario eliminado",
      description: "El usuario ya no tendrá acceso al sistema.",
    },
    deleteError: {
      title: "No pudimos eliminar al usuario.",
      description: "Vuelve a intentarlo en unos segundos.",
    },
  },
  forms: {
    loadError: {
      title: "No pudimos cargar los formularios.",
      description: "Recarga la vista para volver a intentarlo.",
    },
    createSuccess: {
      title: "Formulario creado",
      description: "Ya puedes configurar los campos y compartirlo.",
    },
    deleteSuccess: {
      title: "Formulario eliminado",
      description: "Se eliminaron todos los registros asociados.",
    },
    deleteError: {
      title: "No pudimos eliminar el formulario.",
      description: "Verifica que tengas permisos y vuelve a intentarlo.",
    },
  },
  records: {
    loadSuccess: {
      title: "Registros actualizados",
      description: "Mostramos la información más reciente disponible.",
    },
    loadError: {
      title: "No pudimos cargar los registros.",
      description: "Recarga la sección para volver a intentarlo.",
    },
    createSuccess: {
      title: "Registro creado",
      description: "Se guardó correctamente en el documento.",
    },
    createError: {
      title: "No pudimos crear el registro.",
      description: "Revisa la información y vuelve a intentarlo.",
    },
    updateSuccess: {
      title: "Registro actualizado",
      description: "Los cambios se guardaron correctamente.",
    },
    updateError: {
      title: "No pudimos actualizar el registro.",
      description: "Vuelve a intentarlo más tarde.",
    },
    deleteSuccess: {
      title: "Registro eliminado",
      description: "La tabla ya está actualizada.",
    },
    deleteError: {
      title: "No pudimos eliminar el registro.",
      description: "Recarga la página e inténtalo de nuevo.",
    },
  },
} as const;

export type NotificationSection = keyof typeof notificationMessages;

export type NotificationKey<S extends NotificationSection> =
  keyof (typeof notificationMessages)[S];

export const getNotificationCopy = <
  S extends NotificationSection,
  K extends NotificationKey<S>
>(
  section: S,
  key: K
): NotificationCopy => {
  const copy = notificationMessages[section][key] as NotificationCopy | undefined;
  if (copy) return copy;
  return { title: "Acción realizada" };
};
