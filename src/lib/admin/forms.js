import {
  defaultFormErrorMessage,
  defaultFormSuccessMessage,
} from "../form-messages.js";

export const formFieldTypes = [
  { label: "Text", value: "text" },
  { label: "Date", value: "date" },
  { label: "Select", value: "select" },
  { label: "Textarea", value: "textarea" },
  { label: "Consent", value: "consent" },
  { label: "Submit", value: "submit" },
];

const valueFieldTypes = ["text", "date", "select", "textarea", "consent"];
const placeholderFieldTypes = ["text", "select", "textarea"];

export const formFieldDefinition = [
  {
    name: "type",
    label: "Field type",
    type: "select",
    options: formFieldTypes,
  },
  {
    name: "label",
    label: "Label",
    type: "text",
    showWhen: { field: "type", values: valueFieldTypes },
  },
  {
    name: "name",
    label: "Field name",
    type: "text",
    showWhen: { field: "type", values: valueFieldTypes },
  },
  {
    name: "placeholder",
    label: "Placeholder",
    type: "text",
    showWhen: { field: "type", values: placeholderFieldTypes },
  },
  {
    name: "required",
    label: "Required",
    type: "boolean",
    showWhen: { field: "type", values: valueFieldTypes },
  },
  {
    name: "options",
    label: "Select options",
    type: "repeater",
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "value", label: "Value", type: "text" },
    ],
    showWhen: { field: "type", value: "select" },
  },
  {
    name: "buttonText",
    label: "Button text",
    type: "text",
    showWhen: { field: "type", value: "submit" },
  },
  {
    name: "busyText",
    label: "Submitting text",
    type: "text",
    showWhen: { field: "type", value: "submit" },
  },
];

export const defaultForm = {
  name: "New form",
  key: "new-form",
  recipientEmail: "",
  successMessage: defaultFormSuccessMessage,
  errorMessage: defaultFormErrorMessage,
  fields: [],
};

export const seedForms = [
  {
    name: "Service enquiry",
    key: "service-enquiry",
    recipientEmail: "",
    successMessage: "Thanks. Your enquiry is with our team.",
    errorMessage: "Please check the form and try again.",
    fields: [
      {
        type: "text",
        label: "Name",
        name: "name",
        placeholder: "Full name",
        required: true,
        width: "full",
      },
      {
        type: "text",
        label: "Email",
        name: "email",
        placeholder: "name@company.com",
        required: true,
        width: "full",
      },
      {
        type: "text",
        label: "Phone",
        name: "phone",
        placeholder: "e.g. 07939 306252",
        required: false,
        width: "full",
      },
      {
        type: "text",
        label: "Service",
        name: "service",
        placeholder: "Service required",
        required: true,
        width: "full",
      },
      {
        type: "textarea",
        label: "How can we help?",
        name: "message",
        placeholder: "Tell us what you need help with",
        required: true,
        width: "full",
      },
      {
        type: "consent",
        label: "Send me Triple H news and updates",
        name: "newsletter",
        required: false,
      },
      {
        type: "submit",
        buttonText: "Send enquiry",
        busyText: "Sending…",
      },
    ],
  },
  {
    name: "Career application",
    key: "career-application",
    recipientEmail: "",
    successMessage: "Thanks. Your application has been sent to our team.",
    errorMessage: "Your application could not be sent. Please check the form and try again.",
    fields: [
      { type: "text", label: "Name", name: "name", placeholder: "Full name", required: true, width: "full" },
      { type: "text", label: "Email", name: "email", placeholder: "name@example.com", required: true, width: "full" },
      { type: "text", label: "Phone", name: "phone", placeholder: "e.g. 07939 306252", required: false, width: "full" },
      { type: "text", label: "CV (PDF or Word, max 5 MB)", name: "cv", placeholder: "Choose your CV", required: true, width: "full" },
      { type: "textarea", label: "Tell us about yourself", name: "message", placeholder: "Experience, qualifications and availability", required: false, width: "full" },
      { type: "consent", label: "I consent to Triple H processing my application details.", name: "consent", required: true },
      { type: "submit", buttonText: "Send application", busyText: "Uploading…" },
    ],
  },
  {
    name: "Newsletter signup",
    key: "newsletter-signup",
    recipientEmail: "",
    successMessage: "You’re on the list. Thanks for signing up.",
    errorMessage: "We could not add you right now. Please try again.",
    fields: [
      { type: "text", label: "Email address", name: "email", placeholder: "Your email address", required: true, width: "full" },
      { type: "submit", buttonText: "Sign up", busyText: "Joining…" },
    ],
  },
];
