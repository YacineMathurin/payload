import { CollectionConfig } from 'payload'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    group: 'Sécurité',
    defaultColumns: ['timestamp', 'action', 'agent'],
  },
  access: {
    create: () => false, // Interdit la création via l'API/Admin manuelle
    update: () => false, // Immutabilité : on ne modifie jamais un log
  },
  fields: [
    {
      name: 'documentHash',
      type: 'text',
      required: true,
      index: true, // CRITIQUE : Crée un index B-Tree pour des recherches en O(1)
      admin: { description: 'Empreinte SHA-256 unique du document' },
    },
    {
      name: 'targetId',
      type: 'text',
      index: true, // Permet de retrouver rapidement tous les PDF d'une même parcelle
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'action',
      type: 'text',
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
