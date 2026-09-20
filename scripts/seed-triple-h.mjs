import bcrypt from "bcryptjs";
import { config } from "dotenv";
import mongoose from "mongoose";
import { BRAND, collectionDefaults, customerSeed, employeeSeed } from "../src/lib/triple-h-data.js";
import { navigationDefaults } from "../src/lib/navigation-data.js";
import { seedForms } from "../src/lib/admin/forms.js";

config({ path: ".env.local" });

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required in .env.local`);
  return value;
}

const uri = required("MONGODB_URI");
const demoPassword = process.env.SEED_PORTAL_PASSWORD || "TripleH!2026";
if (demoPassword.length < 10)
  throw new Error("SEED_PORTAL_PASSWORD must be at least 10 characters");
await mongoose.connect(uri);

try {
  const now = new Date();
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const users = mongoose.connection.collection("users");
  const adminEmail = required("SEED_ADMIN_EMAIL").toLowerCase();
  await users.updateOne(
    { email: adminEmail },
    {
      $set: {
        name: process.env.SEED_ADMIN_NAME || "Main Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash(required("SEED_ADMIN_PASSWORD"), 12),
        role: "admin",
        active: true,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  for (const [name, email, category] of employeeSeed) {
    await users.updateOne(
      { email },
      {
        $set: { name, email, role: "employee", category, active: true, updatedAt: now },
        $setOnInsert: { passwordHash, mustChangePassword: true, newsletter: false, createdAt: now },
      },
      { upsert: true },
    );
  }
  for (const [name, email, category] of customerSeed) {
    await users.updateOne(
      { email },
      {
        $set: {
          name,
          email,
          role: "customer",
          category,
          company: category,
          active: true,
          updatedAt: now,
        },
        $setOnInsert: { passwordHash, mustChangePassword: true, newsletter: false, createdAt: now },
      },
      { upsert: true },
    );
  }

  const content = mongoose.connection.collection("contentitems");
  for (const [kind, items] of Object.entries(collectionDefaults)) {
    for (const item of items) {
      const meta = { ...item };
      for (const key of ["slug", "title", "excerpt", "body", "image", "category", "date", "location", "salary", "hours", "seo"]) delete meta[key];
      await content.updateOne(
        { kind, slug: item.slug },
        {
          $setOnInsert: {
            kind,
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            body: item.body || "",
            image: item.image || "",
            category: item.category || item.service || "",
            location: item.location || "",
            salary: item.salary || "",
            hours: item.hours || "",
            status: "published",
            meta,
            seo: item.seo || {
              title: `${item.title} | Triple H Contracts & Hire`,
              description: item.excerpt,
              ogTitle: item.title,
              ogDescription: item.excerpt,
              ogImage: item.image ? { secureUrl: item.image, alt: item.title } : null,
              canonical: `/${kind === "service" ? "services" : kind === "vacancy" ? "careers" : `${kind}s`}/${item.slug}`,
              noIndex: false,
            },
            publishedAt: item.date ? new Date(item.date) : now,
            createdAt: now,
          },
          $set: { updatedAt: now },
        },
        { upsert: true },
      );
    }
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

  const globals = mongoose.connection.collection("globals");
  await globals.updateOne(
    { key: "site" },
    {
      $set: {
        contact: { number: BRAND.phone, email: BRAND.email, address: BRAND.address },
        updatedAt: now,
      },
      $setOnInsert: { key: "site", createdAt: now },
    },
    { upsert: true },
  );

  const navigations = mongoose.connection.collection("navigations");
  for (const navigation of navigationDefaults) {
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

  const notifications = mongoose.connection.collection("notifications");
  if ((await notifications.countDocuments()) === 0) {
    await notifications.insertMany([
      {
        title: "Welcome to the new portal",
        message:
          "Your Triple H dashboard is now live. Use it for updates, documents and direct contact with the team.",
        audienceRoles: ["employee", "customer"],
        audienceCategories: [],
        audienceUserIds: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Monday operations briefing",
        message: "Check your allocated work, vehicle details and site documents before travelling.",
        audienceRoles: ["employee"],
        audienceCategories: ["Operations", "Plant"],
        audienceUserIds: [],
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  const subscribers = mongoose.connection.collection("newslettersubscribers");
  for (const [, email] of customerSeed.slice(0, 3)) {
    await subscribers.updateOne(
      { email },
      {
        $setOnInsert: { email, source: "seed-demo", active: true, createdAt: now },
        $set: { updatedAt: now },
      },
      { upsert: true },
    );
  }

  console.log(
    `Triple H demo seeded: 1 admin, ${employeeSeed.length} employees, ${customerSeed.length} customers.`,
  );
  console.log(`Portal demo password: ${demoPassword}`);
} finally {
  await mongoose.disconnect();
}
