export const navigation = [
  { label: 'INICIO', href: '/' },
  { label: 'NOSOTROS', href: '/nosotros/' },
  {
    label: 'SERVICIOS EMPRESARIALES',
    children: [
      { label: 'Auditoría', href: '/auditoria/' },
      { label: 'Legal', href: '/legal/' },
      { label: 'Asesoría INFONAVIT', href: '/asesoria-infonavit/' },
      { label: 'Pensión', href: '/gestor-de-pensiones/' },
    ],
  },
  { label: 'PENSIÓN', href: '/gestor-de-pensiones/' },
  { label: 'CONTACTO', href: '/#footer' },
];
