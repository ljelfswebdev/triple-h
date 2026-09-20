export const navigationDefaults = [
  {
    key: "main",
    label: "Main navigation",
    description: "Primary links shown in the website header.",
    items: [
      { label: "About", type: "custom", url: "/about", pageSlug: "", newTab: false },
      { label: "Services", type: "custom", url: "/services", pageSlug: "", newTab: false },
      { label: "Projects", type: "custom", url: "/projects", pageSlug: "", newTab: false },
      { label: "Compliance", type: "custom", url: "/compliance", pageSlug: "", newTab: false },
      { label: "News", type: "custom", url: "/news", pageSlug: "", newTab: false },
      { label: "Careers", type: "custom", url: "/careers", pageSlug: "", newTab: false },
    ],
  },
  {
    key: "footer-services",
    label: "Footer services",
    description: "Service links shown in the first footer menu.",
    items: [
      { label: "Tree Surgery", type: "custom", url: "/services/tree-surgery", pageSlug: "", newTab: false },
      { label: "Site Clearance", type: "custom", url: "/services/site-clearance", pageSlug: "", newTab: false },
      { label: "Rope Access", type: "custom", url: "/services/rope-access", pageSlug: "", newTab: false },
      { label: "Traffic Management", type: "custom", url: "/services/traffic-management", pageSlug: "", newTab: false },
      { label: "Landscaping", type: "custom", url: "/services/landscaping", pageSlug: "", newTab: false },
      { label: "Invasive Weed Control", type: "custom", url: "/services/invasive-weed-control", pageSlug: "", newTab: false },
    ],
  },
  {
    key: "footer-explore",
    label: "Footer explore",
    description: "Company links shown in the second footer menu.",
    items: [
      { label: "About us", type: "custom", url: "/about", pageSlug: "", newTab: false },
      { label: "Projects", type: "custom", url: "/projects", pageSlug: "", newTab: false },
      { label: "Careers", type: "custom", url: "/careers", pageSlug: "", newTab: false },
      { label: "Customer & employee portal", type: "custom", url: "/portal", pageSlug: "", newTab: false },
      { label: "Privacy policy", type: "custom", url: "/privacy-policy", pageSlug: "", newTab: false },
    ],
  },
];

export const navigationDefaultsByKey = Object.fromEntries(
  navigationDefaults.map((navigation) => [navigation.key, navigation]),
);

