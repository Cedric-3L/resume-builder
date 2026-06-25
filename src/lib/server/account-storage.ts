import { createServerSupabase, createServiceRoleClient } from "@/lib/supabase/server";

export type MembershipPlan = "free" | "pro";

export interface AccountOrder {
  id: string;
  orderNo: string;
  productName: string;
  amount: number;
  status: "pending" | "paid" | "refunded" | "cancelled";
  invoiceStatus: "none" | "requested" | "issued";
  createdAt: string;
}

function isMissingTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string };
  return record.code === "42P01" ||
    record.code === "PGRST205" ||
    record.message?.includes("does not exist") ||
    record.message?.includes("schema cache");
}

async function authenticatedClient() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Authentication required");
  return { supabase, user: data.user };
}

export async function getAccountOverview() {
  const { supabase, user } = await authenticatedClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [profileResult, membershipResult, ordersResult, resumeCountResult, exportCountResult] =
    await Promise.all([
      supabase.from("profiles").select("created_at").eq("id", user.id).maybeSingle(),
      supabase.from("memberships").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("export_events").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).gte("created_at", monthStart.toISOString()),
    ]);

  const metadata = user.user_metadata ?? {};
  const fallbackMembership = metadata.geekcv_membership as { plan?: string; status?: string; expiresAt?: string } | undefined;
  const fallbackOrders = Array.isArray(metadata.geekcv_orders) ? metadata.geekcv_orders : [];
  const fallbackExports = Array.isArray(metadata.geekcv_export_events) ? metadata.geekcv_export_events as string[] : [];
  const membership = isMissingTable(membershipResult.error)
    ? fallbackMembership
      ? { plan: fallbackMembership.plan, status: fallbackMembership.status, expires_at: fallbackMembership.expiresAt }
      : null
    : membershipResult.data;
  const orders = isMissingTable(ordersResult.error) ? fallbackOrders : ordersResult.data ?? [];
  const exportsUsed = isMissingTable(exportCountResult.error)
    ? fallbackExports.filter((value) => new Date(value).getTime() >= monthStart.getTime()).length
    : exportCountResult.count ?? 0;
  const plan = (membership?.plan === "pro" ? "pro" : "free") as MembershipPlan;

  return {
    databaseReady: !isMissingTable(membershipResult.error),
    registeredAt: profileResult.data?.created_at ?? user.created_at,
    membership: {
      plan,
      status: membership?.status ?? "active",
      maxResumes: plan === "pro" ? null : 3,
      monthlyExportLimit: plan === "pro" ? null : 5,
      exportsUsed,
      resumeCount: resumeCountResult.count ?? 0,
      expiresAt: membership?.expires_at ?? null,
    },
    orders: orders.map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ""),
      orderNo: String(row.order_no ?? row.orderNo ?? ""),
      productName: String(row.product_name ?? row.productName ?? ""),
      amount: typeof row.amount === "number" ? row.amount : Number(row.amount_cents ?? 0) / 100,
      status: String(row.status ?? "pending"),
      invoiceStatus: String(row.invoice_status ?? row.invoiceStatus ?? "none"),
      createdAt: String(row.created_at ?? row.createdAt ?? ""),
    })) as AccountOrder[],
  };
}

export async function activateProMembership() {
  const { supabase, user } = await authenticatedClient();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  const orderNo = `GK${now.toISOString().replace(/\D/g, "").slice(0, 14)}${Math.floor(Math.random() * 90 + 10)}`;

  const order = {
    id: crypto.randomUUID(),
    orderNo,
    productName: "专业版月度会员",
    amount: 29,
    status: "paid",
    invoiceStatus: "none",
    createdAt: now.toISOString(),
  };
  const { error: orderError } = await supabase.from("orders").insert({
    order_no: orderNo,
    user_id: user.id,
    product_name: "专业版月度会员",
    amount_cents: 2900,
    status: "paid",
    paid_at: now.toISOString(),
  });
  if (orderError && !isMissingTable(orderError)) throw orderError;

  const { error: membershipError } = await supabase.from("memberships").upsert({
    user_id: user.id,
    plan: "pro",
    status: "active",
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });
  if (membershipError && !isMissingTable(membershipError)) throw membershipError;

  if (isMissingTable(orderError) || isMissingTable(membershipError)) {
    const service = createServiceRoleClient();
    const existingOrders = Array.isArray(user.user_metadata?.geekcv_orders)
      ? user.user_metadata.geekcv_orders
      : [];
    const { error } = await service.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        geekcv_membership: { plan: "pro", status: "active", expiresAt: expiresAt.toISOString() },
        geekcv_orders: [order, ...existingOrders],
      },
    });
    if (error) throw error;
  }

  return { orderNo, expiresAt: expiresAt.toISOString() };
}

export async function requestInvoice(orderId: string) {
  const { supabase, user } = await authenticatedClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ invoice_status: "requested" })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .select("id, invoice_status")
    .single();
  if (error && !isMissingTable(error)) throw error;
  if (isMissingTable(error)) {
    const orders = Array.isArray(user.user_metadata?.geekcv_orders)
      ? user.user_metadata.geekcv_orders as Record<string, unknown>[]
      : [];
    const nextOrders = orders.map((order) =>
      order.id === orderId ? { ...order, invoiceStatus: "requested" } : order
    );
    const service = createServiceRoleClient();
    const { error: metadataError } = await service.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, geekcv_orders: nextOrders },
    });
    if (metadataError) throw metadataError;
    return { id: orderId, invoice_status: "requested" };
  }
  return data;
}

export async function recordExportEvent(userId: string, resumeName?: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("export_events").insert({
    user_id: userId,
    resume_name: resumeName,
  });
  if (error && !isMissingTable(error)) throw error;
  if (isMissingTable(error)) {
    const service = createServiceRoleClient();
    const { data } = await service.auth.admin.getUserById(userId);
    if (!data.user) return;
    const previous = Array.isArray(data.user.user_metadata?.geekcv_export_events)
      ? data.user.user_metadata.geekcv_export_events as string[]
      : [];
    await service.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...data.user.user_metadata,
        geekcv_export_events: [new Date().toISOString(), ...previous].slice(0, 100),
        geekcv_last_export_name: resumeName,
      },
    });
  }
}
