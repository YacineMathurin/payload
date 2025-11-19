import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // enables login
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Officer', value: 'officer' },
        { label: 'Viewer', value: 'viewer' },
      ],
      defaultValue: 'viewer',
      admin: {
        position: 'sidebar',
      },
    },
  ],

  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'super-admin',
    update: ({ req }) => req.user?.role === 'super-admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
    admin: () => true,
  },
}
