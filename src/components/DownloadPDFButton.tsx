'use client'
import React from 'react'
import { useDocumentInfo, SaveButton } from '@payloadcms/ui'

export const DownloadPDFButton: React.FC = (props) => {
  const { id, data } = useDocumentInfo()

  const handleClick = () => {
    if (!id) return
    // Rediriger vers une API Route qui génère le PDF
    window.open(`/api/parcelles/${id}/generate-pdf`, '_blank')
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
      {id && (
        <div>
          <button
            type="button"
            onClick={handleClick}
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
            Télécharger PDF Parcelle
          </button>
        </div>
      )}
    </>
  )
}
