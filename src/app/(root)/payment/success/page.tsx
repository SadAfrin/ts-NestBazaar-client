import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import PaymentSuccessClient from "@/components/payment/PaymentSuccessClient";
import { JSX } from "react";

// Explicit type interface for Next.js 15 SearchParams Promise
interface PageProps {
  searchParams: Promise<{
    session_id?: string;
    productId?: string;
    sellerEmail?: string;
    sellerName?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps): Promise<JSX.Element | null> {
  // Await search parameters safely per Next.js 15 asynchronous paradigm
  const { session_id, productId, sellerEmail, sellerName } = await searchParams;

  // Evacuate routing if no session identity exists
  if (!session_id) {
    redirect("/");
  }

  // Retrieve validated session dataset directly from Stripe Gateway Core
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  // Redirect instantly if the transaction is pending or open
  if (session.status === "open") {
    redirect("/");
  }

  // Handle successfully finalized settlements safely
  if (session.status === "complete") {
    return (
      <PaymentSuccessClient
        session={session}
        productId={productId || ""}
        sellerEmail={sellerEmail || ""}
        sellerName={sellerName || ""}
      />
    );
  }

  return null;
}