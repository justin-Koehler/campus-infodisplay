import { NextResponse } from "next/server";
import { mockEvents } from "@/lib/mock";
import { getEvents } from "@/lib/smartcity";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getEvents());
  } catch {
    return NextResponse.json(mockEvents());
  }
}
