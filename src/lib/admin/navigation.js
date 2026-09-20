export const navigationItemFields = [
  { name: "label", label: "Label", type: "text" },
  {
    name: "type",
    label: "Destination type",
    type: "select",
    options: [
      { label: "Page", value: "page" },
      { label: "Custom URL", value: "custom" },
    ],
  },
  {
    name: "pageSlug",
    label: "Page",
    type: "pageSelect",
    showWhen: { field: "type", value: "page" },
  },
  {
    name: "url",
    label: "Custom URL",
    type: "text",
    inputType: "url",
    showWhen: { field: "type", value: "custom" },
  },
  { name: "newTab", label: "Open in a new tab", type: "boolean" },
];

export {
  navigationDefaults as defaultNavigations,
  navigationDefaultsByKey,
} from "../navigation-data.js";

export { navigationDefaults } from "../navigation-data.js";

import { navigationDefaults } from "../navigation-data.js";

export const defaultNavigation = navigationDefaults[0];
