import { NextResponse } from "next/server";
import { requireOperator } from "@/lib/saas/routeAuth.js";
import { getAdapter } from "@/lib/db/driver.js";

export async function GET(request) {
  const op = await requireOperator();
  if (!op.ok) return NextResponse.json({ error: op.error }, { status: op.status });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const db = await getAdapter();

  let where = "1=1";
  const params = [];

  if (status && status !== "all") {
    params.push(status);
    where += ` AND u.status = ?`;
  }
  if (search) {
    params.push(`%${search}%`);
    where += ` AND u.email ILIKE ?`;
  }

  const countRow = await db.get(
    `SELECT COUNT(*) AS total FROM saas_users u WHERE ${where}`,
    params
  );
  const total = Number(countRow?.total ?? 0);

  const users = await db.all(
    `SELECT u.id, u.email, u.status, u.is_operator, u.created_at,
            s.plan_id, s.status AS sub_status, p.display_name AS plan_name
     FROM saas_users u
     LEFT JOIN saas_subscriptions s
       ON s.user_id = u.id AND s.status IN ('trialing','active','past_due')
     LEFT JOIN saas_plans p ON p.id = s.plan_id
     WHERE ${where}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      status: u.status,
      isOperator: u.is_operator === true || u.is_operator === 1,
      createdAt: u.created_at,
      planId: u.plan_id,
      planName: u.plan_name,
      subscriptionStatus: u.sub_status,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
