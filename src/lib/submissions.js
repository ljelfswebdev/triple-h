import Form from "@/models/Form";

function humaniseFieldName(name) {
  return String(name || "Field")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function plainSubmission(submission) {
  return submission?.toObject ? submission.toObject() : submission;
}

export async function presentSubmissions(submissions) {
  const records = submissions.map(plainSubmission);
  const formIds = records
    .map((submission) => submission.form)
    .filter(Boolean);
  const formKeys = records
    .map((submission) => submission.formKey)
    .filter(Boolean);
  const forms = await Form.find({
    $or: [{ _id: { $in: formIds } }, { key: { $in: formKeys } }],
  })
    .select("key name fields.label fields.name")
    .lean();
  const formsById = new Map(forms.map((form) => [String(form._id), form]));
  const formsByKey = new Map(forms.map((form) => [form.key, form]));

  return records.map((submission) => {
    const form =
      formsById.get(String(submission.form || "")) ||
      formsByKey.get(submission.formKey);
    const labels = new Map(
      (form?.fields || [])
        .filter((field) => field.name)
        .map((field) => [
          field.name,
          field.label || humaniseFieldName(field.name),
        ]),
    );
    const fields = submission.fields?.length
      ? submission.fields.map((field) => ({
          name: field.name,
          label:
            field.label ||
            labels.get(field.name) ||
            humaniseFieldName(field.name),
          value: field.value,
        }))
      : Object.entries(submission.values || {}).map(([name, value]) => ({
          name,
          label: labels.get(name) || humaniseFieldName(name),
          value,
        }));

    return {
      ...submission,
      formName:
        submission.formName ||
        form?.name ||
        submission.formKey ||
        "Form submission",
      fields,
    };
  });
}
