export const villageSeed = {
  code: "desa-sejahtera",
  name: "Kelurahan Sejahtera",
  rws: [
    {
      number: "01",
      rts: ["001", "002"],
    },
    {
      number: "02",
      rts: ["003", "004"],
    },
  ],
};

export const demoUsers = [
  {
    fullName: "Dina Warga",
    email: "warga@demo.local",
    password: "demo1234",
    role: "WARGA" as const,
    rwNumber: "01",
    rtNumber: "001",
  },
  {
    fullName: "Rama Warga",
    email: "warga2@demo.local",
    password: "demo1234",
    role: "WARGA" as const,
    rwNumber: "01",
    rtNumber: "002",
  },
  {
    fullName: "Admin RT Satu",
    email: "adminrt@demo.local",
    password: "demo1234",
    role: "ADMIN_RT" as const,
    rwNumber: "01",
    rtNumber: "001",
  },
  {
    fullName: "Admin RW Satu",
    email: "adminrw@demo.local",
    password: "demo1234",
    role: "ADMIN_RW" as const,
    rwNumber: "01",
    rtNumber: null,
  },
];
