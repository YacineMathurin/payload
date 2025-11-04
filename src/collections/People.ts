import type { CollectionConfig } from 'payload'

export const People: CollectionConfig = {
  slug: 'people',
  labels: {
    singular: 'Personne',
    plural: 'Personnes',
  },
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['photo', 'prenom', 'nom', 'numeroNational', 'dateNaissance', 'estArrete'],
    description: "Fichier des personnes et informations d'identification.",
    group: 'Registres',
  },
  // Search only by ID (numeroNational)
  defaultSort: 'numeroNational',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  fields: [
    // Section: Photo
    {
      type: 'row',
      fields: [
        {
          name: 'photo',
          label: "Photo d'identité",
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: "Photo d'identité de la personne",
          },
        },
      ],
    },

    // Section: Informations personnelles
    {
      type: 'row',
      fields: [
        {
          name: 'prenom',
          label: 'Prénom',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'Ex : Yacine',
          },
        },
        {
          name: 'nom',
          label: 'Nom',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'Ex : Ibrahim',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'dateNaissance',
          label: 'Date de naissance',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'dd/MM/yyyy',
            },
            placeholder: 'Sélectionnez la date de naissance',
          },
        },
        {
          name: 'lieuNaissance',
          label: 'Lieu de naissance',
          type: 'text',
          admin: {
            placeholder: 'Ex : Niamey, Niger',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'sexe',
          label: 'Sexe',
          type: 'select',
          options: [
            { label: 'Masculin', value: 'M' },
            { label: 'Féminin', value: 'F' },
            { label: 'Autre', value: 'X' },
          ],
          admin: {
            isClearable: true,
          },
        },
        {
          name: 'nationalite',
          label: 'Nationalité',
          type: 'text',
          admin: {
            placeholder: 'Ex : Nigérienne',
          },
        },
      ],
    },

    // Section: Identification
    {
      type: 'collapsible',
      label: "Numéros d'identification",
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'numeroNational',
          label: "Numéro d'identification national",
          type: 'text',
          unique: true,
          required: true,
          index: true,
          admin: {
            placeholder: 'Ex : 123456789',
            description: 'Utilisé comme identifiant principal pour les recherches',
          },
        },
        {
          name: 'numeroPasseport',
          label: 'Numéro de passeport',
          type: 'text',
          admin: {
            placeholder: 'Ex : A12345678',
          },
        },
      ],
    },

    // Section: Coordonnées
    {
      type: 'collapsible',
      label: 'Coordonnées',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'adresse',
          label: 'Adresse',
          type: 'textarea',
          admin: {
            placeholder: 'Ex : 12 avenue de la République, 75011 Paris',
            rows: 2,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'telephone',
              label: 'Téléphone',
              type: 'text',
              admin: {
                placeholder: 'Ex : +33 1 23 45 67 89',
              },
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              admin: {
                placeholder: 'Ex : exemple@email.com',
              },
            },
          ],
        },
      ],
    },

    // Section: Statut
    {
      type: 'collapsible',
      label: 'Statut et notes',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'estArrete',
              label: 'Avis de recherche',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: "Cochez si la personne fait l'objet d'un avis de recherche",
              },
            },
            {
              name: 'statut',
              label: 'Statut',
              type: 'select',
              options: [
                { label: 'Actif', value: 'actif' },
                { label: 'Détenu', value: 'detenu' },
                { label: 'Recherché', value: 'recherche' },
                { label: 'Libéré', value: 'libere' },
              ],
              defaultValue: 'actif',
            },
          ],
        },
        {
          name: 'notes',
          label: 'Notes et observations',
          type: 'textarea',
          admin: {
            placeholder: 'Informations complémentaires...',
            rows: 3,
          },
        },
      ],
    },
  ],
}
