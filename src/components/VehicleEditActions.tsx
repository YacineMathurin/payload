'use client'
import React from 'react'
import { useDocumentInfo, SaveButton } from '@payloadcms/ui'

const VehicleEditActions: React.FC<any> = (props) => {
  const { id, data } = useDocumentInfo()

  const handleDownloadFiche = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (id) {
      window.open(`/api/vehicles/generate-pdf/${id}`, '_blank')
    }
  }

  const handleDownloadVol = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (id) {
      window.open(`/api/vehicles/generate-vol-pdf/${id}`, '_blank')
    }
  }

  return (
    <>
      {/* Render original save button */}
      <SaveButton {...props} />

      {/* Add separator */}
      {id && (
        <div
          style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 0.5rem' }}
        />
      )}

      {/* Your custom buttons */}
      {id && (
        <>
          <button
            type="button"
            onClick={handleDownloadFiche}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            📄 Fiche
          </button>

          {data?.statut === 'vole' && (
            <button
              type="button"
              onClick={handleDownloadVol}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                marginLeft: '0.5rem',
              }}
            >
              🚨 Vol
            </button>
          )}
        </>
      )}
    </>
  )
}

export default VehicleEditActions
