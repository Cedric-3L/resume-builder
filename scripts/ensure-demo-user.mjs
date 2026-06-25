import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const envText = await readFile(".env.local", "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const email = "demo@geekcv.com";
const password = "123456";
const now = new Date();
const demoExports = Array.from({ length: 24 }, (_, index) => {
  const createdAt = new Date(now);
  createdAt.setDate(createdAt.getDate() - Math.floor(index * 1.2));
  return createdAt.toISOString();
});
const demoOrders = [0, 1, 2].map((offset) => {
  const createdAt = new Date(now);
  createdAt.setMonth(createdAt.getMonth() - offset);
  return {
    id: crypto.randomUUID(),
    orderNo: `GK${createdAt.toISOString().replace(/\D/g, "").slice(0, 12)}${String(offset + 1).padStart(2, "0")}`,
    productName: "专业版月度会员",
    amount: 29,
    status: "paid",
    invoiceStatus: offset === 0 ? "none" : "issued",
    createdAt: createdAt.toISOString(),
  };
});
const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

let user = usersData.users.find((item) => item.email === email);
if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: "胡小豆",
      geekcv_membership: { plan: "pro", status: "active", expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString() },
      geekcv_orders: demoOrders,
      geekcv_export_events: demoExports,
    },
  });
  if (error) throw error;
  user = data.user;
} else {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...user.user_metadata,
      name: "胡小豆",
      geekcv_membership: { plan: "pro", status: "active", expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString() },
      geekcv_orders: demoOrders,
      geekcv_export_events: demoExports,
    },
  });
  if (error) throw error;
  user = data.user;
}

const { error: profileError } = await supabase.from("profiles").upsert({
  id: user.id,
  name: "胡小豆",
  email,
  target_role: "产品经理",
  bio: "5 年互联网产品经验，擅长从 0 到 1 的产品搭建与增长。",
  avatar_url: "/template-assets/avatars/id-photo.png",
  role: "admin",
});
if (profileError) throw profileError;

const favoriteKeys = ["bilingualResearchBlue", "overseasBusinessAnalyst", "productManagerBlue", "hrRecruitmentTable"];
const { error: favoritesError } = await supabase.from("favorite_templates").upsert(
  favoriteKeys.map((template_key) => ({ user_id: user.id, template_key })),
  { onConflict: "user_id,template_key" }
);
if (favoritesError) throw favoritesError;

const { error: membershipError } = await supabase.from("memberships").upsert({
  user_id: user.id,
  plan: "pro",
  status: "active",
  started_at: now.toISOString(),
  expires_at: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString(),
});
if (membershipError && !["42P01", "PGRST205"].includes(membershipError.code)) throw membershipError;

const { error: ordersError } = await supabase.from("orders").upsert(
  demoOrders.map((order) => ({
    id: order.id,
    order_no: order.orderNo,
    user_id: user.id,
    product_name: order.productName,
    amount_cents: order.amount * 100,
    status: order.status,
    invoice_status: order.invoiceStatus,
    created_at: order.createdAt,
    paid_at: order.createdAt,
  })),
  { onConflict: "order_no" }
);
if (ordersError && !["42P01", "PGRST205"].includes(ordersError.code)) throw ordersError;

console.log("Demo account ready.");
