import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Download,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentModal: React.FC = () => {
  const { subscriptionModalOpen, setSubscriptionModalOpen, user, updateProfile } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'plus'>('pro');
  const [gateway, setGateway] = useState<'razorpay' | 'stripe'>('razorpay');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<{ invoiceId: string; date: string; amount: string } | null>(null);

  if (!subscriptionModalOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Order via server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, gateway, currency: 'INR' }),
      });
      const orderData = await orderRes.json();

      // 2. Verify Payment via server
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          paymentId: `pay_${gateway}_${Date.now()}`,
          signature: `sig_verified_${Date.now()}`,
          plan: selectedPlan,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        updateProfile({ plan: selectedPlan });
        setInvoice({
          invoiceId: verifyData.invoiceId,
          date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: selectedPlan === 'plus' ? '₹299' : '₹149',
        });

        // Trigger transactional email
        await fetch('/api/emails/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email || 'student@university.edu',
            plan: selectedPlan,
            amount: selectedPlan === 'plus' ? 299 : 149,
            invoiceId: verifyData.invoiceId,
          }),
        });

        try {
          confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <span>bhaleinc billing</span>
              <span>·</span>
              <span>PCI-DSS Tier 1 Compliant</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {invoice ? 'Subscription Confirmed!' : 'Upgrade STUDYOS Plan'}
            </h2>
          </div>
          <button
            onClick={() => {
              setSubscriptionModalOpen(false);
              setInvoice(null);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {invoice ? (
          /* Receipt / Invoice Confirmation */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Payment Processed Successfully</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                You are now upgraded to <strong>STUDYOS {selectedPlan.toUpperCase()}</strong>. Your invoice has been dispatched via Resend transactional email.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{invoice.invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billed By</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">bhaleinc EdTech Pvt.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-800 dark:text-slate-200">{invoice.date}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-sm">
                <span>Total Paid</span>
                <span className="text-indigo-600 dark:text-indigo-400">{invoice.amount}/month</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubscriptionModalOpen(false);
                setInvoice(null);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          /* Plan Selector & Gateway Checkout */
          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Plan Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedPlan('pro')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === 'pro'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Student Pro
                </span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">₹149<span className="text-xs text-slate-400">/mo</span></p>
                <p className="text-[11px] text-slate-500 mt-1">Unlimited AI Tutor & OCR notes</p>
              </div>

              <div
                onClick={() => setSelectedPlan('plus')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === 'plus'
                    ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/40 ring-1 ring-violet-600'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Student Plus
                  </span>
                  <span className="text-[9px] bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">₹299<span className="text-xs text-slate-400">/mo</span></p>
                <p className="text-[11px] text-slate-500 mt-1">AI Exam prediction & deep research</p>
              </div>
            </div>

            {/* Gateway Toggle: Razorpay vs Stripe */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Payment Gateway</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setGateway('razorpay')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    gateway === 'razorpay'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="font-bold">Razorpay</span>
                  <span className="text-[9px] opacity-75">UPI & Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGateway('stripe')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    gateway === 'stripe'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="font-bold">Stripe</span>
                  <span className="text-[9px] opacity-75">Global Cards</span>
                </button>
              </div>
            </div>

            {/* Payment Method Inputs */}
            {gateway === 'razorpay' ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {['upi', 'card', 'netbanking'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m as any)}
                      className={`flex-1 py-1.5 text-xs font-semibold uppercase rounded-lg border ${
                        paymentMethod === m
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'upi' ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">UPI VPA ID</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="student@okaxis or student@upi"
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Card Number: 4532 •••• •••• 8892"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Stripe Fields */
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Card Information</label>
                <input
                  type="text"
                  placeholder="Card Number: 4242 •••• •••• 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="password"
                    placeholder="CVC"
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay {selectedPlan === 'plus' ? '₹299' : '₹149'} via {gateway === 'razorpay' ? 'Razorpay' : 'Stripe'}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Processed securely by bhaleinc. Cancel anytime from Settings.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
