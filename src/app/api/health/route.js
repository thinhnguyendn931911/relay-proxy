import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/db/driver.js";

export async function GET() {
  try {
    const db = await getAdapter();
    await db.get("SELECT 1");
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error", detail: "database unreachable" }, { status: 503 });
  }
}
