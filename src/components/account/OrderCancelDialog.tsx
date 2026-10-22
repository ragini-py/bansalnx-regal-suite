import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  HelpCircle,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { Order } from "@/data/types";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface OrderCancelDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: (orderId: string) => void;
}

export type CancelStep = "reason" | "refund" | "receipt";
export type RefundMethod = "original_source" | "store_credit";

const CANCELLATION_REASONS = [
  {
    id: "wrong_variant",
    label: "Incorrect size, colour, or style selected",
    subtitle: "Need a different fitting or hue for my ensemble",
  },
  {
    id: "accidental_order",
    label: "Ordered by mistake or duplicate order placed",
    subtitle: "Accidentally placed more than once or clicked in error",
  },
  {
    id: "address_change",
    label: "Need to change delivery address or phone number",
    subtitle: "Entered shipping details need updating",
  },
  {
    id: "delivery_time",
    label: "Expected delivery date is too late",
    subtitle: "Needed earlier for an upcoming wedding or festivity",
  },
  {
    id: "price_discount",
    label: "Forgot to apply discount or coupon code",
    subtitle: "Wish to re-order with a promotional savings code",
  },
  {
    id: "found_alternative",
    label: "Decided on a different outfit or changed preference",
    subtitle: "Browsing another Jaipur heritage style",
  },
  {
    id: "other",
    label: "Other reason",
    subtitle: "Provide details below",
  },
];

export function OrderCancelDialog({
  order,
  open,
  onOpenChange,
  onCancelled,
}: OrderCancelDialogProps) {
  const { cancelOrder } = useStore();

  const [step, setStep] = useState<CancelStep>("reason");
  const [reasonId, setReasonId] = useState<string>("wrong_variant");
  const [customNotes, setCustomNotes] = useState("");
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("original_source");
  const [cancelling, setCancelling] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    referenceId: string;
    cancelledAt: string;
    refundAmount: number;
    destinationLabel: string;
    estimatedCreditDate: string;
  } | null>(null);

  // Reset state whenever a new order is opened
  useEffect(() => {
    if (open) {
      setStep("reason");
      setReasonId("wrong_variant");
      setCustomNotes("");
      setRefundMethod("original_source");
      setCancelling(false);
      setReceiptData(null);
    }
  }, [open, order?.id]);

  if (!order) return null;

  const isPrepaid = order.payment.status === "paid" || order.payment.method !== "cod";
  const selectedReasonObj = CANCELLATION_REASONS.find((r) => r.id === reasonId);

  // Compute estimated refund credit date (5 to 7 business days)
  function getEstimatedCreditDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function handleConfirmCancel() {
    if (!order) return;
    setCancelling(true);
    try {
      const refundModeDesc = !isPrepaid
        ? "COD (No Payment Deducted)"
        : refundMethod === "original_source"
          ? "Refund to Original Source (Razorpay/Bank)"
          : "Instant Bansal NX Store Credit Voucher";

      const fullReason =
        `[${refundModeDesc}] ` +
        (reasonId === "other" && customNotes.trim()
          ? customNotes.trim()
          : (selectedReasonObj?.label ?? "Cancelled by customer") +
            (customNotes.trim() ? ` — Notes: ${customNotes.trim()}` : ""));

      await cancelOrder(order.id, fullReason);

      // Generate verifiable receipt details
      const refId = `REF-${order.id.replace(/[^a-zA-Z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
      setReceiptData({
        referenceId: refId,
        cancelledAt: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        refundAmount: order.total,
        destinationLabel: !isPrepaid
          ? "Cash on Delivery (₹0 Deducted)"
          : refundMethod === "original_source"
            ? "Original Payment Source (Bank / Card / UPI)"
            : "Instant Bansal NX Store Credit Voucher",
        estimatedCreditDate: getEstimatedCreditDate(),
      });

      // Advance to in-modal receipt
      setStep("receipt");

      toast.success(`Order ${order.id} cancelled successfully`, {
        description: isPrepaid
          ? `Refund of ${formatINR(order.total)} initiated.`
          : "Zero cancellation fees charged.",
      });

      // Notify parent hook
      onCancelled?.(order.id);
    } catch {
      toast.error("Couldn't cancel this order. Please try again or reach out to concierge support.");
    } finally {
      setCancelling(false);
    }
  }

  function handleCloseReceipt() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl luxury-scrollbar">
        {/* Step Progress Tracker */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span className={cn(step === "reason" ? "text-amber-800 font-bold" : "text-slate-600")}>
              1. Cancellation Reason
            </span>
            <span className="text-slate-300">───</span>
            <span className={cn(step === "refund" ? "text-amber-800 font-bold" : "text-slate-600")}>
              2. Refund Mode
            </span>
            <span className="text-slate-300">───</span>
            <span className={cn(step === "receipt" ? "text-emerald-700 font-bold" : "text-slate-400")}>
              3. Confirmation Receipt
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                step === "reason" && "w-1/3 bg-amber-600",
                step === "refund" && "w-2/3 bg-amber-600",
                step === "receipt" && "w-full bg-emerald-600",
              )}
            />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* STEP 1: REASON SELECTION                             */}
        {/* ---------------------------------------------------- */}
        {step === "reason" && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    Cancel Order {order.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Select why you want to cancel. Your feedback helps us improve our handcrafted collections.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Order Items Preview */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Items in this order ({order.lines.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-1 luxury-scrollbar">
                {order.lines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs bg-white p-2 rounded-lg border border-slate-100">
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-10 w-8 shrink-0 rounded object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{line.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {line.size} · {line.colour} · Qty {line.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900 shrink-0">
                      {formatINR(line.price * line.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason Selection Radio Group */}
            <div className="mt-4 space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Reason for Cancellation <span className="text-rose-500">*</span>
              </Label>
              <RadioGroup
                value={reasonId}
                onValueChange={setReasonId}
                className="space-y-2 mt-1"
              >
                {CANCELLATION_REASONS.map((r) => {
                  const isChecked = reasonId === r.id;
                  return (
                    <label
                      key={r.id}
                      htmlFor={`cancel-reason-${r.id}`}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-xs transition-all cursor-pointer",
                        isChecked
                          ? "border-amber-600/90 bg-amber-50/50 shadow-2xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700",
                      )}
                    >
                      <RadioGroupItem
                        value={r.id}
                        id={`cancel-reason-${r.id}`}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className={cn("font-semibold block", isChecked ? "text-amber-950" : "text-slate-900")}>
                          {r.label}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          {r.subtitle}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Optional comments */}
            <div className="mt-3">
              <Label htmlFor="cancel-notes" className="text-xs font-semibold text-slate-700">
                Additional Comments <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="cancel-notes"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Share any other thoughts so we can serve you better next time..."
                className="mt-1.5 min-h-[60px] text-xs rounded-xl border-slate-200 resize-none focus-visible:ring-amber-700/30"
                maxLength={300}
              />
            </div>

            <DialogFooter className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto text-xs"
              >
                Keep Order
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setStep("refund")}
                className="w-full sm:w-auto text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
              >
                Continue to Refund Mode →
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: REFUND DESTINATION & TERMS                   */}
        {/* ---------------------------------------------------- */}
        {step === "refund" && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    Refund &amp; Settlement Details
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Review your refund payout destination before confirming cancellation.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Refund Financial Summary Box */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                <span>Order Total Paid</span>
                <span className="font-semibold text-slate-900">{formatINR(order.total)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-700 py-2 border-b border-slate-200">
                <span>Cancellation Charges</span>
                <span className="font-semibold">₹0 (Free / No Deduction)</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-2">
                <span>Total Refund Payable</span>
                <span className="text-base text-amber-700">{formatINR(order.total)}</span>
              </div>
            </div>

            {/* PREPAID ORDERS: Choose Destination */}
            {isPrepaid ? (
              <div className="mt-4 space-y-3">
                <Label className="text-xs font-semibold text-slate-800">
                  Choose Where You Want Your Refund Credited:
                </Label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: Original Source */}
                  <label
                    htmlFor="refund-original"
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-xs transition-all cursor-pointer",
                      refundMethod === "original_source"
                        ? "border-amber-600/90 bg-amber-50/40 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60",
                    )}
                  >
                    <input
                      type="radio"
                      id="refund-original"
                      name="refundMethod"
                      value="original_source"
                      checked={refundMethod === "original_source"}
                      onChange={() => setRefundMethod("original_source")}
                      className="mt-1 h-4 w-4 text-amber-700 focus:ring-amber-500 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          Original Payment Source (Bank / Card / UPI)
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Credited back to the original bank account, debit/credit card, or UPI ID used via Razorpay.
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Timeline: 5–7 banking days (Expected by {getEstimatedCreditDate()})</span>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Instant Store Credit Voucher */}
                  <label
                    htmlFor="refund-credit"
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-xs transition-all cursor-pointer",
                      refundMethod === "store_credit"
                        ? "border-amber-600/90 bg-amber-50/40 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60",
                    )}
                  >
                    <input
                      type="radio"
                      id="refund-credit"
                      name="refundMethod"
                      value="store_credit"
                      checked={refundMethod === "store_credit"}
                      onChange={() => setRefundMethod("store_credit")}
                      className="mt-1 h-4 w-4 text-amber-700 focus:ring-amber-500 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          Instant Bansal NX Store Credit Voucher
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Instant (0 Mins)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Issued instantly as a digital luxury gift voucher to your registered email. Can be applied on any future purchase with 1-year validity.
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Available immediately upon cancellation confirmation</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              /* COD ORDERS NOTICE */
              <div className="mt-4 rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1.5">
                <p className="font-semibold flex items-center gap-2 text-blue-900">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Cash on Delivery Notice
                </p>
                <p className="text-[11px] text-blue-950/80 leading-relaxed">
                  Since this order was placed with Cash on Delivery, zero payment was collected from you. The order shipment will be stopped immediately and no cancellation fee will be charged.
                </p>
              </div>
            )}

            {/* Selected Reason Recap */}
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
              <span className="font-semibold text-slate-800 shrink-0">Selected Reason:</span>
              <span className="truncate">
                {selectedReasonObj?.label}
                {customNotes.trim() ? ` (${customNotes.trim()})` : ""}
              </span>
            </div>

            {/* Warning Reassurance */}
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              Once cancelled, this order cannot be reopened. The items will be returned to stock.
            </p>

            <DialogFooter className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("reason")}
                disabled={cancelling}
                className="text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Reason
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={cancelling}
                  className="w-1/2 sm:w-auto text-xs"
                >
                  Keep Order
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleConfirmCancel()}
                  disabled={cancelling}
                  className="w-1/2 sm:w-auto text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Cancelling…
                    </>
                  ) : (
                    "Confirm & Cancel Order"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: CANCELLATION SUCCESS RECEIPT                 */}
        {/* ---------------------------------------------------- */}
        {step === "receipt" && receiptData && (
          <div className="py-2 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-inner">
              <CheckCircle2 className="h-9 w-9 stroke-[1.75]" />
            </div>

            <div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-rose-800">
                Order Cancelled
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                Cancellation Confirmed
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Order <span className="font-mono font-semibold text-slate-800">{order.id}</span> has been successfully cancelled.
              </p>
            </div>

            {/* Official Cancellation Receipt Card */}
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-left space-y-2.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Refund Reference ID</span>
                <span className="font-mono font-bold text-slate-900">{receiptData.referenceId}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Cancellation Time</span>
                <span className="text-slate-800">{receiptData.cancelledAt}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Settlement Mode</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                  {receiptData.destinationLabel}
                </span>
              </div>
              {isPrepaid && (
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Expected Settlement Date</span>
                  <span className="font-bold text-emerald-700">{receiptData.estimatedCreditDate}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold pt-1">
                <span className="text-slate-900">Total Refund Value</span>
                <span className="text-base text-amber-700">{formatINR(receiptData.refundAmount)}</span>
              </div>
            </div>

            {/* Reassurance Info Banner */}
            <div className="mx-auto max-w-md rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-left flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                A formal cancellation confirmation and refund advice document have been sent to{" "}
                <span className="font-semibold text-slate-900">{order.email}</span>. You can track this refund status anytime under your Account Orders.
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                type="button"
                size="sm"
                onClick={handleCloseReceipt}
                className="w-full sm:w-auto text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
              >
                Close &amp; View Orders
              </Button>
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs font-semibold border-amber-600/40 text-amber-900 hover:bg-amber-50"
              >
                <Link to="/products" onClick={handleCloseReceipt}>
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
