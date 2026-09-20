import { getForm } from "@/lib/site-data";
import FormClient from "./FormClient";

export default async function FormRenderer({ formId, variant }) {
  if (!formId) {
    return null;
  }

  const form = await getForm(formId);
  if (!form) {
    return null;
  }

  return <FormClient form={form} variant={variant} />;
}
