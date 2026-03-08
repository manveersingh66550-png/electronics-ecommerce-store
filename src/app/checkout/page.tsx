"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import {
    ShieldCheck, CreditCard, Truck, MapPin,
    ChevronRight, ChevronLeft, Loader2, CheckCircle2, Package
} from 'lucide-react';
import styles from './checkout.module.css';

const SHIPPING_OPTIONS = [
    { id: 'standard', label: 'Standard Shipping', price: 0, estimate: '5–7 business days' },
    { id: 'express', label: 'Express Shipping', price: 199, estimate: '2–3 business days' },
    { id: 'overnight', label: 'Express Plus (Next Day)', price: 499, estimate: '1 business day' },
];

const INDIA_LOCATIONS: Record<string, string[]> = {
    "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Mayabunder"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
    "Chandigarh": ["Chandigarh"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Kerala": ["Trivandrum", "Kochi", "Kozhikode", "Thrissur", "Malappuram"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur"],
    "Puducherry": ["Puducherry", "Karaikal"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer"],
    "Sikkim": ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    "Tripura": ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"]
};

const STEPS = [
    { id: 1, label: 'Shipping', icon: MapPin },
    { id: 2, label: 'Delivery', icon: Truck },
    { id: 3, label: 'Payment', icon: CreditCard },
];

export default function CheckoutPage() {
    const router = useRouter();
    const supabase = createClient();
    const { items, getSubtotal, clearCart, discount, couponCode } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dynamic Store settings
    const [storeSettings, setStoreSettings] = useState<{ tax_rate: number, free_shipping_threshold: number } | null>(null);

    // Address state
    const [address, setAddress] = useState({
        firstName: '', lastName: '', street: '', city: '', state: '', zip: '', country: 'India',
    });

    // Shipping state
    const [selectedShipping, setSelectedShipping] = useState('standard');

    // Payment state
    const [payment, setPayment] = useState({
        method: 'cod', // Default to Cash on Delivery
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').eq('id', 'global').single();
            if (data) {
                setStoreSettings({
                    tax_rate: Number(data.tax_rate),
                    free_shipping_threshold: Number(data.free_shipping_threshold)
                });
            } else {
                setStoreSettings({ tax_rate: 8, free_shipping_threshold: 150 });
            }
            setMounted(true);
        };
        fetchSettings();
    }, [supabase]);

    if (!mounted || !storeSettings) {
        return <div className={styles.container}><div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div></div>;
    }

    if (items.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <Package size={56} />
                    <h2>Nothing to checkout</h2>
                    <p>Your cart is empty. Add some items first.</p>
                    <Button variant="primary" onClick={() => router.push('/shop')}>Browse Products</Button>
                </div>
            </div>
        );
    }

    const subtotal = getSubtotal();

    // Check if standard shipping is selected but order doesn't meet free threshold
    let shippingCost = SHIPPING_OPTIONS.find(s => s.id === selectedShipping)?.price || 0;
    if (selectedShipping === 'standard' && subtotal < storeSettings.free_shipping_threshold) {
        shippingCost = 499; // Standard rate if under threshold
    } else if (selectedShipping === 'standard') {
        shippingCost = 0;
    }

    const taxRate = storeSettings.tax_rate / 100;
    const tax = subtotal * taxRate;
    const total = subtotal - (discount || 0) + shippingCost + tax;

    const isStep1Valid = address.firstName && address.lastName && address.street && address.city && address.state && address.zip;
    const isStep3Valid = payment.method === 'cod'; // Only COD is currently valid

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('You must be logged in to place an order.');
                setIsSubmitting(false);
                return;
            }

            // 1. Create Address
            const { data: addressData, error: addrErr } = await supabase
                .from('addresses')
                .insert({
                    user_id: user.id,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zip: address.zip,
                    country: address.country,
                })
                .select()
                .single();

            if (addrErr) throw new Error('Failed to save address: ' + addrErr.message);

            // 2. Create Order
            const { data: orderData, error: orderErr } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    address_id: addressData.id,
                    status: 'pending',
                    payment_status: 'unpaid',
                    total_price: total,
                    tax_amount: tax,
                    shipping_amount: shippingCost,
                })
                .select()
                .single();

            if (orderErr) throw new Error('Failed to create order: ' + orderErr.message);

            // 3. Create Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.product_id,
                variant_id: item.variant_id || null,
                quantity: item.quantity,
                price: item.price,
            }));

            const { error: itemsErr } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsErr) throw new Error('Failed to save order items: ' + itemsErr.message);

            // 4. Create Payment record (placeholder for COD)
            const { error: payErr } = await supabase
                .from('payments')
                .insert({
                    order_id: orderData.id,
                    user_id: user.id,
                    amount: total,
                    currency: 'INR',
                    provider: 'cash_on_delivery',
                    status: 'pending',
                });

            if (payErr) throw new Error('Failed to record payment: ' + payErr.message);

            // 5. Update order status (COD orders stay 'unpaid' until delivery)
            await supabase
                .from('orders')
                .update({ status: 'pending', payment_status: 'unpaid' })
                .eq('id', orderData.id);

            // 6. Clear cart
            clearCart();

            // 7. Redirect to confirmation
            router.push(`/checkout/confirmation?order_id=${orderData.id}`);

        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Checkout</h1>

            {/* Stepper */}
            <div className={styles.stepper}>
                {STEPS.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div
                            className={`${styles.step} ${currentStep >= step.id ? styles.stepActive : ''} ${currentStep === step.id ? styles.stepCurrent : ''}`}
                            onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                        >
                            <div className={styles.stepIcon}>
                                {currentStep > step.id ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                            </div>
                            <span className={styles.stepLabel}>{step.label}</span>
                        </div>
                        {idx < STEPS.length - 1 && <div className={`${styles.stepLine} ${currentStep > step.id ? styles.stepLineActive : ''}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className={styles.grid}>
                <div className={styles.formSection}>
                    {/* Step 1: Shipping Address */}
                    {currentStep === 1 && (
                        <GlassPanel className={styles.panel}>
                            <h2 className={styles.sectionTitle}>
                                <MapPin size={20} /> Shipping Address
                            </h2>
                            <div className={styles.formGrid}>
                                <Input placeholder="First Name" value={address.firstName} onChange={(e) => setAddress(a => ({ ...a, firstName: e.target.value }))} required />
                                <Input placeholder="Last Name" value={address.lastName} onChange={(e) => setAddress(a => ({ ...a, lastName: e.target.value }))} required />
                                <div className={styles.fullWidth}>
                                    <Input placeholder="Street Address" value={address.street} onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))} required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>State</label>
                                    <select
                                        className={styles.select}
                                        value={address.state}
                                        onChange={(e) => setAddress(a => ({ ...a, state: e.target.value, city: '' }))}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {Object.keys(INDIA_LOCATIONS).sort().map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>City</label>
                                    <select
                                        className={styles.select}
                                        value={address.city}
                                        onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))}
                                        disabled={!address.state}
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {address.state && INDIA_LOCATIONS[address.state].sort().map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <Input placeholder="ZIP Code" value={address.zip} onChange={(e) => setAddress(a => ({ ...a, zip: e.target.value }))} required />
                                <div className={styles.fullWidth}>
                                    <Input placeholder="Country" value={address.country} readOnly disabled />
                                </div>
                            </div>
                            <div className={styles.stepActions}>
                                <div />
                                <Button variant="primary" onClick={() => setCurrentStep(2)} disabled={!isStep1Valid}>
                                    Continue to Delivery <ChevronRight size={18} />
                                </Button>
                            </div>
                        </GlassPanel>
                    )}

                    {/* Step 2: Shipping Method */}
                    {currentStep === 2 && (
                        <GlassPanel className={styles.panel}>
                            <h2 className={styles.sectionTitle}>
                                <Truck size={20} /> Delivery Method
                            </h2>
                            <div className={styles.shippingOptions}>
                                {SHIPPING_OPTIONS.map(opt => (
                                    <label
                                        key={opt.id}
                                        className={`${styles.shippingOption} ${selectedShipping === opt.id ? styles.shippingActive : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value={opt.id}
                                            checked={selectedShipping === opt.id}
                                            onChange={() => setSelectedShipping(opt.id)}
                                        />
                                        <div className={styles.shippingInfo}>
                                            <span className={styles.shippingLabel}>{opt.label}</span>
                                            <span className={styles.shippingEstimate}>{opt.estimate}</span>
                                        </div>
                                        <span className={styles.shippingPrice}>
                                            {(opt.id === 'standard' && subtotal >= storeSettings.free_shipping_threshold)
                                                ? 'Free'
                                                : `₹${(opt.id === 'standard' ? 499 : opt.price).toFixed(2)}`}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <div className={styles.stepActions}>
                                <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                                    <ChevronLeft size={18} /> Back
                                </Button>
                                <Button variant="primary" onClick={() => setCurrentStep(3)}>
                                    Continue to Payment <ChevronRight size={18} />
                                </Button>
                            </div>
                        </GlassPanel>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 3 && (
                        <GlassPanel className={styles.panel}>
                            <h2 className={styles.sectionTitle}>
                                <CreditCard size={20} /> Payment
                            </h2>
                            <div className={styles.paymentMethods}>
                                <label className={`${styles.paymentOption} ${payment.method === 'cod' ? styles.paymentActive : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={payment.method === 'cod'}
                                        onChange={() => setPayment({ method: 'cod' })}
                                    />
                                    <div className={styles.paymentInfo}>
                                        <span className={styles.paymentLabel}>Cash on Delivery (COD)</span>
                                        <span className={styles.paymentSub}>Pay with cash when your order is delivered.</span>
                                    </div>
                                </label>

                                <div className={styles.paymentDisabled}>
                                    <div className={styles.paymentInfo}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className={styles.paymentLabel}>UPI (PhonePe, GPay, Paytm)</span>
                                            <span className={styles.comingSoon}>Coming Soon</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.paymentDisabled}>
                                    <div className={styles.paymentInfo}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className={styles.paymentLabel}>Credit / Debit Card</span>
                                            <span className={styles.comingSoon}>Coming Soon</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.paymentDisabled}>
                                    <div className={styles.paymentInfo}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className={styles.paymentLabel}>Other Online Options</span>
                                            <span className={styles.comingSoon}>Coming Soon</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && <div className={styles.errorBanner}>{error}</div>}

                            <div className={styles.stepActions}>
                                <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                                    <ChevronLeft size={18} /> Back
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handlePlaceOrder}
                                    disabled={!isStep3Valid || isSubmitting}
                                    className={styles.placeOrderBtn}
                                >
                                    {isSubmitting ? <><Loader2 size={18} className={styles.spinnerAnim} /> Processing...</> : `Place Order — ₹${total.toFixed(2)}`}
                                </Button>
                            </div>

                            <div className={styles.secureBadge}>
                                <ShieldCheck size={16} />
                                <span>Secure Encrypted Checkout</span>
                            </div>
                        </GlassPanel>
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <div className={styles.summarySection}>
                    <GlassPanel className={styles.panel}>
                        <h2 className={styles.sectionTitle}>Order Summary</h2>

                        <div className={styles.orderItems}>
                            {items.map(item => (
                                <div key={item.id} className={styles.itemRow}>
                                    <div className={styles.itemThumb}>
                                        <Image src={item.image_url || '/hero-headphone.png'} alt={item.name} fill style={{ objectFit: 'contain' }} />
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.quantity}× {item.name}</span>
                                    </div>
                                    <span className={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className={`${styles.summaryRow} ${styles.discountRow}`} style={{ color: 'var(--success)', fontWeight: 500 }}>
                                <span>Discount ({couponCode})</span>
                                <span>-₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax ({storeSettings.tax_rate}%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
}
