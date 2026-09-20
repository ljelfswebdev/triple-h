import { defaultSiteCopy } from "../site-copy.js";

const text = (name, label, extra = {}) => ({ name, label, type: "text", ...extra });
const link = (name, label) => ({ name, label, type: "link" });
const repeater = (name, label, fields) => ({ name, label, type: "repeater", fields });

export const globalTabs = [
  {
    id: "branding",
    label: "Branding",
    path: ["siteCopy", "branding"],
    fields: [text("name", "Company name"), text("shortName", "Short company name"), text("strapline", "Strapline", { multiline: true })],
  },
  {
    id: "header",
    label: "Header",
    path: ["siteCopy", "header"],
    fields: [
      text("skipLabel", "Skip-link label"), text("menuLabel", "Menu label"), text("exploreLabel", "Dropdown eyebrow"),
      text("megaDescription", "Dropdown introduction", { multiline: true }), text("backLabel", "Mobile back label"),
      link("contactLink", "Contact button"), link("portalLink", "Portal button"),
      text("servicesOverviewLabel", "Services overview label"), text("servicesOverviewDescription", "Services overview description", { multiline: true }),
      repeater("aboutLinks", "About dropdown links", [text("label", "Label"), text("description", "Description", { multiline: true }), link("link", "Destination")]),
    ],
  },
  {
    id: "footer-copy",
    label: "Footer copy",
    path: ["siteCopy", "footer"],
    fields: [
      text("newsletterEyebrow", "Newsletter eyebrow"), text("newsletterTitle", "Newsletter heading", { multiline: true }),
      text("servicesHeading", "Services menu heading"), text("exploreHeading", "Explore menu heading"), text("contactHeading", "Contact heading"),
      text("emergencyText", "Emergency text"), text("copyrightText", "Copyright text"), text("valuesText", "Footer values"), link("cta", "Footer button"),
    ],
  },
  {
    id: "accreditation-banner",
    label: "Accreditation banner",
    path: ["siteCopy", "accreditationBanner"],
    fields: [
      text("eyebrow", "Eyebrow"), text("title", "Heading", { multiline: true }),
      text("itemFallback", "Missing-description fallback"), text("ariaLabel", "Accessible label"),
      link("link", "Compliance link"),
    ],
  },
  {
    id: "cards",
    label: "Cards & lists",
    path: ["siteCopy", "cards"],
    fields: [text("exploreLabel", "Card link label"), text("viewDetailsLabel", "Accessible details label"), text("viewRoleLabel", "Vacancy link label"), text("viewProfileLabel", "Team profile label"), text("rolesPaginationLabel", "Roles pagination label"), text("teamPaginationLabel", "Team pagination label"), text("newsPaginationLabel", "News pagination label"), text("entriesPaginationLabel", "General pagination label"), text("vacancyCategoryFallback", "Vacancy category fallback"), text("testimonialPaginationLabel", "Testimonials pagination label"), text("testimonialReadMoreLabel", "Testimonial read-more label"), text("testimonialModalPrefix", "Testimonial modal prefix"), text("testimonialModalFallback", "Testimonial modal fallback")],
  },
  {
    id: "pagination",
    label: "Pagination",
    path: ["siteCopy", "pagination"],
    fields: [text("previousLabel", "Previous-page accessible label"), text("previousShortLabel", "Previous button label"), text("nextLabel", "Next-page accessible label"), text("nextShortLabel", "Next button label"), text("pageLabel", "Page label"), text("choosePageLabel", "Page chooser label"), text("ofLabel", "Total-pages connector")],
  },
  {
    id: "cookies",
    label: "Cookie notice",
    path: ["siteCopy", "cookie"],
    fields: [text("bannerTitle", "Banner heading"), text("bannerText", "Banner text", { multiline: true }), text("acceptAllLabel", "Accept-all label"), text("preferencesLabel", "Preferences label"), text("rejectOptionalLabel", "Reject-optional label"), text("privacyControlsLabel", "Privacy controls eyebrow"), text("dialogTitle", "Dialog heading"), text("dialogText", "Dialog text", { multiline: true }), text("saveLabel", "Save label"), text("closeLabel", "Close label"), text("alwaysOnLabel", "Always-on label"), text("enabledLabel", "Enabled state label"), text("disabledLabel", "Disabled state label"), repeater("categories", "Cookie categories", [text("id", "Technical ID"), text("title", "Title"), text("description", "Description", { multiline: true }), { name: "required", label: "Required", type: "boolean" }])],
  },
  {
    id: "contact",
    label: "Contact details",
    path: ["contact"],
    fields: [
      { name: "number", label: "Contact number", type: "text" },
      { name: "email", label: "Email", type: "text", inputType: "email" },
      { name: "address", label: "Address", type: "richtext" },
    ],
  },
  {
    id: "socials",
    label: "Socials",
    path: ["socials"],
    fields: [
      {
        name: "facebook",
        label: "Facebook URL",
        type: "text",
        inputType: "url",
      },
      {
        name: "instagram",
        label: "Instagram URL",
        type: "text",
        inputType: "url",
      },
      {
        name: "linkedin",
        label: "LinkedIn URL",
        type: "text",
        inputType: "url",
      },
      {
        name: "youtube",
        label: "YouTube URL",
        type: "text",
        inputType: "url",
      },
    ],
  },
];

export const defaultGlobals = {
  key: "site",
  footer: {
    boldText: "",
    text: "",
    link: { label: "", url: "", newTab: false },
    bottomText: "",
  },
  contact: { number: "", email: "", address: "" },
  socials: { facebook: "", instagram: "", linkedin: "", youtube: "" },
  testimonials: [],
  siteCopy: structuredClone(defaultSiteCopy),
};
