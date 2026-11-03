import { finalTranslations } from './final-translations';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type AppLanguage = 'es' | 'en';

const LANGUAGE_STORAGE_KEY = 'volcan-santa-maria-language';

const resources = {
  es: {
    translation: {
      offline: {
        notice: 'Sin conexión. Ves los últimos datos guardados; el mapa y tu ubicación siguen funcionando.',
        actionNotSaved: 'Sin conexión: no se pudo completar y nada se guardó. Inténtalo de nuevo cuando tengas señal.',
        mapSaved: 'Mapa guardado: funciona sin conexión.',
        mapSaving: 'Guardando el mapa para usarlo sin conexión. Mantén la señal un momento.',
      },
      common: {
        brand: 'Volcán Santa María',
        email: 'Correo electrónico',
        password: 'Contraseña',
        firstName: 'Nombre',
        lastName: 'Apellido',
        phone: 'Teléfono',
        cancel: 'Cancelar',
        close: 'Cerrar',
        signOut: 'Cerrar sesión',
        signingOut: 'Cerrando sesión…',
        unavailable: 'No disponible',
        language: 'Idioma',
        closeNotification: 'Cerrar notificación',
        confirmAction: 'Confirmar acción',
        openCalendar: 'Abrir calendario para {{field}}',
        chooseDate: 'Seleccionar {{field}}',
        month: 'Mes',
        year: 'Año',
        dateFormatHelp: 'DD/MM/AAAA',
      },
      auth: {
        checkingSession: 'Verificando sesión…',
        loginTitle: 'Iniciar sesión',
        loginSubtitle: 'Ingresa con tu correo electrónico para continuar.',
        loginHeroSubtitle: 'Guía para su ascenso',
        loginSubmit: 'Ingresar',
        loggingIn: 'Ingresando…',
        noAccount: '¿Aún no tienes una cuenta?',
        createAccountLink: 'Crear cuenta',
        registerTitle: 'Crear cuenta',
        registerSubtitle: 'Regístrate para comenzar tu experiencia.',
        confirmPassword: 'Confirmar contraseña',
        creatingAccount: 'Creando cuenta…',
        alreadyRegistered: '¿Ya tienes una cuenta?',
        loginLink: 'Iniciar sesión',
        confirmationRequired:
          'Cuenta creada. Revisa tu correo y confirma la cuenta antes de iniciar sesión.',
        accountCreatedTitle: 'Cuenta creada',
        accountCreatedToast: 'Cuenta creada correctamente',
        emailConfirmedToast: 'Correo confirmado correctamente',
        emailConfirmedToastDescription: 'Completa tus datos para continuar.',
        confirmationSentTo:
          'Te enviamos un enlace de confirmación a {{email}}.',
        confirmationRequiredForVisits:
          'Confirma tu correo para poder registrar o unirte a un ascenso.',
        confirmationEmailResent:
          'Si la cuenta puede recibir un correo de confirmación, enviaremos un nuevo enlace.',
        resendConfirmation: 'Reenviar correo',
        resendingConfirmation: 'Reenviando…',
        resendAvailableIn: 'Reenviar en {{seconds}} s',
        backHome: 'Volver al inicio',
        forgotPassword: '¿Olvidaste tu contraseña?',
        forgotPasswordTitle: 'Recuperar contraseña',
        forgotPasswordSubtitle:
          'Ingresa tu correo para solicitar un enlace de recuperación.',
        passwordResetRequestSent:
          'Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña.',
        sendPasswordReset: 'Enviar enlace',
        sendingPasswordReset: 'Enviando…',
        resetPasswordAction: 'Restablecer contraseña',
        backToLogin: 'Volver a iniciar sesión',
        newPasswordTitle: 'Restablecer contraseña',
        newPasswordSubtitle: 'Crea una contraseña nueva para tu cuenta.',
        newPassword: 'Nueva contraseña',
        confirmNewPassword: 'Confirmar nueva contraseña',
        updatePassword: 'Actualizar contraseña',
        updatingPassword: 'Actualizando…',
        passwordUpdatedToast: 'Contraseña actualizada correctamente',
        activeSession: 'Sesión activa',
        welcome: '¡Bienvenido, {{name}}!',
        welcomeGeneric: '¡Bienvenido!',
        authenticated: 'Tu cuenta está autenticada correctamente.',
        editProfile: 'Editar perfil',
        myProfile: 'Mi perfil',
        showPassword: 'Mostrar contraseña',
        hidePassword: 'Ocultar contraseña',
        verificationPersistentNotice:
          'Confirma tu correo para habilitar el registro de ascensos.',
      },
      theme: {
        label: 'Tema',
        light: 'Claro',
        dark: 'Oscuro',
        switchToLight: 'Cambiar a tema claro',
        switchToDark: 'Cambiar a tema oscuro',
      },
      legal: {
        entity: 'Alcaldía Indígena de Llanos del Pinal',
        menu: 'Privacidad y términos',
        centerIntro: 'Consulte los documentos vigentes de la aplicación.',
        version: 'Versión {{version}}',
        consent: {
          title: 'Aceptación requerida',
          existingUser:
            'Antes de continuar, revise y acepte los documentos vigentes. Su información existente no será modificada.',
          label:
            'He leído y acepto los Términos y Condiciones y la Política de Privacidad.',
          required: 'Debe aceptar los documentos para completar el registro.',
          accept: 'Aceptar y continuar',
          saving: 'Guardando aceptación…',
          error: 'No fue posible guardar su aceptación. Inténtelo nuevamente.',
        },
        privacy: {
          title: 'Política de Privacidad',
          sections: [
            {
              title: 'Responsable y datos tratados',
              body: 'La Alcaldía Indígena de Llanos del Pinal es la entidad responsable. Según las funciones utilizadas, la aplicación puede tratar nombre, apellido, fecha de nacimiento, sexo, nacionalidad, departamento para Guatemala, teléfono, DPI/CUI o pasaporte, contacto de emergencia, avatar, ascensos, historial, retornos, notificaciones y datos de menores acompañantes como nombre, edad, sexo y parentesco.',
            },
            {
              title: 'Finalidades',
              body: 'Los datos se utilizan para identificar visitantes, organizar y controlar ascensos, apoyar la atención de incidentes o retrasos, gestionar retornos, facilitar el contacto de emergencia, producir información operativa o estadística y permitir el funcionamiento de la aplicación.',
            },
            {
              title: 'Ubicación en el dispositivo',
              body: 'La ubicación GPS mostrada en el mapa se utiliza únicamente en el dispositivo como referencia. No se almacena en la base de datos de la aplicación ni se comparte con la Alcaldía Indígena de Llanos del Pinal u otros usuarios.',
            },
            {
              title: 'Menores y conservación',
              body: 'Los menores no reciben una cuenta. Sus datos quedan ligados al ascenso y al adulto que los registró como responsable. El acceso administrativo se limita mediante roles, permisos y auditoría, y los registros se conservan conforme a las necesidades operativas y obligaciones aplicables.',
            },
          ],
        },
        terms: {
          title: 'Términos y Condiciones',
          sections: [
            {
              title: 'Alcance de la aplicación',
              body: 'La aplicación es una herramienta informativa y de apoyo de la Alcaldía Indígena de Llanos del Pinal. No es un servicio de rescate, un sistema de navegación profesional ni un servicio de monitoreo permanente, y no sustituye a un guía local o a los servicios de emergencia.',
            },
            {
              title: 'Condiciones variables',
              body: 'El mapa, GPS, clima, ruta y tiempos son referencias que pueden presentar variaciones. El terreno, la actividad volcánica y las condiciones meteorológicas pueden cambiar. Cada visitante debe atender las instrucciones de las autoridades competentes y actuar con prudencia.',
            },
            {
              title: 'Disponibilidad',
              body: 'La aplicación no puede garantizar disponibilidad continua de internet, GPS, mapas, pronósticos u otros servicios externos. Estas limitaciones razonables no reducen los derechos que correspondan a las personas usuarias.',
            },
            {
              title: 'Donaciones',
              body: 'Las donaciones serán voluntarias, no son requisito para usar la aplicación y la aplicación continuará siendo gratuita. Cuando PayPal esté habilitado, la transacción ocurrirá fuera de esta PWA y estará sujeta a los términos y políticas de PayPal.',
            },
          ],
        },
        safety: {
          title: 'Aviso de Seguridad',
          sections: [
            {
              title: 'Herramienta de apoyo',
              body: 'Esta aplicación sirve únicamente como herramienta de apoyo. Las condiciones del clima, terreno, señal GPS y actividad volcánica pueden cambiar.',
            },
            {
              title: 'Referencias y autoridades',
              body: 'El mapa y la ubicación son referencias y pueden presentar errores de precisión. La aplicación no sustituye un guía local, las indicaciones de las autoridades competentes ni los servicios de emergencia.',
            },
          ],
        },
      },
      profile: {
        loading: 'Cargando perfil…',
        loadErrorTitle: 'No pudimos cargar tu perfil',
        loadErrorSubtitle: 'Revisa tu conexión y vuelve a intentarlo.',
        retry: 'Reintentar',
        completeTitle: 'Completa tu perfil',
        editTitle: 'Editar perfil',
        subtitle:
          'Comparte únicamente la información esencial para identificarte y atender una emergencia.',
        personalInformation: 'Información personal',
        identity: 'Identidad visual',
        avatar: {
          kinds: {
            uploaded: 'Subir fotografía',
            preset: 'Elegir avatar',
            initials: 'Usar iniciales',
          },
          choosePhoto: 'Seleccionar fotografía',
          processing: 'Procesando fotografía…',
          photoHelp:
            'JPG, PNG o WebP. Máximo 8 MB; se recorta y convierte a WebP.',
          photoRequired: 'Seleccione una fotografía para usar esta opción.',
          presetRequired: 'Seleccione un avatar prediseñado.',
          tooLarge: 'La fotografía supera el límite de 8 MB.',
          unsupported: 'Utilice una fotografía JPG, PNG o WebP.',
          processingFailed: 'No fue posible procesar la fotografía.',
          presets: {
            mountain: 'Montaña',
            volcano: 'Volcán',
            pine: 'Pino',
            compass: 'Brújula',
            hiking: 'Senderismo',
            sunrise: 'Amanecer',
            forest: 'Bosque',
            summit: 'Cima',
          },
        },
        nationality: 'Nacionalidad',
        department: 'Departamento',
        selectDepartment: 'Seleccione un departamento',
        sex: 'Sexo',
        sexOptions: { male: 'Masculino', female: 'Femenino' },
        dateOfBirth: 'Fecha de nacimiento',
        documentType: 'Tipo de documento',
        documentNumber: 'Número de documento',
        emergencyContact: 'Contacto de emergencia',
        relationship: 'Parentesco',
        selectOption: 'Selecciona una opción',
        documentTypes: {
          dpi: 'DPI / CUI',
          passport: 'Pasaporte',
          other: 'Otro',
        },
        save: 'Guardar perfil',
        saving: 'Guardando…',
        registrationCompleted: 'Registro completado exitosamente',
        relationships: {
          parent: 'Madre o padre',
          spouse: 'Pareja o cónyuge',
          sibling: 'Hermana o hermano',
          child: 'Hija o hijo',
          relative: 'Otro familiar',
          friend: 'Amistad',
          other: 'Otro',
        },
        validation: {
          nationalityRequired: 'Selecciona una nacionalidad.',
          departmentRequired:
            'Selecciona tu departamento cuando la nacionalidad es Guatemala.',
          sexRequired: 'Selecciona el sexo.',
          dateOfBirthRequired: 'Selecciona una fecha de nacimiento.',
          dateOfBirthInvalid:
            'Selecciona una fecha de nacimiento válida y razonable.',
          phoneRequired: 'Falta el teléfono.',
          phoneInvalid: 'Ingresa un teléfono válido para el país seleccionado.',
          documentTypeRequired: 'Selecciona el tipo de documento.',
          documentNumberRequired: 'Falta el número de documento.',
          documentNumberInvalid:
            'Ingresa un número de documento válido de 3 a 40 caracteres.',
          emergencyFirstNameRequired:
            'Falta el nombre del contacto de emergencia.',
          emergencyFirstNameInvalid:
            'Ingresa un nombre válido para el contacto de emergencia.',
          emergencyLastNameRequired:
            'Falta el apellido del contacto de emergencia.',
          emergencyLastNameInvalid:
            'Ingresa un apellido válido para el contacto de emergencia.',
          relationshipRequired: 'Selecciona el parentesco.',
          emergencyPhoneRequired:
            'Falta el teléfono del contacto de emergencia.',
          emergencyPhoneInvalid:
            'Ingresa un teléfono válido para el contacto de emergencia.',
        },
      },
      country: {
        search: 'Escribe para buscar un país',
        noResults: 'No se encontraron países',
      },
      phone: {
        countryPrefix: 'País y prefijo telefónico',
        localNumber: 'Número local',
      },
      visits: {
        minors: {
          question: '¿Viajan menores de edad?',
          responsibleHelp:
            'Cada menor debe viajar con un adulto responsable del mismo ascenso.',
          responsibleCurrentUser: 'Adulto responsable: organizador del ascenso',
          responsible: 'Responsable',
          item: 'Menor {{number}}',
          fullName: 'Nombre completo',
          age: 'Edad',
          relationship: 'Parentesco',
          relationshipExample: 'Ej. Hijo/a, hermano/a, sobrino/a',
          selectRelationship: 'Seleccione parentesco',
          relationshipDetail: 'Especifique parentesco',
          relationships: {
            child: 'Hijo/a',
            sibling: 'Hermano/a',
            niece_nephew: 'Sobrino/a',
            grandchild: 'Nieto/a',
            cousin: 'Primo/a',
            other: 'Otro',
          },
          add: 'Agregar otro menor',
          remove: 'Retirar menor',
          validation:
            'Complete correctamente los datos de todos los menores (edad entre 0 y 17 años).',
          consent:
            'Confirmo que soy el adulto responsable del menor durante este ascenso y autorizo el registro de los datos necesarios para la gestión del recorrido.',
          consentRequired:
            'Debe confirmar su responsabilidad y autorización para registrar menores.',
        },
        loading: 'Buscando tu ascenso activo…',
        title: 'Ascenso al Volcán Santa María',
        subtitle: 'Crea un grupo o ingresa el código que te compartieron.',
        back: '← Volver',
        route: 'Ruta',
        summitRoute: 'Ascenso a la Cima',
        tripType: 'Tipo de ascenso',
        startMode: {
          title: '¿Cuándo desea ascender?',
          start: 'Inicio',
          todayNow: 'Hoy · ahora',
          now: {
            title: 'Ascender ahora',
            description:
              'Forme el grupo y registre el inicio real cuando esté listo.',
          },
          scheduled: {
            title: 'Planificar ascenso',
            description: 'Defina una fecha y hora para iniciar más adelante.',
          },
        },
        types: {
          day_hike: 'Ascenso de un día',
          expedition_camping: 'Expedición y campamento',
        },
        expectedReturn: 'Retorno estimado',
        plannedStart: 'Inicio planificado',
        startDate: 'Fecha planificada de inicio',
        startTime: 'Hora planificada de inicio',
        returnDate: 'Fecha estimada de regreso',
        returnTime: 'Hora estimada de regreso',
        timePicker: {
          hour: 'Hora',
          minute: 'Minutos',
        },
        localGuide: 'Guía local',
        guideName: 'Nombre del guía',
        participants: 'Participantes',
        organizer: 'Organizador',
        memberStatus: {
          ready: 'En el grupo',
          active: 'En recorrido',
          returning_early: 'Regresando antes',
          returned_early: 'Retorno anticipado confirmado',
          completed: 'Completó el ascenso',
          withdrawn_before_start: 'Se retiró antes de iniciar',
        },
        members: {
          withdraw: 'Retirarme del grupo',
          withdrawConfirm:
            '¿Confirmas que deseas retirarte de este grupo antes de iniciar?',
          remove: 'Retirar del grupo',
          removeConfirm:
            '¿Retirar a {{name}} del grupo? Su registro se conservará en el historial.',
          markEarlyReturn: 'Registrar retorno anticipado',
          markEarlyReturnFor: 'Retorno anticipado de {{name}}',
        },
        earlyReturn: {
          action: 'Retorno anticipado',
          title: 'Retorno anticipado',
          organizerTitle: 'Retorno anticipado de {{name}}',
          reason: 'Motivo',
          selectReason: 'Seleccione el motivo:',
          reasons: {
            physical_discomfort: 'Enfermedad o malestar físico',
            injury: 'Lesión o esguince',
            emergency: 'Emergencia',
            personal_decision: 'Decisión personal',
            other: 'Otro',
          },
          notes: 'Observaciones (opcional)',
          reasonRequired: 'Selecciona un motivo para continuar.',
          confirm: 'Confirmar retorno anticipado',
          organizerConfirm: 'Confirmar retorno anticipado',
          saving: 'Guardando…',
          checkout: 'Ya llegué al punto de control',
          checkoutConfirm: '¿Confirmas que ya llegaste al punto de control?',
        },
        options: {
          title: 'Opciones del ascenso',
        },
        history: {
          title: 'Historial de ascensos',
          loading: 'Cargando historial…',
          empty: 'Aún no tienes ascensos en tu historial.',
          individual: 'Individual',
          group: 'Grupal',
          groupOrganizer: 'Grupal · Organizador',
          groupWithCount_one: 'Grupal · {{count}} participante',
          groupWithCount_other: 'Grupal · {{count}} participantes',
          organizer: 'Organizador',
          createdByAdministration: 'Creado por administración',
          finalizedByAdministration: 'Finalizado por administración',
          startedAt: 'Inicio',
          endedAt: 'Finalización',
          duration: 'Duración',
          durationHoursMinutes: '{{hours}} h {{minutes}} min',
          durationMinutes: '{{minutes}} min',
          loadMore: 'Cargar más',
          loadingMore: 'Cargando…',
          viewMembers: 'Ver integrantes',
          hideMembers: 'Ocultar integrantes',
          membersTitle: 'Integrantes',
          loadingMembers: 'Cargando integrantes…',
          memberStatus: {
            active: 'En curso',
            returningEarly: 'Regresando antes',
            returnedEarly: 'Retorno anticipado',
            withdrawn: 'Se retiró antes de iniciar',
            completed: 'Completado',
          },
          status: {
            active: 'En curso',
            returningEarly: 'Regresando antes',
            returnedEarly: 'Retorno anticipado',
            withdrawn: 'Se retiró antes de iniciar',
            completed: 'Completado',
            cancelled: 'Cancelado',
          },
        },
        terms:
          'He leído y acepto las normas y recomendaciones para realizar el ascenso.',
        recommendationsConsent:
          'He leído y acepto las recomendaciones para realizar el ascenso.',
        viewRecommendations: 'Ver recomendaciones',
        create: {
          action: 'Crear ascenso',
          title: 'Crear ascenso',
          localGuideQuestion: '¿Viajas con guía local?',
          cancelMessage:
            '¿Desea cancelar la creación del ascenso?\n\nLa información ingresada se perderá.',
          continueEditing: 'Continuar editando',
          discard: 'Descartar',
          submit: 'Crear grupo',
          creating: 'Creando grupo…',
        },
        join: {
          action: 'Unirme a un grupo',
          title: 'Unirme a un grupo',
          code: 'Código del grupo',
          submit: 'Unirme al grupo',
          joining: 'Uniéndome…',
        },
        group: {
          preparing: 'En preparación',
          pendingReturns: 'Retornos pendientes',
          title: 'Grupo para el ascenso',
          code: 'Código',
          copyCode: 'Copiar código',
          share: 'Compartir código',
          codeCopied: 'Código copiado.',
          shared: 'Código compartido.',
          shareCopied: 'Invitación copiada para compartir.',
          shareText: 'Únete a mi grupo para {{route}}. Código: {{code}}',
        },
        start: {
          slide: 'Desliza para iniciar',
          starting: 'Iniciando…',
          scheduled: 'Ascenso programado',
          availableAt: 'Podrá iniciarlo a partir de:',
        },
        inProgress: {
          status: 'En curso',
          title: 'Ascenso en curso',
          startedAt: 'Inicio',
          route: 'Recomendaciones',
          map: 'Mapa',
          gallery: 'Galería',
          futureFeature: '{{feature}} se implementará posteriormente.',
        },
        cancel: {
          action: 'Cancelar ascenso',
          cancelling: 'Cancelando…',
          confirm:
            '¿Cancelar este ascenso? El grupo dejará de estar disponible.',
        },
        complete: {
          action: 'Finalizar ascenso',
          completing: 'Finalizando…',
          confirm: '¿Confirmas que has finalizado tu recorrido?',
          success: 'Ascenso finalizado correctamente.',
          completed: 'Finalizado',
          title: 'Ascenso finalizado',
          back: 'Volver al inicio',
        },
        validation: {
          startDateRequired: 'Selecciona una fecha planificada de inicio.',
          startDatePast: 'La fecha de inicio no puede ser anterior a hoy.',
          startDateInvalid: 'Ingresa una fecha de inicio válida.',
          startTimeRequired: 'Selecciona una hora planificada de inicio.',
          futureStart:
            'La fecha y hora de inicio deben ser posteriores al momento actual.',
          startBeforeReturn:
            'El inicio planificado debe ser anterior al retorno estimado.',
          returnDateRequired: 'Selecciona una fecha estimada de regreso.',
          returnDatePast: 'La fecha de regreso no puede ser anterior a hoy.',
          returnDateInvalid: 'Ingresa una fecha de regreso válida.',
          returnTimeRequired: 'Selecciona una hora estimada de regreso.',
          futureReturn:
            'La fecha y hora de regreso deben ser posteriores al momento actual.',
          guideName: 'Ingresa el nombre del guía local.',
          acceptTerms: 'Debes aceptar las normas y recomendaciones.',
          acceptRecommendations:
            'Debes leer y aceptar las recomendaciones para continuar.',
          invalidCode: 'Ingresa un código válido de 6 caracteres.',
        },
        errors: {
          loadTitle: 'No pudimos cargar tu ascenso',
          alreadyActive: 'Ya perteneces a un ascenso activo.',
          codeNotFound: 'No encontramos un grupo con ese código.',
          notAccepting: 'Ese grupo ya no acepta integrantes.',
          profileRequired: 'Completa tu perfil antes de continuar.',
          accessDenied: 'No tienes acceso a ese grupo.',
          emailVerificationRequired:
            'Debes confirmar tu correo antes de registrar un ascenso.',
          scheduledStartNotReached:
            'El ascenso programado todavía no puede iniciarse.',
          copyFailed: 'No se pudo copiar el código.',
          shareFailed: 'No se pudo compartir el código.',
          generic: 'No se pudo completar la acción. Inténtalo de nuevo.',
          minorConsentRequired: 'Debe confirmar la responsabilidad sobre los menores antes de continuar.',
          invalidMinorData: 'Revise el nombre, edad, sexo y parentesco de cada menor.',
          adultRequiredForMinors: 'Solo una persona adulta puede registrar menores a su cargo.',
        },
      },
      routes: {
        eyebrow: 'Ruta informativa',
        title: 'Ruta: {{route}}',
        open: 'Ver información de la ruta',
        tabsLabel: 'Secciones de la ruta',
        tabs: {
          recommendations: 'Recomendaciones',
          map: 'Mapa',
          weather: 'Clima',
          gallery: 'Galería',
          donations: 'Donaciones',
        },
        loading: 'Cargando información de la ruta…',
        loadError: 'No pudimos cargar la información de la ruta.',
        cachedData: 'Mostrando la información guardada en este dispositivo.',
        noDescription: 'Aún no hay una descripción disponible para esta ruta.',
        difficulty: 'Dificultad',
        distance: 'Distancia',
        duration: 'Duración estimada',
        elevationGain: 'Desnivel positivo',
        noCheckpoints: 'Aún no hay puntos de referencia publicados.',
        noPhotos: 'Aún no hay fotografías publicadas.',
        photosLoadError:
          'No fue posible cargar las fotografías en este momento.',
        routePhotos: 'Fotografías de la ruta',
        photos: {
          previous: 'Fotografía anterior',
          next: 'Fotografía siguiente',
          position: '{{current}} de {{total}}',
          goTo: 'Ver fotografía {{number}}',
          pause: 'Pausar',
          resume: 'Reanudar',
        },
        altitude: '{{altitude}} m de altitud',
        map: {
          loading: 'Cargando mapa…',
          loaded: 'Mapa cargado correctamente.',
          loadError: 'No pudimos cargar el mapa.',
          mapLabel: 'Mapa interactivo del Volcán Santa María',
          baseMapControl: 'Seleccionar mapa base',
          mapBase: 'Mapa',
          satelliteBase: 'Satélite',
          satelliteUnavailable:
            'Configura VITE_MAPTILER_KEY para habilitar Satélite.',
          satelliteLoadError:
            'No fue posible cargar Satélite. Se restauró la vista Mapa.',
          recenter: 'Volver a centrar en el volcán',
          myLocation: 'Mi ubicación',
          locating: 'Buscando su ubicación…',
          youAreHere: 'Usted está aquí',
          accuracy: 'Precisión aproximada: ±{{accuracy}} m',
          locationPrivacy:
            'Su ubicación se utiliza únicamente como referencia mientras mantiene abierto el mapa. No se almacena ni se comparte.',
          locationUnavailable:
            'La ubicación no está disponible en este navegador o contexto. Puede continuar consultando la ruta normalmente.',
          locationErrors: {
            permissionDenied:
              'No se pudo acceder a su ubicación. Puede continuar consultando la ruta normalmente.',
            positionUnavailable:
              'No fue posible determinar su ubicación en este momento. Inténtelo nuevamente.',
            timeout:
              'La ubicación tardó demasiado en responder. Puede intentarlo nuevamente.',
          },
          selectedPoint: 'Información del punto seleccionado',
          closeDetails: 'Cerrar información',
          volcanoReference: 'Referencia del volcán',
          summitMarkerLabel: 'Ver información del Volcán Santa María',
          startMarkerLabel: 'Inicio de la ruta de ascenso',
          routeStart: 'Inicio',
          checkpointMarkerLabel: 'Ver punto de referencia: {{name}}',
          trackPending: 'Trazado detallado pendiente de incorporar.',
          noCheckpoints:
            'Aún no hay puntos de referencia con coordenadas para mostrar.',
          mediaLoadError:
            'El mapa está disponible, pero no fue posible cargar sus fotografías.',
        },
        stats: {
          title: 'Ruta de ascenso a la cima',
          distance: 'Distancia aproximada de ascenso',
          gain: 'Desnivel positivo',
          time: 'Tiempo registrado de referencia',
          disclaimer:
            'El tiempo corresponde a un recorrido de referencia y puede variar según las condiciones climáticas, el terreno y el ritmo del grupo.',
        },
        santiaguito: {
          title: 'Área restringida — Volcán Santiaguito',
          body: 'No intente ascender ni acercarse al complejo volcánico Santiaguito. La actividad volcánica puede representar un peligro grave por explosiones, caída de ceniza, avalanchas, flujos piroclásticos y lahares.',
          scope: 'Esta aplicación proporciona únicamente información para la ruta del Volcán Santa María. Respete las disposiciones de las autoridades competentes.',
          source: 'Fuente: CONRED / INSIVUMEH.',
        },
        gallery: {
          title: 'Galería del Volcán Santa María',
          empty: 'Aún no hay fotografías activas en la galería.',
        },
        donations: {
          title: 'Donaciones',
          heading: 'Apoye la conservación del Volcán Santa María',
          body: 'Su aporte podrá contribuir a la limpieza del sendero, mantenimiento del recorrido, señalización y acciones de seguridad. La aplicación continuará siendo gratuita para todos los visitantes.',
          button: 'Donar con PayPal',
          comingSoon: 'Próximamente',
          free: 'Las donaciones serán voluntarias y no son requisito para usar la aplicación.',
        },
        checkpointTypes: {
          start: 'Inicio',
          reference: 'Referencia',
          rest: 'Descanso',
          viewpoint: 'Mirador',
          summit: 'Cima',
        },
        recommendations: {
          intro:
            'Prepárese con anticipación y tome decisiones prudentes durante todo el ascenso.',
          sections: {
            preparation: 'Preparación',
            safety: 'Seguridad',
            weather: 'Clima',
            environment: 'Protección del entorno',
          },
          items: {
            waterFood: 'Lleve suficiente agua y alimentos para el recorrido.',
            footwear: 'Utilice calzado adecuado para senderismo.',
            properClothing: 'Lleve ropa apropiada para frío, viento y lluvia.',
            flashlight: 'Lleve linterna y suficiente batería.',
            localGuide:
              'Considere realizar el ascenso con un guía local, especialmente si no conoce la ruta.',
            whistle: 'Lleve un silbato.',
            firstAid: 'Lleve un botiquín básico de primeros auxilios.',
            remainOnRoute: 'Permanezca en la ruta establecida.',
            checkForecast: 'Consulte el pronóstico antes de iniciar.',
            fastChanges:
              'Las condiciones en montaña pueden cambiar rápidamente.',
            weatherHazards:
              'Preste especial atención a lluvia, viento y tormentas eléctricas.',
            leaveNoWaste: 'No deje basura en el trayecto.',
            floraFauna: 'Respete la flora y la fauna.',
            noFires: 'Evite fogatas.',
            noLoudAudio: 'Evite equipos de sonido de alto volumen.',
            noAlcohol: 'No consuma bebidas alcohólicas durante el ascenso.',
            preparation: {
              title: 'Preparación antes del ascenso',
              body: 'Revisa la ruta, calcula tiempo suficiente y comunica tu plan a una persona de confianza.',
            },
            clothing: {
              title: 'Vestimenta adecuada',
              body: 'Usa calzado con buena tracción y lleva capas para cambios de temperatura, viento o lluvia.',
            },
            hydration: {
              title: 'Hidratación y alimentación',
              body: 'Lleva suficiente agua y alimentos prácticos para la duración prevista del recorrido.',
            },
            lighting: {
              title: 'Linterna e iluminación',
              body: 'Lleva una linterna funcional y energía de respaldo, especialmente si iniciarás antes del amanecer.',
            },
            weather: {
              title: 'Condiciones climáticas',
              body: 'Consulta el pronóstico y reconsidera el ascenso si las condiciones cambian de forma desfavorable.',
            },
            stayOnRoute: {
              title: 'Permanecer en la ruta',
              body: 'Sigue los senderos y referencias reconocibles. Evita atajos o zonas que no conozcas.',
            },
            waste: {
              title: 'Manejo de basura',
              body: 'Regresa contigo todos tus residuos y evita dejar restos de alimentos en el trayecto.',
            },
            environment: {
              title: 'Respeto al entorno natural',
              body: 'No extraigas plantas, rocas ni otros elementos, y procura reducir el ruido.',
            },
            returnSafety: {
              title: 'Retorno y seguridad',
              body: 'Respeta la hora de retorno prevista y utiliza el retorno anticipado si necesitas terminar antes.',
            },
            emergency: {
              title: 'Qué hacer ante una emergencia',
              body: 'Mantén la calma, permanece con el grupo cuando sea posible y solicita ayuda por los medios disponibles.',
            },
          },
        },
      },
      weather: {
        loading: 'Consultando el pronóstico…',
        unavailable:
          'El pronóstico no está disponible en este momento. La aplicación puede seguir utilizándose normalmente.',
        incomplete: 'El servicio no devolvió datos meteorológicos completos.',
        cached: 'Mostrando el último pronóstico guardado en este dispositivo.',
        previousData:
          'No fue posible actualizar. Se conservan los últimos datos disponibles.',
        referenceNotice:
          'Pronóstico de referencia para el área del Volcán Santa María. No garantiza condiciones seguras.',
        temperature: 'Temperatura',
        volcanoName: 'Volcán Santa María',
        feelsLike: 'Sensación de {{value}} °C',
        humidity: 'Humedad',
        cloudCover: 'Nubosidad',
        sunrise: 'Amanecer',
        sunset: 'Atardecer',
        rain: 'Probabilidad de lluvia',
        rainShort: 'lluvia {{value}} %',
        wind: 'Viento',
        gusts: 'Ráfagas',
        nextHours: 'Próximas horas',
        current: 'Ahora',
        refresh: 'Actualizar',
        refreshing: 'Actualizando…',
        temperatureTrend: 'Tendencia de temperatura',
        rainTrend: 'Probabilidad de lluvia por hora',
        updatedAt: 'Actualizado: {{date}}',
        risk: {
          favorable: 'Favorable',
          precaution: 'Precaución',
          unfavorable: 'Condiciones desfavorables',
          not_recommended: 'No recomendable',
          unavailable: 'Sin datos',
        },
        conditions: {
          clear: 'Cielo despejado',
          partlyCloudy: 'Parcialmente nublado',
          overcast: 'Nublado',
          fog: 'Niebla',
          drizzle: 'Llovizna',
          freezingDrizzle: 'Llovizna helada',
          rain: 'Lluvia',
          freezingRain: 'Lluvia helada',
          snow: 'Nieve',
          showers: 'Chubascos',
          thunderstorm: 'Tormenta',
          unknown: 'Condición no disponible',
        },
        hike: {
          title: 'Pronóstico para tu ascenso',
          plannedPeriod: 'Según el horario planificado',
          conditionsTitle: 'Condiciones previstas',
          departure: 'Salida prevista',
          during: 'Durante el ascenso',
          return: 'Retorno previsto',
          summary:
            'Hasta {{rain}} % de probabilidad de lluvia y viento de hasta {{wind}} km/h en el periodo previsto.',
          outOfRange:
            'El pronóstico todavía no está disponible para esta fecha.',
          outOfRangeFollowUp:
            'Se actualizará cuando la fecha esté dentro del rango disponible.',
          recommendationsTitle: 'Recomendaciones para estas condiciones',
          referenceFastChange:
            'Pronóstico de referencia. En alta montaña las condiciones pueden cambiar rápidamente.',
          guidanceDisclaimer:
            'La clasificación es orientativa y no sustituye avisos oficiales ni la evaluación de las condiciones en el lugar.',
          advice: {
            rainProtection:
              'Lleve protección impermeable y proteja su equipo sensible.',
            moderateGusts:
              'Prepárese para ráfagas y revise el ajuste de su equipo.',
            strongWind:
              'Considere posponer el ascenso ante viento o ráfagas fuertes.',
            rainIncreasingAtReturn:
              'La probabilidad de lluvia puede aumentar hacia la hora de retorno. Conserve un margen de tiempo suficiente.',
          },
        },
      },
      announcements: {
        understood: 'Entendido',
        dismiss: 'Cerrar aviso',
      },
      validation: {
        required: 'Completa todos los campos.',
        completeRequiredFields: 'Completa los campos obligatorios',
        firstNameRequired: 'Falta el nombre.',
        invalidFirstName: 'Ingresa un nombre válido.',
        lastNameRequired: 'Falta el apellido.',
        invalidLastName: 'Ingresa un apellido válido.',
        emailRequired: 'Falta el correo electrónico.',
        passwordRequired: 'Falta la contraseña.',
        confirmPasswordRequired: 'Confirma la contraseña.',
        captchaRequired: 'Completa la verificación de seguridad.',
        captchaExpired: 'La verificación expiró. Complétala nuevamente.',
        captchaTemporary:
          'No pudimos cargar la verificación. Inténtalo nuevamente.',
        invalidEmail: 'Ingresa un correo electrónico válido.',
        passwordLength: 'La contraseña debe tener al menos 8 caracteres.',
        passwordMismatch: 'Las contraseñas no coinciden.',
        invalidDate: 'Ingresa una fecha de nacimiento válida y razonable.',
        invalidPhone: 'Ingresa un teléfono válido para el país seleccionado.',
        invalidEmergencyPhone:
          'Ingresa un teléfono válido para el contacto de emergencia.',
        saveProfile: 'No se pudo guardar el perfil. Inténtalo de nuevo.',
      },
      errors: {
        invalidCredentials: 'El correo o la contraseña no son correctos.',
        emailNotConfirmed:
          'Confirma tu correo electrónico antes de iniciar sesión.',
        accountCreation:
          'No fue posible crear la cuenta. Revisa los datos e inténtalo nuevamente.',
        accountExistsTitle: 'Ya existe una cuenta con este correo.',
        accountExistsDescription:
          'Inicia sesión o restablece tu contraseña para continuar.',
        weakPassword: 'La contraseña no cumple los requisitos de seguridad.',
        samePassword: 'La nueva contraseña debe ser diferente a la actual.',
        captchaFailed:
          'No pudimos validar la verificación de seguridad. Inténtalo nuevamente.',
        rateLimit:
          'Has realizado demasiados intentos. Espera un momento e inténtalo nuevamente.',
        signupDisabled: 'El registro no está disponible en este momento.',
        network:
          'No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.',
        recoveryExpired:
          'El enlace de recuperación expiró o ya no es válido. Solicita uno nuevo.',
        generic:
          'Ocurrió un problema con la autenticación. Inténtalo de nuevo.',
      },
    },
  },
  en: {
    translation: {
      offline: {
        notice: 'You are offline. Showing the latest saved data; the map and your location keep working.',
        actionNotSaved: 'You are offline: this could not be completed and nothing was saved. Try again when you have signal.',
        mapSaved: 'Map saved: it works offline.',
        mapSaving: 'Saving the map for offline use. Stay connected for a moment.',
      },
      common: {
        brand: 'Santa María Volcano',
        email: 'Email address',
        password: 'Password',
        firstName: 'First name',
        lastName: 'Last name',
        phone: 'Phone',
        cancel: 'Cancel',
        close: 'Close',
        signOut: 'Sign out',
        signingOut: 'Signing out…',
        unavailable: 'Unavailable',
        language: 'Language',
        closeNotification: 'Close notification',
        confirmAction: 'Confirm action',
        openCalendar: 'Open calendar for {{field}}',
        chooseDate: 'Choose {{field}}',
        month: 'Month',
        year: 'Year',
        dateFormatHelp: 'DD/MM/YYYY',
      },
      auth: {
        checkingSession: 'Checking session…',
        loginTitle: 'Sign in',
        loginSubtitle: 'Enter your email address to continue.',
        loginHeroSubtitle: 'A guide for your ascent',
        loginSubmit: 'Sign in',
        loggingIn: 'Signing in…',
        noAccount: "Don't have an account yet?",
        createAccountLink: 'Create account',
        registerTitle: 'Create account',
        registerSubtitle: 'Sign up to begin your experience.',
        confirmPassword: 'Confirm password',
        creatingAccount: 'Creating account…',
        alreadyRegistered: 'Already have an account?',
        loginLink: 'Sign in',
        confirmationRequired:
          'Account created. Check your email and confirm your account before signing in.',
        accountCreatedTitle: 'Account created',
        accountCreatedToast: 'Account created successfully',
        emailConfirmedToast: 'Email confirmed successfully',
        emailConfirmedToastDescription:
          'Complete your information to continue.',
        confirmationSentTo: 'We sent a confirmation link to {{email}}.',
        confirmationRequiredForVisits:
          'Confirm your email to register or join an ascent.',
        confirmationEmailResent:
          'If the account can receive a confirmation email, we will send a new link.',
        resendConfirmation: 'Resend email',
        resendingConfirmation: 'Resending…',
        resendAvailableIn: 'Resend in {{seconds}}s',
        backHome: 'Back to home',
        forgotPassword: 'Forgot your password?',
        forgotPasswordTitle: 'Reset your password',
        forgotPasswordSubtitle: 'Enter your email to request a recovery link.',
        passwordResetRequestSent:
          'If an account is associated with that email, you will receive a link to reset your password.',
        sendPasswordReset: 'Send link',
        sendingPasswordReset: 'Sending…',
        resetPasswordAction: 'Reset password',
        backToLogin: 'Back to sign in',
        newPasswordTitle: 'Reset password',
        newPasswordSubtitle: 'Create a new password for your account.',
        newPassword: 'New password',
        confirmNewPassword: 'Confirm new password',
        updatePassword: 'Update password',
        updatingPassword: 'Updating…',
        passwordUpdatedToast: 'Password updated successfully',
        activeSession: 'Active session',
        welcome: 'Welcome, {{name}}!',
        welcomeGeneric: 'Welcome!',
        authenticated: 'Your account is authenticated.',
        editProfile: 'Edit profile',
        myProfile: 'My profile',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        verificationPersistentNotice:
          'Confirm your email to enable ascent registration.',
      },
      theme: {
        label: 'Theme',
        light: 'Light',
        dark: 'Dark',
        switchToLight: 'Switch to light theme',
        switchToDark: 'Switch to dark theme',
      },
      legal: {
        entity: 'Alcaldía Indígena de Llanos del Pinal',
        menu: 'Privacy and terms',
        centerIntro: 'Review the application documents currently in force.',
        version: 'Version {{version}}',
        consent: {
          title: 'Acceptance required',
          existingUser:
            'Before continuing, review and accept the current documents. Your existing information will not be changed.',
          label: 'I have read and accept the Terms and Conditions and Privacy Policy.',
          required: 'You must accept the documents to complete registration.',
          accept: 'Accept and continue',
          saving: 'Saving acceptance…',
          error: 'Your acceptance could not be saved. Please try again.',
        },
        privacy: {
          title: 'Privacy Policy',
          sections: [
            {
              title: 'Controller and data processed',
              body: 'Alcaldía Indígena de Llanos del Pinal is the responsible entity. Depending on the features used, the application may process first and last name, date of birth, sex, nationality, Guatemalan department, phone number, DPI/CUI or passport, emergency contact, avatar, ascents, history, returns, notifications, and accompanying minor data such as name, age, sex, and relationship.',
            },
            {
              title: 'Purposes',
              body: 'Data is used to identify visitors, organize and control ascents, support incident or delay response, manage returns, enable emergency contact, produce operational or statistical information, and operate the application.',
            },
            {
              title: 'On-device location',
              body: 'GPS location shown on the map is used only on the device as a reference. It is not stored in the application database or shared with the Indigenous Municipality of Llanos del Pinal or other users.',
            },
            {
              title: 'Minors and retention',
              body: 'Minors do not receive accounts. Their data remains linked to the ascent and to the adult who registered them as responsible. Administrative access is limited through roles, permissions, and audit logs.',
            },
          ],
        },
        terms: {
          title: 'Terms and Conditions',
          sections: [
            {
              title: 'Application scope',
              body: 'This is an information and support tool of Alcaldía Indígena de Llanos del Pinal. It is not a rescue service, professional navigation system, or permanent monitoring service, and it does not replace a local guide or emergency services.',
            },
            {
              title: 'Changing conditions',
              body: 'The map, GPS, weather, route, and times are references and may vary. Terrain, volcanic activity, and weather can change. Visitors must follow competent authorities and act prudently.',
            },
            {
              title: 'Availability',
              body: 'The application cannot guarantee continuous availability of internet, GPS, maps, forecasts, or other external services. These reasonable limitations do not reduce applicable user rights.',
            },
            {
              title: 'Donations',
              body: 'Donations will be voluntary, are not required to use the application, and the application will remain free. When PayPal is enabled, transactions will occur outside this PWA under PayPal terms and policies.',
            },
          ],
        },
        safety: {
          title: 'Safety Notice',
          sections: [
            {
              title: 'Support tool',
              body: 'This application is only a support tool. Weather, terrain, GPS signal, and volcanic activity can change.',
            },
            {
              title: 'References and authorities',
              body: 'The map and location are references and may have accuracy errors. The application does not replace a local guide, competent-authority instructions, or emergency services.',
            },
          ],
        },
      },
      profile: {
        loading: 'Loading profile…',
        loadErrorTitle: 'We could not load your profile',
        loadErrorSubtitle: 'Check your connection and try again.',
        retry: 'Try again',
        completeTitle: 'Complete your profile',
        editTitle: 'Edit profile',
        subtitle:
          'Share only the essential information needed to identify you and assist in an emergency.',
        personalInformation: 'Personal information',
        identity: 'Visual identity',
        avatar: {
          kinds: {
            uploaded: 'Upload photo',
            preset: 'Choose avatar',
            initials: 'Use initials',
          },
          choosePhoto: 'Select photo',
          processing: 'Processing photo…',
          photoHelp:
            'JPG, PNG, or WebP. Maximum 8 MB; cropped and converted to WebP.',
          photoRequired: 'Select a photo to use this option.',
          presetRequired: 'Select a preset avatar.',
          tooLarge: 'The photo exceeds the 8 MB limit.',
          unsupported: 'Use a JPG, PNG, or WebP photo.',
          processingFailed: 'The photo could not be processed.',
          presets: {
            mountain: 'Mountain',
            volcano: 'Volcano',
            pine: 'Pine',
            compass: 'Compass',
            hiking: 'Hiking',
            sunrise: 'Sunrise',
            forest: 'Forest',
            summit: 'Summit',
          },
        },
        nationality: 'Nationality',
        department: 'Department',
        selectDepartment: 'Select a department',
        sex: 'Sex',
        sexOptions: { male: 'Male', female: 'Female' },
        dateOfBirth: 'Date of birth',
        documentType: 'Document type',
        documentNumber: 'Document number',
        emergencyContact: 'Emergency contact',
        relationship: 'Relationship',
        selectOption: 'Select an option',
        documentTypes: {
          dpi: 'DPI / CUI',
          passport: 'Passport',
          other: 'Other',
        },
        save: 'Save profile',
        saving: 'Saving…',
        registrationCompleted: 'Registration completed successfully',
        relationships: {
          parent: 'Parent',
          spouse: 'Partner or spouse',
          sibling: 'Sibling',
          child: 'Child',
          relative: 'Other relative',
          friend: 'Friend',
          other: 'Other',
        },
        validation: {
          nationalityRequired: 'Select a nationality.',
          departmentRequired:
            'Select your department when your nationality is Guatemala.',
          sexRequired: 'Select sex.',
          dateOfBirthRequired: 'Select a date of birth.',
          dateOfBirthInvalid: 'Select a valid and reasonable date of birth.',
          phoneRequired: 'Enter your phone number.',
          phoneInvalid: 'Enter a valid phone number for the selected country.',
          documentTypeRequired: 'Select a document type.',
          documentNumberRequired: 'Enter the document number.',
          documentNumberInvalid:
            'Enter a valid document number between 3 and 40 characters.',
          emergencyFirstNameRequired:
            "Enter the emergency contact's first name.",
          emergencyFirstNameInvalid:
            'Enter a valid first name for the emergency contact.',
          emergencyLastNameRequired: "Enter the emergency contact's last name.",
          emergencyLastNameInvalid:
            'Enter a valid last name for the emergency contact.',
          relationshipRequired: 'Select the relationship.',
          emergencyPhoneRequired: "Enter the emergency contact's phone number.",
          emergencyPhoneInvalid:
            'Enter a valid phone number for the emergency contact.',
        },
      },
      country: {
        search: 'Type to search for a country',
        noResults: 'No countries found',
      },
      phone: {
        countryPrefix: 'Phone country and calling code',
        localNumber: 'Local number',
      },
      visits: {
        minors: {
          question: 'Are minors traveling?',
          responsibleHelp:
            'Every minor must travel with a responsible adult on the same ascent.',
          responsibleCurrentUser: 'Responsible adult: ascent organizer',
          responsible: 'Responsible adult',
          item: 'Minor {{number}}',
          fullName: 'Full name',
          age: 'Age',
          relationship: 'Relationship',
          relationshipExample: 'E.g. child, sibling, niece/nephew',
          selectRelationship: 'Select relationship',
          relationshipDetail: 'Specify relationship',
          relationships: {
            child: 'Child',
            sibling: 'Sibling',
            niece_nephew: 'Niece/nephew',
            grandchild: 'Grandchild',
            cousin: 'Cousin',
            other: 'Other',
          },
          add: 'Add another minor',
          remove: 'Remove minor',
          validation:
            'Complete all minor details correctly (age from 0 to 17).',
          consent:
            'I confirm that I am responsible for the minor during this ascent and authorize the registration of the data needed to manage the trip.',
          consentRequired:
            'You must confirm responsibility and authorization to register minors.',
        },
        loading: 'Looking for your active ascent…',
        title: 'Santa María Volcano Ascent',
        subtitle: 'Create a group or enter the code shared with you.',
        back: '← Back',
        route: 'Route',
        summitRoute: 'Summit Route',
        tripType: 'Trip type',
        startMode: {
          title: 'When do you want to ascend?',
          start: 'Start',
          todayNow: 'Today · now',
          now: {
            title: 'Start now',
            description:
              'Form the group and record the actual start when you are ready.',
          },
          scheduled: {
            title: 'Schedule ascent',
            description: 'Set a date and time to start later.',
          },
        },
        types: {
          day_hike: 'Day Hike',
          expedition_camping: 'Expedition & Camping',
        },
        expectedReturn: 'Estimated return',
        plannedStart: 'Planned start',
        startDate: 'Planned start date',
        startTime: 'Planned start time',
        returnDate: 'Estimated return date',
        returnTime: 'Estimated return time',
        timePicker: {
          hour: 'Hour',
          minute: 'Minutes',
        },
        localGuide: 'Local guide',
        guideName: 'Guide name',
        participants: 'Participants',
        organizer: 'Organizer',
        memberStatus: {
          ready: 'In the group',
          active: 'On route',
          returning_early: 'Returning early',
          returned_early: 'Early return confirmed',
          completed: 'Completed',
          withdrawn_before_start: 'Withdrew before start',
        },
        members: {
          withdraw: 'Leave group',
          withdrawConfirm:
            'Do you confirm that you want to leave this group before it starts?',
          remove: 'Remove from group',
          removeConfirm:
            'Remove {{name}} from the group? Their history record will be kept.',
          markEarlyReturn: 'Record early return',
          markEarlyReturnFor: 'Early return for {{name}}',
        },
        earlyReturn: {
          action: 'Early return',
          title: 'Early return',
          organizerTitle: 'Early return for {{name}}',
          reason: 'Reason',
          selectReason: 'Select the reason:',
          reasons: {
            physical_discomfort: 'Physical discomfort',
            injury: 'Injury',
            emergency: 'Emergency',
            personal_decision: 'Personal decision',
            other: 'Other',
          },
          notes: 'Notes (optional)',
          reasonRequired: 'Select a reason to continue.',
          confirm: 'Confirm early return',
          organizerConfirm: 'Confirm early return',
          saving: 'Saving…',
          checkout: 'I arrived at the checkpoint',
          checkoutConfirm:
            'Do you confirm that you have arrived at the checkpoint?',
        },
        options: {
          title: 'Ascent options',
        },
        history: {
          title: 'Hike history',
          loading: 'Loading history…',
          empty: 'You do not have any hikes in your history yet.',
          individual: 'Individual',
          group: 'Group',
          groupOrganizer: 'Group · Organizer',
          groupWithCount_one: 'Group · {{count}} participant',
          groupWithCount_other: 'Group · {{count}} participants',
          organizer: 'Organizer',
          createdByAdministration: 'Created by administration',
          finalizedByAdministration: 'Completed by administration',
          startedAt: 'Start',
          endedAt: 'Finish',
          duration: 'Duration',
          durationHoursMinutes: '{{hours}} h {{minutes}} min',
          durationMinutes: '{{minutes}} min',
          loadMore: 'Load more',
          loadingMore: 'Loading…',
          viewMembers: 'View members',
          hideMembers: 'Hide members',
          membersTitle: 'Members',
          loadingMembers: 'Loading members…',
          memberStatus: {
            active: 'In progress',
            returningEarly: 'Returning early',
            returnedEarly: 'Early return',
            withdrawn: 'Withdrew before start',
            completed: 'Completed',
          },
          status: {
            active: 'In progress',
            returningEarly: 'Returning early',
            returnedEarly: 'Early return',
            withdrawn: 'Withdrew before start',
            completed: 'Completed',
            cancelled: 'Cancelled',
          },
        },
        terms:
          'I have read and accept the rules and recommendations for the ascent.',
        recommendationsConsent:
          'I have read and accept the recommendations for the hike.',
        viewRecommendations: 'View recommendations',
        create: {
          action: 'Create ascent',
          title: 'Create ascent',
          localGuideQuestion: 'Are you traveling with a local guide?',
          cancelMessage:
            'Do you want to cancel creating this ascent?\n\nThe information entered will be lost.',
          continueEditing: 'Continue editing',
          discard: 'Discard',
          submit: 'Create group',
          creating: 'Creating group…',
        },
        join: {
          action: 'Join a group',
          title: 'Join a group',
          code: 'Group code',
          submit: 'Join group',
          joining: 'Joining…',
        },
        group: {
          preparing: 'Preparing',
          pendingReturns: 'Pending returns',
          title: 'Ascent group',
          code: 'Code',
          copyCode: 'Copy code',
          share: 'Share code',
          codeCopied: 'Code copied.',
          shared: 'Code shared.',
          shareCopied: 'Invitation copied for sharing.',
          shareText: 'Join my group for {{route}}. Code: {{code}}',
        },
        start: {
          slide: 'Slide to start',
          starting: 'Starting…',
          scheduled: 'Scheduled ascent',
          availableAt: 'You can start it from:',
        },
        inProgress: {
          status: 'In progress',
          title: 'Hike in progress',
          startedAt: 'Start',
          route: 'Recommendations',
          map: 'Map',
          gallery: 'Gallery',
          futureFeature: '{{feature}} will be implemented later.',
        },
        cancel: {
          action: 'Cancel ascent',
          cancelling: 'Cancelling…',
          confirm: 'Cancel this ascent? The group will no longer be available.',
        },
        complete: {
          action: 'Finish ascent',
          completing: 'Finishing…',
          confirm: 'Do you confirm that you have finished your route?',
          success: 'Ascent completed successfully.',
          completed: 'Completed',
          title: 'Ascent completed',
          back: 'Back to home',
        },
        validation: {
          startDateRequired: 'Select a planned start date.',
          startDatePast: 'The start date cannot be before today.',
          startDateInvalid: 'Enter a valid start date.',
          startTimeRequired: 'Select a planned start time.',
          futureStart:
            'The start date and time must be later than the current time.',
          startBeforeReturn:
            'The planned start must be earlier than the estimated return.',
          returnDateRequired: 'Select an estimated return date.',
          returnDatePast: 'The return date cannot be before today.',
          returnDateInvalid: 'Enter a valid return date.',
          returnTimeRequired: 'Select an estimated return time.',
          futureReturn:
            'The return date and time must be later than the current time.',
          guideName: 'Enter the local guide’s name.',
          acceptTerms: 'You must accept the rules and recommendations.',
          acceptRecommendations:
            'You must read and accept the recommendations to continue.',
          invalidCode: 'Enter a valid 6-character code.',
        },
        errors: {
          loadTitle: 'We could not load your ascent',
          alreadyActive: 'You already belong to an active ascent.',
          codeNotFound: 'We could not find a group with that code.',
          notAccepting: 'That group is no longer accepting members.',
          profileRequired: 'Complete your profile before continuing.',
          accessDenied: 'You do not have access to that group.',
          emailVerificationRequired:
            'You must confirm your email before registering an ascent.',
          scheduledStartNotReached:
            'The scheduled ascent cannot be started yet.',
          copyFailed: 'The code could not be copied.',
          shareFailed: 'The code could not be shared.',
          generic: 'The action could not be completed. Try again.',
          minorConsentRequired: 'Confirm responsibility for the minors before continuing.',
          invalidMinorData: 'Review the name, age, sex, and relationship for each minor.',
          adultRequiredForMinors: 'Only an adult may register accompanying minors.',
        },
      },
      routes: {
        eyebrow: 'Route information',
        title: 'Route: {{route}}',
        open: 'View route information',
        tabsLabel: 'Route sections',
        tabs: {
          recommendations: 'Recommendations',
          map: 'Map',
          weather: 'Weather',
          gallery: 'Gallery',
          donations: 'Donations',
        },
        loading: 'Loading route information…',
        loadError: 'We could not load the route information.',
        cachedData: 'Showing the information saved on this device.',
        noDescription: 'No description is available for this route yet.',
        difficulty: 'Difficulty',
        distance: 'Distance',
        duration: 'Estimated duration',
        elevationGain: 'Elevation gain',
        noCheckpoints: 'No reference points have been published yet.',
        noPhotos: 'No photos have been published yet.',
        photosLoadError: 'Photos could not be loaded at this time.',
        routePhotos: 'Route photos',
        photos: {
          previous: 'Previous photo',
          next: 'Next photo',
          position: '{{current}} of {{total}}',
          goTo: 'View photo {{number}}',
          pause: 'Pause',
          resume: 'Resume',
        },
        altitude: '{{altitude}} m elevation',
        map: {
          loading: 'Loading map…',
          loaded: 'Map loaded successfully.',
          loadError: 'We could not load the map.',
          mapLabel: 'Interactive map of Santa María Volcano',
          baseMapControl: 'Select base map',
          mapBase: 'Map',
          satelliteBase: 'Satellite',
          satelliteUnavailable:
            'Configure VITE_MAPTILER_KEY to enable Satellite.',
          satelliteLoadError:
            'Satellite could not be loaded. The Map view was restored.',
          recenter: 'Recenter on the volcano',
          myLocation: 'My location',
          locating: 'Finding your location…',
          youAreHere: 'You are here',
          accuracy: 'Approximate accuracy: ±{{accuracy}} m',
          locationPrivacy:
            'Your location is used only as a reference while you keep the map open. It is not stored or shared.',
          locationUnavailable:
            'Location is unavailable in this browser or context. You can continue viewing the route normally.',
          locationErrors: {
            permissionDenied:
              'We could not access your location. You can continue viewing the route normally.',
            positionUnavailable:
              'Your location could not be determined right now. Please try again.',
            timeout: 'Location took too long to respond. You can try again.',
          },
          selectedPoint: 'Selected point information',
          closeDetails: 'Close information',
          volcanoReference: 'Volcano reference',
          summitMarkerLabel: 'View Santa María Volcano information',
          startMarkerLabel: 'Start of the ascent route',
          routeStart: 'Start',
          checkpointMarkerLabel: 'View reference point: {{name}}',
          trackPending: 'Detailed route track pending.',
          noCheckpoints:
            'There are no reference points with coordinates to display yet.',
          mediaLoadError:
            'The map is available, but its photos could not be loaded.',
        },
        stats: {
          title: 'Summit ascent route',
          distance: 'Approximate ascent distance',
          gain: 'Elevation gain',
          time: 'Recorded reference time',
          disclaimer:
            'This time is from a reference recording and may vary with weather, terrain, and the group’s pace.',
        },
        santiaguito: {
          title: 'Restricted area — Santiaguito Volcano',
          body: 'Do not attempt to climb or approach the Santiaguito volcanic complex. Volcanic activity can pose a serious danger from explosions, ashfall, avalanches, pyroclastic flows, and lahars.',
          scope: 'This application provides information only for the Santa María Volcano route. Follow all instructions issued by competent authorities.',
          source: 'Source: CONRED / INSIVUMEH.',
        },
        gallery: {
          title: 'Santa María Volcano gallery',
          empty: 'There are no active gallery photos yet.',
        },
        donations: {
          title: 'Donations',
          heading: 'Support the conservation of Santa María Volcano',
          body: 'Your contribution may support trail cleanup, route maintenance, signage, and safety actions. The application will remain free for every visitor.',
          button: 'Donate with PayPal',
          comingSoon: 'Coming soon',
          free: 'Donations will be voluntary and are not required to use the application.',
        },
        checkpointTypes: {
          start: 'Start',
          reference: 'Reference',
          rest: 'Rest stop',
          viewpoint: 'Viewpoint',
          summit: 'Summit',
        },
        recommendations: {
          intro:
            'Prepare in advance and make prudent decisions throughout the hike.',
          sections: {
            preparation: 'Preparation',
            safety: 'Safety',
            weather: 'Weather',
            environment: 'Environmental protection',
          },
          items: {
            waterFood: 'Carry enough water and food for the route.',
            footwear: 'Wear appropriate hiking footwear.',
            properClothing: 'Bring suitable clothing for cold, wind, and rain.',
            flashlight: 'Bring a flashlight and sufficient battery power.',
            localGuide:
              'Consider ascending with a local guide, especially if you do not know the route.',
            whistle: 'Bring a whistle.',
            firstAid: 'Bring a basic first-aid kit.',
            remainOnRoute: 'Remain on the established route.',
            checkForecast: 'Check the forecast before starting.',
            fastChanges: 'Mountain conditions can change quickly.',
            weatherHazards:
              'Pay special attention to rain, wind, and thunderstorms.',
            leaveNoWaste: 'Do not leave waste along the route.',
            floraFauna: 'Respect the flora and fauna.',
            noFires: 'Avoid fires.',
            noLoudAudio: 'Avoid high-volume sound equipment.',
            noAlcohol: 'Do not consume alcoholic beverages during the ascent.',
            preparation: {
              title: 'Preparation before the hike',
              body: 'Review the route, allow enough time, and share your plan with someone you trust.',
            },
            clothing: {
              title: 'Appropriate clothing',
              body: 'Wear footwear with good traction and bring layers for changes in temperature, wind, or rain.',
            },
            hydration: {
              title: 'Hydration and food',
              body: 'Carry enough water and practical food for the expected duration of the hike.',
            },
            lighting: {
              title: 'Flashlight and lighting',
              body: 'Bring a working flashlight and backup power, especially if you will start before sunrise.',
            },
            weather: {
              title: 'Weather conditions',
              body: 'Check the forecast and reconsider the hike if conditions change unfavorably.',
            },
            stayOnRoute: {
              title: 'Stay on the route',
              body: 'Follow recognizable trails and references. Avoid shortcuts or unfamiliar areas.',
            },
            waste: {
              title: 'Waste management',
              body: 'Take all waste back with you and do not leave food scraps along the trail.',
            },
            environment: {
              title: 'Respect the natural environment',
              body: 'Do not remove plants, rocks, or other natural elements, and keep noise to a minimum.',
            },
            returnSafety: {
              title: 'Return and safety',
              body: 'Respect the planned return time and use early return if you need to finish sooner.',
            },
            emergency: {
              title: 'What to do in an emergency',
              body: 'Stay calm, remain with the group when possible, and request help through available means.',
            },
          },
        },
      },
      weather: {
        loading: 'Checking the forecast…',
        unavailable:
          'The forecast is unavailable right now. You can continue using the application normally.',
        incomplete: 'The service did not return complete weather data.',
        cached: 'Showing the latest forecast saved on this device.',
        previousData:
          'The update failed. The latest available data remains visible.',
        referenceNotice:
          'Reference forecast for the Santa María Volcano area. It does not guarantee safe conditions.',
        temperature: 'Temperature',
        volcanoName: 'Santa María Volcano',
        feelsLike: 'Feels like {{value}} °C',
        humidity: 'Humidity',
        cloudCover: 'Cloud cover',
        sunrise: 'Sunrise',
        sunset: 'Sunset',
        rain: 'Rain probability',
        rainShort: 'rain {{value}}%',
        wind: 'Wind',
        gusts: 'Gusts',
        nextHours: 'Next hours',
        current: 'Now',
        refresh: 'Refresh',
        refreshing: 'Refreshing…',
        temperatureTrend: 'Temperature trend',
        rainTrend: 'Hourly rain probability',
        updatedAt: 'Updated: {{date}}',
        risk: {
          favorable: 'Favorable',
          precaution: 'Use caution',
          unfavorable: 'Unfavorable conditions',
          not_recommended: 'Not recommended',
          unavailable: 'No data',
        },
        conditions: {
          clear: 'Clear sky',
          partlyCloudy: 'Partly cloudy',
          overcast: 'Overcast',
          fog: 'Fog',
          drizzle: 'Drizzle',
          freezingDrizzle: 'Freezing drizzle',
          rain: 'Rain',
          freezingRain: 'Freezing rain',
          snow: 'Snow',
          showers: 'Rain showers',
          thunderstorm: 'Thunderstorm',
          unknown: 'Condition unavailable',
        },
        hike: {
          title: 'Forecast for your hike',
          plannedPeriod: 'Based on your planned schedule',
          conditionsTitle: 'Expected conditions',
          departure: 'Planned departure',
          during: 'During the hike',
          return: 'Planned return',
          summary:
            'Up to {{rain}}% chance of rain and wind up to {{wind}} km/h during the planned period.',
          outOfRange: 'The forecast is not available for this date yet.',
          outOfRangeFollowUp:
            'It will update when the date is within the available forecast range.',
          recommendationsTitle: 'Recommendations for these conditions',
          referenceFastChange:
            'Reference forecast. Mountain conditions can change quickly.',
          guidanceDisclaimer:
            'This classification is guidance only and does not replace official alerts or an on-site assessment of conditions.',
          advice: {
            rainProtection:
              'Bring waterproof protection and keep sensitive gear dry.',
            moderateGusts:
              'Prepare for gusts and check that your gear is secure.',
            strongWind:
              'Consider postponing the hike when winds or gusts are strong.',
            rainIncreasingAtReturn:
              'Rain may increase near your return; keep extra time in reserve.',
          },
        },
      },
      announcements: {
        understood: 'Got it',
        dismiss: 'Dismiss announcement',
      },
      validation: {
        required: 'Complete all fields.',
        completeRequiredFields: 'Complete the required fields',
        firstNameRequired: 'Enter your first name.',
        invalidFirstName: 'Enter a valid first name.',
        lastNameRequired: 'Enter your last name.',
        invalidLastName: 'Enter a valid last name.',
        emailRequired: 'Enter your email address.',
        passwordRequired: 'Enter your password.',
        confirmPasswordRequired: 'Confirm your password.',
        captchaRequired: 'Complete the security check.',
        captchaExpired: 'The security check expired. Complete it again.',
        captchaTemporary:
          'We could not load the security check. Please try again.',
        invalidEmail: 'Enter a valid email address.',
        passwordLength: 'The password must be at least 8 characters long.',
        passwordMismatch: 'The passwords do not match.',
        invalidDate: 'Enter a valid and reasonable date of birth.',
        invalidPhone: 'Enter a valid phone number for the selected country.',
        invalidEmergencyPhone:
          'Enter a valid phone number for the emergency contact.',
        saveProfile: 'The profile could not be saved. Try again.',
      },
      errors: {
        invalidCredentials: 'The email or password is incorrect.',
        emailNotConfirmed: 'Confirm your email address before signing in.',
        accountCreation:
          'The account could not be created. Review your details and try again.',
        accountExistsTitle: 'An account already exists with this email.',
        accountExistsDescription: 'Sign in or reset your password to continue.',
        weakPassword: 'The password does not meet the security requirements.',
        samePassword:
          'Your new password must be different from your current password.',
        captchaFailed:
          'We could not validate the security check. Please try again.',
        rateLimit: 'Too many attempts. Wait a moment and try again.',
        signupDisabled: 'Registration is not available right now.',
        network:
          'Could not connect to the service. Check your connection and try again.',
        recoveryExpired:
          'The recovery link has expired or is no longer valid. Request a new one.',
        generic: 'There was an authentication problem. Try again.',
      },
    },
  },
} as const;

function normalizeLanguage(value: string | null | undefined): AppLanguage {
  return value?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

function getInitialLanguage(): AppLanguage {
  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage === 'es' || storedLanguage === 'en') {
      return storedLanguage;
    }
  } catch {
    // Language persistence is optional when browser storage is unavailable.
  }

  return normalizeLanguage(window.navigator.language);
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'es',
  supportedLngs: ['es', 'en'],
  load: 'languageOnly',
  initAsync: false,
  interpolation: { escapeValue: false },
});

for (const language of ['es', 'en'] as const) {
  i18n.addResourceBundle(language, 'translation', { final: finalTranslations[language] }, true, true);
}

i18n.on('languageChanged', (language) => {
  try {
    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      normalizeLanguage(language)
    );
  } catch {
    // The application still works when language preference cannot be persisted.
  }
});

export function getAppLanguage(language = i18n.resolvedLanguage): AppLanguage {
  return normalizeLanguage(language);
}

export default i18n;
