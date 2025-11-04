import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Média',
    plural: 'Médias',
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 150,
        height: 150,
        position: 'centre',
      },
      {
        name: 'card',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'portrait',
        width: 400,
        height: 500,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      label: 'Texte alternatif',
      type: 'text',
    },
  ],
}
