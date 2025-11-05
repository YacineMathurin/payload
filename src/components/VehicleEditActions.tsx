import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import './VehicleEditActions.css'

export const VehicleEditActions: React.FC = () => {
  const { id, data } = useDocumentInfo()

  if (!id) return null

  const handleDownloadFiche = () => {
    window.open(`/api/vehicles/generate-pdf/${id}`, '_blank')
  }

  const handleDownloadVol = () => {
    window.open(`/api/vehicles/generate-vol-pdf/${id}`, '_blank')
  }

  return (
    <div className="vehicle-pdf-actions">
      <button type="button" className="pdf-button pdf-button-primary" onClick={handleDownloadFiche}>
        <span className="pdf-icon">📄</span>
        Télécharger la fiche PDF
      </button>

      {data?.statut === 'vole' && (
        <button type="button" className="pdf-button pdf-button-danger" onClick={handleDownloadVol}>
          <span className="pdf-icon">🚨</span>
          Télécharger déclaration de vol
        </button>
      )}
    </div>
  )
}
