"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  tier: string;
  variant_id?: number;
}

export default function BillingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/billing/plans");
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch("/billing/subscription", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      
      const data = await response.json();
      setCurrentTier(data.tier || "free");
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: Plan) => {
    if (!plan.variant_id) {
      alert("This plan is not available for purchase.");
      return;
    }

    setCheckoutLoading(plan.id);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch("/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          product_variant_id: plan.variant_id,
          customer_email: session.user.email,
          custom_data: {
            user_id: session.user.id,
            tier: plan.tier
          }
        })
      });

      const data = await response.json();
      
      if (data.checkout_url) {
        // Redirect to Lemon Squeezy checkout
        window.location.href = data.checkout_url;
      } else {
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-v-muted">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-v-muted2">
            Upgrade to unlock more scans and advanced features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-lg border ${
                currentTier === plan.tier
                  ? "border-acid bg-acid/5"
                  : "border-v-border2 bg-v-bg2"
              }`}
            >
              {currentTier === plan.tier && (
                <div className="text-acid text-sm font-semibold mb-2">
                  Current Plan
                </div>
              )}
              
              <h3 className="text-xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-v-muted2">/{plan.interval}</span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-v-muted">
                    <svg className="w-4 h-4 text-acid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan)}
                disabled={checkoutLoading === plan.id || currentTier === plan.tier}
                className={`w-full py-2 px-4 rounded font-semibold transition-colors ${
                  currentTier === plan.tier
                    ? "bg-v-muted text-white cursor-not-allowed"
                    : checkoutLoading === plan.id
                    ? "bg-v-muted text-white"
                    : "bg-acid text-black hover:bg-acid/90"
                }`}
              >
                {checkoutLoading === plan.id
                  ? "Processing..."
                  : currentTier === plan.tier
                  ? "Current Plan"
                  : plan.price === 0
                  ? "Get Started"
                  : "Upgrade"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-v-muted2">
          <p>Questions about billing? Contact support@vulnra.ai</p>
          <p className="mt-2">
            <a href="/pricing" className="text-acid hover:underline">
              View detailed pricing comparison
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
