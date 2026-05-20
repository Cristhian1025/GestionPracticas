'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearOferta, actualizarOferta } from '@/app/actions/ofertas'
import Link from 'next/link'

interface OpcionesFormulario {
  empresas: { id: string; nombre: string }[]
  // coordinadores removed since it's now a text field
  programas: { id: string; nombre: string }[]
}

export default function OfertaForm({ 
  oferta, 
  opciones 
}: { 
  oferta?: any
  opciones: OpcionesFormulario
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!oferta

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = isEdit
      ? await actualizarOferta(oferta.id, formData)
      : await crearOferta(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/centro-progresa/ofertas')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Relaciones Principales */}
        <div className="md:col-span-2 border-b border-gray-100 pb-4 mb-2">
          <h3 className="text-lg font-medium text-gray-900">Vínculos y Asignaciones</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa Aliada *</label>
          <select
            name="empresa_id"
            required
            defaultValue={oferta?.empresa_id || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Selecciona una empresa</option>
            {opciones.empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contacto / Coordinador de la oferta *</label>
          <input
            type="text"
            name="coordinador_nombre"
            required
            defaultValue={oferta?.coordinador_nombre || ''}
            placeholder="Ej. Juan Pérez - Jefe de RRHH"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Perfil Laboral</label>
          <select
            name="programa_id"
            defaultValue={oferta?.programa_id || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Aplica para todos o ninguno en específico</option>
            {opciones.programas.map(prog => (
              <option key={prog.id} value={prog.id}>{prog.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meses de Práctica</label>
          <select
            name="meses_practica"
            defaultValue={oferta?.meses_practica || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Cualquier duración</option>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
            <option value="18">18 meses</option>
          </select>
        </div>

        {/* Detalles de la Oferta */}
        <div className="md:col-span-2 border-b border-gray-100 pb-4 mb-2 mt-4">
          <h3 className="text-lg font-medium text-gray-900">Detalles de la Vacante</h3>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo o categoría *</label>
          <input
            type="text"
            name="titulo"
            required
            defaultValue={oferta?.titulo}
            placeholder="Ej. Practicante de Desarrollo de Software"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción y Funciones</label>
          <textarea
            name="descripcion"
            rows={4}
            defaultValue={oferta?.descripcion}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input
            type="text"
            name="ciudad"
            defaultValue={oferta?.ciudad}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Vacantes</label>
          <input
            type="number"
            name="vacantes"
            min="1"
            defaultValue={oferta?.vacantes || 1}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite de Postulación</label>
          <input
            type="date"
            name="fecha_cierre"
            defaultValue={oferta?.fecha_cierre}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Condiciones */}
        <div className="md:col-span-2 border-b border-gray-100 pb-4 mb-2 mt-4">
          <h3 className="text-lg font-medium text-gray-900">Condiciones del Contrato</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de Contrato</label>
          <select
            name="modalidad_contrato"
            defaultValue={oferta?.modalidad_contrato || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Seleccionar Modalidad</option>
            <option value="cuota_sena">Cuota SENA</option>
            <option value="convenio_especial">Convenio Especial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de Trabajo</label>
          <select
            name="modalidad_trabajo"
            defaultValue={oferta?.modalidad_trabajo || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Seleccionar</option>
            <option value="Presencial">Presencial</option>
            <option value="Virtual">Virtual</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remuneración o pago de sostenimiento</label>
          <input
            type="text"
            name="remuneracion"
            defaultValue={oferta?.remuneracion}
            placeholder="Ej. SMLV, Apoyo de Sostenimiento"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
          <input
            type="text"
            name="horario"
            defaultValue={oferta?.horario}
            placeholder="Ej. Lunes a Viernes 8am a 5pm"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>



        <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="estado"
              value="activa"
              defaultChecked={isEdit ? (oferta?.estado === 'activa') : true}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Oferta Activa (Visible para estudiantes)</span>
          </label>
          {!isEdit && (
            <input type="hidden" name="estado" value="cerrada" disabled={false} />
          )}
          {/* Note: In standard HTML forms, unchecked checkboxes aren't submitted. 
              The server action defaults to 'activa'. If we want unchecked to mean 'cerrada', 
              we handle it in the action or via a hidden field approach. 
              Let's fix the server action instead to check for 'activa' and set state accordingly. */}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/centro-progresa/ofertas"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar Cambios' : 'Publicar Oferta')}
        </button>
      </div>
    </form>
  )
}
