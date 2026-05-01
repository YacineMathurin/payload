import type { CollectionConfig } from 'payload'

export const Parcelles: CollectionConfig = {
  slug: 'parcelles',
  admin: {
    useAsTitle: 'idParcelle',
    defaultColumns: ['idParcelle', 'nom', 'commune', 'statut'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Info Personnelle',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'nom', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'prenom', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', required: true },
                { name: 'numero', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Bloc Parcelle',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'idParcelle', type: 'text', required: true, label: 'ID Parcelle' },
                { name: 'typeParcelle', type: 'text', label: 'Type de parcelle' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'superficie', type: 'number', label: 'Superficie (m²)' },
                { name: 'commune', type: 'text' },
                { name: 'quartier', type: 'text' },
              ],
            },
            {
              name: 'historiqueProprietaires',
              type: 'textarea',
              label: 'Historique des propriétaires',
            },
            {
              name: 'statut',
              type: 'select',
              required: true,
              options: [
                { label: 'Conflit', value: 'conflit' },
                { label: 'En cours de vérification', value: 'en_cours' },
                { label: 'Aucun conflit', value: 'aucun' },
              ],
              defaultValue: 'aucun',
            },
          ],
        },
      ],
    },
    {
      name: 'downloadPDF',
      type: 'ui',
      admin: {
        // position: 'sidebar',
        components: {
          Field: '/components/DownloadPDFButton#DownloadPDFButton',
        },
      },
    },
  ],
}
