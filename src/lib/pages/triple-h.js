import { link, media, repeater, richText, seoFields, text } from "./fields.js";
import { MEDIA } from "../triple-h-data.js";
import { defaultSiteCopy } from "../site-copy.js";

const t = (name, label, defaultValue, extra = {}) =>
  text(name, label, { defaultValue, ...extra });
const rt = (name, label, defaultValue) => richText(name, label, { defaultValue });
const image = (name, label, url, alt) =>
  media(name, label, {
    defaultValue: { alt, publicId: "", resourceType: "image", secureUrl: url, url },
  });
const tab = (id, label, path, fields) => ({ id, label, path, fields });
const seoTab = tab("seo", "SEO", ["seo"], seoFields);
const linkWithDefault = (name, label, value) => ({ ...link(name, label), defaultValue: value });

const portalAuthFields = () => {
  const copy = defaultSiteCopy.portal;
  return [
    t("loginEyebrow", "Login eyebrow", copy.loginEyebrow), t("loginTitle", "Login heading", copy.loginTitle), t("loginText", "Login introduction", copy.loginText, { multiline: true }),
    t("emailLabel", "Email label", copy.emailLabel), t("emailPlaceholder", "Email placeholder", copy.emailPlaceholder), t("passwordLabel", "Password label", copy.passwordLabel), t("passwordPlaceholder", "Password placeholder", copy.passwordPlaceholder),
    t("signInLabel", "Sign-in button", copy.signInLabel), t("signingInLabel", "Signing-in label", copy.signingInLabel), t("forgotLabel", "Forgot-password label", copy.forgotLabel), t("emailFirstMessage", "Missing-email message", copy.emailFirstMessage), t("resetSentMessage", "Reset-sent message", copy.resetSentMessage), t("loginErrorMessage", "Login error fallback", copy.loginErrorMessage),
    t("newCustomerLabel", "New-customer prompt", copy.newCustomerLabel), t("createAccountLinkLabel", "Create-account link", copy.createAccountLinkLabel), t("backToLoginLabel", "Back-to-login label", copy.backToLoginLabel),
    t("registerEyebrow", "Registration eyebrow", copy.registerEyebrow), t("registerTitle", "Registration heading", copy.registerTitle), t("registerText", "Registration introduction", copy.registerText, { multiline: true }),
    t("nameLabel", "Name label", copy.nameLabel), t("namePlaceholder", "Name placeholder", copy.namePlaceholder), t("companyLabel", "Company label", copy.companyLabel), t("companyPlaceholder", "Company placeholder", copy.companyPlaceholder), t("workEmailLabel", "Work-email label", copy.workEmailLabel), t("phoneLabel", "Phone label", copy.phoneLabel), t("phonePlaceholder", "Phone placeholder", copy.phonePlaceholder),
    t("newPasswordLabel", "New-password label", copy.newPasswordLabel), t("newPasswordPlaceholder", "New-password placeholder", copy.newPasswordPlaceholder), t("confirmPasswordLabel", "Confirm-password label", copy.confirmPasswordLabel), t("confirmPasswordPlaceholder", "Confirm-password placeholder", copy.confirmPasswordPlaceholder),
    t("consentLabel", "Privacy consent", copy.consentLabel, { multiline: true }), t("newsletterConsentLabel", "Newsletter consent", copy.newsletterConsentLabel, { multiline: true }), t("createAccountLabel", "Create-account button", copy.createAccountLabel), t("creatingAccountLabel", "Creating-account label", copy.creatingAccountLabel), t("registerErrorMessage", "Registration error fallback", copy.registerErrorMessage),
  ];
};

const portalDashboardFields = () => {
  const copy = defaultSiteCopy.portal;
  return [
    t("passwordButtonLabel", "Password button", copy.passwordButtonLabel), t("logoutLabel", "Logout button", copy.logoutLabel), t("portalSuffix", "Portal suffix", copy.portalSuffix),
    t("securityTitle", "Account-security heading", copy.securityTitle), t("securityText", "Account-security text", copy.securityText, { multiline: true }),
    t("dashboardEyebrow", "Dashboard eyebrow", copy.dashboardEyebrow), t("greetingPrefix", "Greeting prefix", copy.greetingPrefix), t("employeeWelcomeText", "Employee welcome text", copy.employeeWelcomeText), t("customerWelcomeText", "Customer welcome text", copy.customerWelcomeText), t("newsletterToggleLabel", "Newsletter toggle label", copy.newsletterToggleLabel),
    { ...repeater("employeeMetrics", "Employee metric cards", [t("label", "Label", "Metric"), t("value", "Value", "0"), t("text", "Description", "Description")]), defaultValue: copy.employeeMetrics },
    { ...repeater("customerMetrics", "Customer metric cards", [t("label", "Label", "Metric"), t("value", "Value", "0"), t("text", "Description", "Description")]), defaultValue: copy.customerMetrics },
    t("notificationsEyebrow", "Notifications eyebrow", copy.notificationsEyebrow), t("notificationsTitle", "Notifications heading", copy.notificationsTitle), t("updatesLabel", "Updates count label", copy.updatesLabel), t("noNotificationsText", "No-notifications text", copy.noNotificationsText),
    t("quickActionsEyebrow", "Quick-actions eyebrow", copy.quickActionsEyebrow), t("employeeActionsTitle", "Employee-actions heading", copy.employeeActionsTitle), t("customerActionsTitle", "Customer-actions heading", copy.customerActionsTitle),
    { ...repeater("employeeActions", "Employee quick actions", [t("text", "Action", "Action")]), defaultValue: copy.employeeActions },
    { ...repeater("customerActions", "Customer quick actions", [t("text", "Action", "Action")]), defaultValue: copy.customerActions },
  ];
};

const portalSecurityFields = () => {
  const copy = defaultSiteCopy.portal;
  return [
    t("changePasswordTitle", "Change-password heading", copy.changePasswordTitle), t("currentPasswordLabel", "Current-password label", copy.currentPasswordLabel), t("currentPasswordPlaceholder", "Current-password placeholder", copy.currentPasswordPlaceholder),
    t("changedPasswordLabel", "Changed-password label", copy.changedPasswordLabel), t("changedConfirmLabel", "Changed-password confirmation label", copy.changedConfirmLabel), t("changedConfirmPlaceholder", "Changed-password confirmation placeholder", copy.changedConfirmPlaceholder),
    t("updatePasswordLabel", "Update-password button", copy.updatePasswordLabel), t("passwordUpdatedMessage", "Password-updated message", copy.passwordUpdatedMessage),
  ];
};

function hero(eyebrow, title, textValue, imageUrl = MEDIA.hero) {
  return tab("hero", "Hero", ["content", "hero"], [
    t("eyebrow", "Eyebrow", eyebrow),
    t("title", "Heading", title, { multiline: true }),
    rt("text", "Introduction", textValue),
    image("image", "Hero image", imageUrl, title),
  ]);
}

function shell(title, publicPath, heroDefaults, extraTabs = []) {
  return {
    title,
    publicPath,
    seoDescription: heroDefaults[2],
    tabs: [hero(...heroDefaults), ...extraTabs, seoTab],
  };
}

const archive = (title, publicPath, eyebrow, heading, intro, imageUrl) =>
  shell(title, publicPath, [eyebrow, heading, intro, imageUrl]);

export const tripleHPageDefinitions = {
  homepage: shell("Homepage", "/", [
    "Contracts · Plant · People",
    "Real work. Great people. Building tomorrow.",
    "A modern, safety-led workforce delivering vegetation, arboriculture, plant and infrastructure support across the UK.",
    MEDIA.hero,
  ], [
    tab("hero-actions", "Hero actions", ["content", "heroActions"], [
      { ...link("primaryLink", "Primary button"), defaultValue: { label: "Explore our capability", url: "/services", newTab: false } },
      { ...link("careersLink", "Careers button"), defaultValue: { label: "Join our team", url: "/careers", newTab: false } },
    ]),
    tab("ticker", "Values ticker", ["content", "ticker"], [
      t("ariaLabel", "Accessibility label", "Triple H values and standards"),
      {
        ...repeater("items", "Ticker words", [t("text", "Word or phrase", "Safety")]),
        defaultValue: ["Safety", "Quality", "Teamwork", "Progression", "Accountability", "Capability", "Reliability", "Respect"].map((textValue) => ({ text: textValue })),
      },
    ]),
    tab("capability", "Services intro", ["content", "capability"], [
      t("eyebrow", "Eyebrow", "What we do"),
      t("title", "Heading", "Built for the work others can’t afford to get wrong.", { multiline: true }),
      rt("text", "Text", "We bring trained people, specialist plant and disciplined planning together for demanding commercial and infrastructure environments."),
    ]),
    tab("standard", "Triple H standard", ["content", "standard"], [
      t("number", "Image caption number", "01"),
      t("eyebrow", "Eyebrow", "The Triple H standard"),
      t("title", "Heading", "Sharp systems. Solid people. Zero theatre.", { multiline: true }),
      rt("text", "Text", "Every programme starts with clear planning and finishes with accountable delivery. Safety, communication and respect for the environment are built into the job."),
      image("image", "Section image", MEDIA.team, "Triple H team planning work on site"),
      { ...link("link", "Section button"), defaultValue: { label: "How we work", url: "/compliance", newTab: false } },
      {
        ...repeater("points", "Standards", [t("text", "Point", "Add a standard")]),
        defaultValue: [
          { text: "Competent, ticketed operatives" },
          { text: "RAMS-led delivery" },
          { text: "Live communication and documentation" },
          { text: "Specialist plant and access capability" },
        ],
      },
    ]),
    tab("careers", "Careers panel", ["content", "careers"], [
      t("eyebrow", "Eyebrow", "Careers at Triple H"),
      t("title", "Heading", "Do work you can point to."),
      rt("text", "Text", "We’re growing practical teams with the tickets, backing and progression to build a proper career."),
      image("image", "Background image", MEDIA.arborist, "A skilled arborist working at height"),
      { ...link("link", "Section button"), defaultValue: { label: "See open roles", url: "/careers", newTab: false } },
    ]),
    tab("projects", "Projects section", ["content", "projects"], [
      t("eyebrow", "Eyebrow", "Selected work"),
      t("title", "Heading", "Proof is in the delivery."),
      { ...link("link", "Section button"), defaultValue: { label: "View all projects", url: "/projects", newTab: false } },
    ]),
    tab("news", "News & enquiry", ["content", "news"], [
      t("eyebrow", "News eyebrow", "Latest"),
      t("title", "News heading", "From the ground."),
      t("enquiryEyebrow", "Enquiry eyebrow", "Start a conversation"),
      t("enquiryTitle", "Enquiry heading", "Tell us what the job needs."),
    ]),
    tab("emergency", "Emergency strip", ["content", "emergency"], [
      t("eyebrow", "Eyebrow", "24/7 Emergency"),
      t("title", "Heading", "Need a rapid response?"),
    ]),
    tab("proof", "Key facts", ["content", "proof"], [
      {
        ...repeater("items", "Facts", [t("value", "Value", "24/7"), t("label", "Label", "Emergency response")]),
        defaultValue: [
          { value: "24/7", label: "Emergency response" },
          { value: "UK", label: "Nationwide capability" },
          { value: "360°", label: "Integrated delivery" },
          { value: "1 team", label: "From plan to completion" },
        ],
      },
    ]),
  ]),
  about: shell("About us", "/about", ["About Triple H", "Big ambition. Grounded delivery.", "A practical contractor built around capable people, clear standards and long-term relationships.", MEDIA.team], [
    tab("intro", "Introduction", ["content", "intro"], [
      t("eyebrow", "Eyebrow", "Who we are"),
      t("title", "Heading", "Built to make difficult work feel controlled.", { multiline: true }),
      rt("body", "Content", "<p>Triple H Contracts & Hire brings together operatives, supervisors, machinery and specialist partners to help commercial and infrastructure clients deliver safely and efficiently.</p><p>We invest in good people, practical systems and the right kit—then put clear communication around every job.</p>"),
      image("image", "Image", MEDIA.team, "Triple H team reviewing a site plan"),
      { ...link("link", "Button"), defaultValue: { label: "Meet the team", url: "/about/meet-the-team", newTab: false } },
    ]),
    tab("directory", "Page directory", ["content", "directory"], [
      t("eyebrow", "Eyebrow", "Explore Triple H"),
      t("title", "Heading", "More than the work itself."),
      {
        ...repeater("items", "Directory cards", [
          t("number", "Number", "01"),
          t("title", "Title", "Page title"),
          rt("text", "Text", "Page summary"),
          link("link", "Destination"),
        ]),
        defaultValue: [
          { number: "01", title: "Meet the team", text: "The people who plan, manage and deliver the work.", link: { label: "Meet the team", url: "/about/meet-the-team", newTab: false } },
          { number: "02", title: "Our story", text: "How Triple H grew and where the business is heading.", link: { label: "Our story", url: "/about/our-story", newTab: false } },
          { number: "03", title: "Values & standards", text: "The principles we bring to every site and relationship.", link: { label: "Values & standards", url: "/about/values", newTab: false } },
          { number: "04", title: "Testimonials", text: "What clients say about working with our team.", link: { label: "Testimonials", url: "/about/testimonials", newTab: false } },
        ],
      },
    ]),
    tab("values", "Values", ["content", "values"], [
      t("eyebrow", "Eyebrow", "What drives us"),
      t("title", "Heading", "Four words. One standard."),
      {
        ...repeater("items", "Values", [t("number", "Number", "01"), t("title", "Title", "Safety"), rt("text", "Text", "Describe this value")]),
        defaultValue: [
          { number: "01", title: "Safety", text: "Plan thoroughly, speak up early and protect everyone around the job." },
          { number: "02", title: "Quality", text: "Take ownership of the finish, the detail and the client experience." },
          { number: "03", title: "Teamwork", text: "Share knowledge, back each other and communicate without ego." },
          { number: "04", title: "Progression", text: "Invest in better people, smarter systems and stronger capability." },
        ],
      },
    ]),
  ]),
  "meet-the-team": shell("Meet the team", "/about/meet-the-team", ["Meet the team", "Real people. Serious capability.", "Good work starts with good people. Meet the team driving our standards on site and behind the scenes.", MEDIA.team], [
    tab("intro", "Page introduction", ["content", "intro"], [t("eyebrow", "Eyebrow", "People behind the work"), t("title", "Heading", "One team. Every detail covered."), rt("text", "Text", "Select a team member to read more about their role, experience and approach.")]),
  ]),
  testimonials: shell("Testimonials", "/about/testimonials", ["Client testimonials", "Trusted to get it done.", "Straight feedback from the people who trust Triple H to deliver in demanding environments.", MEDIA.hero], [
    tab("intro", "Page introduction", ["content", "intro"], [t("eyebrow", "Eyebrow", "What clients say"), t("title", "Heading", "Results build relationships."), rt("text", "Text", "Long-term partnerships are earned through safe delivery, straight communication and a team that follows through.")]),
  ]),
  "our-story": shell("Our story", "/about/our-story", ["About Triple H", "Our story", "A practical business built around capable people, honest relationships and a determination to keep raising the standard.", MEDIA.team], [
    tab("content", "Content", ["content", "editorial"], [rt("body", "Page content", "<h2>Built from the ground up.</h2><p>Triple H Contracts & Hire grew from a simple belief: demanding outdoor work deserves better planning, better communication and a team that takes real pride in the finish.</p><p>Today, we bring together skilled operatives, supervisors, specialist plant and trusted partners to support infrastructure and commercial clients across the UK.</p><h2>Ready for the next challenge.</h2><p>We continue to invest in people, machinery and systems so we can take on more complex projects without losing the responsive, personal service that shaped the business.</p>")]),
  ]),
  values: shell("Values & standards", "/about/values", ["How we work", "Our values & standards", "Safety, quality, teamwork and progression are the standards behind every decision we make.", MEDIA.hero], [
    tab("content", "Content", ["content", "editorial"], [rt("body", "Page content", "<h2>Safety comes first.</h2><p>We plan thoroughly, speak up early and make sure everyone understands the method before work begins.</p><h2>Quality is owned.</h2><p>Every member of the team is responsible for the finish, the details and the client experience.</p><h2>Teamwork gets it done.</h2><p>We share knowledge, communicate without ego and back each other when conditions change.</p><h2>Progression keeps us moving.</h2><p>We invest in training, better equipment and smarter systems that create stronger careers and better outcomes.</p>")]),
  ]),
  services: shell("Services", "/services", ["Our capability", "Work ready. Site ready. Future ready.", "People, plant and planning for demanding environments.", MEDIA.hero]),
  projects: shell("Projects", "/projects", ["Selected work", "Delivery you can see.", "Selected projects that show how our people, plant and planning come together on site.", MEDIA.team]),
  news: shell("News", "/news", ["From the ground", "What’s moving at Triple H.", "People, plant, projects and progress from across the business.", MEDIA.arborist], [
    tab("filters", "Archive controls", ["content", "filters"], [
      t("toggleLabel", "Mobile filter button", "Filter news"), t("eyebrow", "Filter eyebrow", "Find a story"), t("title", "Filter heading", "Filter news."),
      t("searchLabel", "Search label", "Search"), t("searchPlaceholder", "Search placeholder", "Search news"),
      t("categoryLabel", "Category label", "Category"), t("categoryPlaceholder", "Category placeholder", "All categories"),
      t("dateLabel", "Date label", "Date"), t("datePlaceholder", "Date placeholder", "All dates"),
      t("sortLabel", "Sort label", "Sort by"), t("sortPlaceholder", "Sort placeholder", "Sort news"),
      t("sortNewestLabel", "Newest-first option", "Date: newest first"), t("sortOldestLabel", "Oldest-first option", "Date: oldest first"),
      t("sortAzLabel", "A–Z option", "Title: A–Z"), t("sortZaLabel", "Z–A option", "Title: Z–A"),
      t("clearAllLabel", "Clear-all label", "Clear all filters"), t("resultsEyebrow", "Results eyebrow", "Latest updates"),
      t("singularLabel", "Singular result label", "story"), t("pluralLabel", "Plural result label", "stories"),
      t("activeLabel", "Active-filter connector", "active"), t("activeSingularLabel", "Singular active-filter label", "filter"), t("activePluralLabel", "Plural active-filter label", "filters"),
      t("emptyTitle", "No-results heading", "No stories found."), t("emptyText", "No-results text", "Try a different search, category or date.", { multiline: true }), t("emptyButtonLabel", "No-results button", "Clear filters"),
    ]),
  ]),
  careers: shell("Careers", "/careers", ["Join the team", "Good people build great work.", "Real responsibility, proper backing and work you can be proud of.", MEDIA.team], [
    tab("intro", "Introduction", ["content", "intro"], [t("eyebrow", "Eyebrow", "Why Triple H"), t("title", "Heading", "More than a job on the tools."), rt("text", "Text", "We want capable people to stay, grow and lead. That means clear standards, strong supervision, useful training and opportunities to progress as the business grows."), image("image", "Image", MEDIA.arborist, "Arborist working safely in a mature tree")]),
    tab("jobs", "Jobs section", ["content", "jobs"], [t("eyebrow", "Eyebrow", "Open roles"), t("title", "Heading", "Find your next move.")]),
  ]),
  compliance: shell("Compliance", "/compliance", ["Compliance", "Safety isn’t a badge. It’s the operating system.", "Trust is built through visible systems, competent people and disciplined delivery.", MEDIA.arborist], [
    tab("content", "Operational control", ["content", "operational"], [t("eyebrow", "Eyebrow", "Operational control"), t("title", "Heading", "From planning to proof."), rt("body", "Content", "<p>Our compliance structure is designed to make expectations clear before teams arrive on site and keep the right information available throughout delivery.</p><p>Current certification evidence and supporting documents are available to clients as part of our tender and mobilisation process.</p>"), { ...repeater("systems", "Systems", [t("text", "System", "Add a system")]), defaultValue: ["Daily vehicle and plant checks", "Work planning and job allocation", "Risk assessments and method statements", "Live sign-on and site documentation", "Central records and audit readiness", "Environmental and waste controls"].map((textValue) => ({ text: textValue })) }]),
    tab("accreditations", "Accreditations", ["content", "accreditations"], [
      t("eyebrow", "Eyebrow", "Accreditations"),
      t("title", "Heading", "Evidence clients can procure with confidence."),
      {
        ...repeater("items", "Accreditations", [t("title", "Name", "Accreditation"), t("text", "Supporting text", "Current verification details available on request")]),
        defaultValue: ["ISO 9001", "CHAS", "Constructionline", "SSIP", "NHSS", "BS 3998:2010"].map((title) => ({ title, text: "Current verification details available on request" })),
      },
    ]),
  ]),
  contact: shell("Contact", "/contact", ["Contact", "Let’s get the right people on it.", "Tell us what’s happening, where it is and what good looks like.", MEDIA.hero], [
    tab("contact", "Contact panel", ["content", "contact"], [t("eyebrow", "Eyebrow", "Direct contact"), t("title", "Heading", "We’d rather have the conversation."), t("emergencyTitle", "Emergency heading", "24/7 emergency?"), rt("emergencyText", "Emergency text", "Call the number above for the fastest route.")]),
  ]),
  portal: {
    title: "Portal",
    publicPath: "/portal",
    seoDescription: "Secure customer and employee access to Triple H updates, documents and project information.",
    noIndex: true,
    tabs: [
      tab("access", "Sign in & registration", ["content", "portal", "auth"], portalAuthFields()),
      tab("dashboard", "Dashboard copy", ["content", "portal", "dashboard"], portalDashboardFields()),
      tab("security", "Password settings", ["content", "portal", "security"], portalSecurityFields()),
      seoTab,
    ],
  },
  "portal-reset-password": {
    title: "Reset password",
    publicPath: "/portal/reset-password",
    seoDescription: "Reset your Triple H portal password securely.",
    noIndex: true,
    tabs: [
      tab("reset", "Reset form", ["content", "reset"], [
        t("resetEyebrow", "Reset eyebrow", defaultSiteCopy.portal.resetEyebrow), t("resetTitle", "Reset heading", defaultSiteCopy.portal.resetTitle),
        t("resetNewLabel", "New-password label", defaultSiteCopy.portal.resetNewLabel), t("newPasswordPlaceholder", "New-password placeholder", defaultSiteCopy.portal.newPasswordPlaceholder),
        t("resetConfirmLabel", "Confirmation label", defaultSiteCopy.portal.resetConfirmLabel), t("changedConfirmPlaceholder", "Confirmation placeholder", defaultSiteCopy.portal.changedConfirmPlaceholder),
        t("resetButtonLabel", "Reset button", defaultSiteCopy.portal.resetButtonLabel), t("resetSuccessMessage", "Success message", defaultSiteCopy.portal.resetSuccessMessage, { multiline: true }),
      ]),
      seoTab,
    ],
  },
  "not-found": {
    title: "404 page",
    publicPath: "/404",
    seoDescription: "Page not found.",
    noIndex: true,
    tabs: [
      tab("content", "Page content", ["content", "notFound"], [
        t("code", "Error code", defaultSiteCopy.notFound.code), t("title", "Heading", defaultSiteCopy.notFound.title, { multiline: true }),
        t("text", "Message", defaultSiteCopy.notFound.text, { multiline: true }), t("backLabel", "Back button", defaultSiteCopy.notFound.backLabel), t("homeLabel", "Homepage button", defaultSiteCopy.notFound.homeLabel),
      ]),
      seoTab,
    ],
  },
};
