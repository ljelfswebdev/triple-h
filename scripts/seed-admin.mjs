import bcrypt from "bcryptjs";
import { config } from "dotenv";
import mongoose from "mongoose";
import {
  defaultGlobals,
  defaultNavigations,
} from "../src/lib/admin-definitions.js";
import { seedForms } from "../src/lib/admin/forms.js";
import { seedPages } from "../src/lib/page-definitions.js";

config({ path: ".env.local" });

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required in .env.local`);
  return value;
}

function mergeDefaults(defaultValue, currentValue) {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(currentValue) && currentValue.length
      ? currentValue
      : defaultValue;
  }
  if (defaultValue && typeof defaultValue === "object") {
    return Object.fromEntries(
      Object.keys({ ...defaultValue, ...currentValue }).map((key) => [
        key,
        mergeDefaults(defaultValue[key], currentValue?.[key]),
      ]),
    );
  }
  return currentValue ?? defaultValue;
}

const uri = required("MONGODB_URI");
const email = required("SEED_ADMIN_EMAIL").toLowerCase();
const password = required("SEED_ADMIN_PASSWORD");
required("AUTH_SECRET");

await mongoose.connect(uri);

try {
  const now = new Date();
  const users = mongoose.connection.collection("users");
  await users.updateOne(
    { email },
    {
      $set: {
        name: process.env.SEED_ADMIN_NAME || "Admin",
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "admin",
        active: true,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  const pages = mongoose.connection.collection("pages");
  for (const seed of seedPages) {
    const existing = await pages.findOne({ slug: seed.slug });
    const merged = mergeDefaults(seed, existing || {});
    await pages.updateOne(
      { slug: seed.slug },
      {
        $set: {
          title: merged.title,
          content: merged.content,
          seo: merged.seo,
          updatedAt: now,
        },
        $setOnInsert: { slug: seed.slug, createdAt: now },
      },
      { upsert: true },
    );
  }

  const globals = mongoose.connection.collection("globals");
  const existingGlobals = await globals.findOne({ key: "site" });
  const mergedGlobals = mergeDefaults(defaultGlobals, existingGlobals || {});
  await globals.updateOne(
    { key: "site" },
    {
      $set: {
        footer: mergedGlobals.footer,
        contact: mergedGlobals.contact,
          socials: mergedGlobals.socials,
          siteCopy: mergedGlobals.siteCopy,
        testimonials: mergedGlobals.testimonials,
        updatedAt: now,
      },
      $setOnInsert: { key: "site", createdAt: now },
    },
    { upsert: true },
  );

  const navigations = mongoose.connection.collection("navigations");
  for (const navigation of defaultNavigations) {
    const existing = await navigations.findOne({ key: navigation.key });
    await navigations.updateOne(
      { key: navigation.key },
      {
        ...(existing?.items?.length ? {} : { $set: { items: navigation.items, updatedAt: now } }),
        $setOnInsert: { key: navigation.key, createdAt: now },
        ...(existing?.items?.length ? { $set: { updatedAt: now } } : {}),
      },
      { upsert: true },
    );
  }

  const forms = mongoose.connection.collection("forms");
  for (const form of seedForms) {
    const existing = await forms.findOne({ key: form.key });
    await forms.updateOne(
      { key: form.key },
      {
        $set: {
          ...form,
          recipientEmail:
            existing?.recipientEmail || process.env.CONTACT_RECIPIENT_EMAIL || "",
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  console.log("Admin, CMS and form defaults seeded successfully.");
} finally {
  await mongoose.disconnect();
}
