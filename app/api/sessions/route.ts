import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({
    success: true,
    sessionId: "test-session-" + Date.now(),
    message: "テストセッション作成完了"
  });
}
