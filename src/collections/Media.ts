import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Gestion Douanière',
    description: '📁 Documents et fichiers',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texte alternatif',
      admin: {
        placeholder: 'Description du document',
      },
    },
  ],
}
