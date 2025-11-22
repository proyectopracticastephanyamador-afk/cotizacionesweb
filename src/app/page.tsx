"use client";

export default function HomePage() {
  return (
    <div className="card" style={{ padding: "25px" }}>

      {/* Título principal */}
      <h1 className="text-2xl font-bold mb-3">
        Bienvenido al Sistema de Cálculo de Cotizaciones
      </h1>

      {/* Subtítulo */}
      <p className="text-md text-gray-700 mb-6">
        Plataforma interna diseñada para agilizar, estandarizar y garantizar la exactitud
        en el cálculo de aportes laborales y deducciones bajo las normativas vigentes
        en Honduras.
      </p>

      {/* Sección 1 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          ¿Qué hace este sistema?
        </h2>
        <p className="text-gray-800 leading-6">
          Esta solución permite realizar cálculos automáticos de deducciones aplicables
          a los colaboradores, incluyendo IHSS, RAP, INJUPEMP, IMPREMA e ISR. 
          El sistema realiza el cálculo basado en techos, porcentajes y regímenes laborales
          configurados previamente, garantizando resultados precisos y plenamente alineados
          a la normativa hondureña.
        </p>
      </div>

      {/* Sección 2 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Flujo general del proceso
        </h2>

        <ul className="list-disc ml-6 text-gray-800 leading-6">
          <li>El usuario selecciona el régimen laboral aplicable.</li>
          <li>Se ingresa el salario base del colaborador.</li>
          <li>El sistema realiza los cálculos automáticamente con techos y porcentajes vigentes.</li>
          <li>Se genera un desglose detallado de cada deducción y su cálculo.</li>
          <li>La cotización se almacena para consulta, impresión o exportación.</li>
        </ul>
      </div>

      {/* Sección 3 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Módulos del sistema
        </h2>

        <p className="text-gray-800 leading-6 mb-3">
          Dependiendo de su rol, usted tendrá acceso a los siguientes módulos:
        </p>

        <ul className="list-disc ml-6 text-gray-800 leading-6">
          <li><strong>Cotizaciones:</strong> Crear, visualizar y simular cálculos de deducción.</li>
          <li><strong>Regímenes:</strong> Gestión de regímenes laborales aplicables.</li>
          <li><strong>Entes de Deducción:</strong> Configuración de IHSS, RAP e instituciones similares.</li>
          <li><strong>Parámetros:</strong> Configuración avanzada (techos, porcentajes, leyes vigentes).</li>
          <li><strong>Consultas:</strong> Búsqueda y auditoría de cotizaciones históricas.</li>
          <li><strong>Usuarios:</strong> Administración de perfiles y roles.</li>
          <li><strong>Reportes:</strong> Obtención de informes consolidados.</li>
        </ul>
      </div>

      {/* Sección 4 */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Objetivo general
        </h2>
        <p className="text-gray-800 leading-6">
          Proporcionar una plataforma confiable y eficiente para automatizar el proceso
          de cálculo de cotizaciones laborales, reduciendo errores manuales,
          garantizando cumplimiento normativo y mejorando la experiencia del área operativa.
        </p>
      </div>

    </div>
  );
}
