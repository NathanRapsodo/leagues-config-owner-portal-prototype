"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Season, Payment } from "@/lib/leagues/types";
import { DollarSign, Gift } from "lucide-react";

interface Props {
  data: Partial<Season>;
  onChange: (patch: Partial<Season>) => void;
  errors: Record<string, string>;
}

// Store datetime-local values as-is — no UTC conversion (fixes timezone offset bug)
function toDatetimeLocal(val?: string): string {
  return val ? val.slice(0, 16) : "";
}

function fromDatetimeLocal(val: string): string {
  return val; // raw local datetime string, no UTC conversion
}

export function Step4Payment({ data, onChange, errors }: Props) {
  const payment: Payment = data.payment ?? { mode: "free" };
  const patch = (p: Partial<Payment>) => onChange({ payment: { ...payment, ...p } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Payment</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose whether this season requires an entry fee.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => patch({ mode: "free" })}
          className={`relative flex flex-col gap-2 rounded-lg border-2 p-5 text-left transition-colors ${
            payment.mode === "free"
              ? "border-primary bg-primary/5"
              : "border-muted hover:border-muted-foreground/40"
          }`}
        >
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-semibold">Free</span>
          <span className="text-xs text-muted-foreground">No entry fee. Anyone can join.</span>
          {payment.mode === "free" && (
            <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>

        <button
          type="button"
          onClick={() => patch({ mode: "paid" })}
          className={`relative flex flex-col gap-2 rounded-lg border-2 p-5 text-left transition-colors ${
            payment.mode === "paid"
              ? "border-primary bg-primary/5"
              : "border-muted hover:border-muted-foreground/40"
          }`}
        >
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="font-semibold">Paid</span>
          <span className="text-xs text-muted-foreground">Charge an entry fee to join.</span>
          {payment.mode === "paid" && (
            <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {payment.mode === "paid" && (
        <>
          <Separator />
          <div className="space-y-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Entry Fee (USD) <span className="text-destructive">*</span>
              </Label>
              <div className="relative w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="pl-7"
                  value={payment.price ?? ""}
                  onChange={(e) =>
                    patch({ price: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
            </div>

            {/* Tax */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Enable Tax</p>
                <p className="text-xs text-muted-foreground">
                  Add a tax rate on top of the entry fee.
                </p>
              </div>
              <Switch
                checked={payment.taxEnabled ?? false}
                onCheckedChange={(v) => patch({ taxEnabled: v })}
              />
            </div>

            {payment.taxEnabled && (
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <div className="relative w-40">
                  <Input
                    id="tax-rate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="e.g. 8.5"
                    value={payment.taxRate ?? ""}
                    onChange={(e) =>
                      patch({ taxRate: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </div>
            )}

            <Separator />

            {/* Signup window */}
            <div>
              <p className="text-sm font-medium mb-3">Signup Window</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-start">Signup Opens</Label>
                  <Input
                    id="signup-start"
                    type="datetime-local"
                    value={toDatetimeLocal(payment.signupStart)}
                    onChange={(e) => patch({ signupStart: fromDatetimeLocal(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-end">Signup Closes</Label>
                  <Input
                    id="signup-end"
                    type="datetime-local"
                    value={toDatetimeLocal(payment.signupEnd)}
                    onChange={(e) => patch({ signupEnd: fromDatetimeLocal(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {errors.payment && (
        <p className="text-xs text-destructive">{errors.payment}</p>
      )}
    </div>
  );
}
