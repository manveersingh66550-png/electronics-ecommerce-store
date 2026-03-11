"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, Laptop, HeadphonesIcon, Gamepad2, Watch, Plus, ArrowRight, Zap, ShieldCheck, BatteryCharging, Tablet, Camera, LayoutGrid, Camera as CameraIcon, Cpu, PenLine, TicketPercent, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import { BestSellers } from '@/components/home/BestSellers/BestSellers';
import { BrandStrip } from '@/components/home/BrandStrip/BrandStrip';
import { WhyChooseUs } from '@/components/home/WhyChooseUs/WhyChooseUs';
import styles from './page.module.css';


export default function Home() {
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discount_type: string; value: number; expiry_date: string | null; min_cart_value: number } | null>(null);
  const [spotlightProduct, setSpotlightProduct] = useState<any>(null);
  const addItem = useCartStore((state) => state.addItem);
  const [spotlightAdded, setSpotlightAdded] = useState(false);

  useEffect(() => {
    async function fetchCoupon() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('coupons')
        .select('code, discount_type, value, expiry_date, min_cart_value')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        // Simple check if it's expired
        if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
          return;
        }
        setActiveCoupon(data);
      }
    }
    fetchCoupon();
  }, []);

  // Fetch spotlight product (Samsung Galaxy)
  useEffect(() => {
    async function fetchSpotlight() {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('id, name, price, images, stock')
        .ilike('name', '%samsung%galaxy%')
        .limit(1)
        .single();
      if (data) setSpotlightProduct(data);
    }
    fetchSpotlight();
  }, []);

  return (
    <div className={styles.homeContainer}>
      {/* 1. MASTERPIECE HERO SECTION */}
      <section className={`${styles.section} ${styles.heroSection}`}>
        <div className={styles.heroContent}>
          <AnimatedSection direction="down" delay={0.1}>
            <span className={styles.heroBadge}>The Future of Tech</span>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <h1 className={styles.heroTitle}>Elegance in Innovation</h1>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.3}>
            <p className={styles.heroDesc}>
              Discover a curated collection of premium electronics where cutting-edge performance meets uncompromising design.
            </p>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.4} className={styles.heroActions}>
            <Link href="/shop">
              <button className={styles.heroBtnPrimary}>Shop Collection</button>
            </Link>
            <Link href="/shop/categories">
              <button className={styles.heroBtnSecondary}>View Categories</button>
            </Link>
          </AnimatedSection>
        </div>

        {/* User's Edge-to-Edge Transparent iPhone Image */}
        <AnimatedSection direction="up" delay={0.6} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className={styles.heroImageContainer}>
            <Image
              src="/hero-phones.png"
              alt="Titanium Flagship Smartphone Lineup"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 80vw"
              className={styles.mainHeroImage}
              priority
            />
          </div>
        </AnimatedSection>
      </section>



      {/* 3. HORIZONTAL CATEGORIES */}
      <section className={`${styles.section} ${styles.categoriesSection}`}>
        <AnimatedSection delay={0.1}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Explore by Category</h2>
            <p className={styles.heroDesc} style={{ fontSize: '1.25rem' }}>Find the perfect tech gear tailored to your lifestyle and needs.</p>
          </div>
          <div className={styles.categoriesWrapper}>
            {[
              { name: 'Smartphones', icon: Smartphone, link: '/shop/category/smartphones' },
              { name: 'Laptops', icon: Laptop, link: '/shop/category/laptops' },
              { name: 'Audio', icon: HeadphonesIcon, link: '/shop/category/audio' },
              { name: 'Watch', icon: Watch, link: '/shop/category/wearables' },
              { name: 'Explore More', icon: LayoutGrid, link: '/shop/categories' },
            ].map((cat, idx) => (
              <Link key={idx} href={cat.link} style={{ textDecoration: 'none' }} className={styles.categoryCardWrapper}>
                <div className={styles.categoryCard}>
                  <div className={styles.categoryCardContent}>
                    <div className={styles.categoryIconDark}>
                      <cat.icon size={28} color="white" strokeWidth={1.5} />
                    </div>
                    <span className={styles.categoryName}>{cat.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* 3.5 DEALS / VOUCHER SECTION (New) */}
      {activeCoupon && (
        <section className={`${styles.section} ${styles.dealsSection}`}>
          <AnimatedSection delay={0.1}>
            <div className={styles.dealsCard}>

              {/* Abstract decorative backgrounds inside the glass */}
              <div className={styles.dealsBlobTop}></div>
              <div className={styles.dealsBlobBottom}></div>

              <div className={styles.dealsContentWrap}>
                <div className={styles.dealsText}>
                  <span className={styles.dealsBadge}>Limited Time Offer</span>
                  <h2 className={styles.dealsTitle}>
                    Get <span className={styles.dealsHighlight}>
                      {activeCoupon.discount_type === 'percentage' ? `${activeCoupon.value}% OFF` : `₹${activeCoupon.value} OFF`}
                    </span><br />
                    Premium Tech
                  </h2>
                  <p className={styles.dealsDesc}>
                    Upgrade your setup today. Apply this exclusive voucher at checkout or grab the deal now to auto-sync it to your cart.
                  </p>
                  {activeCoupon.min_cart_value > 0 ? (
                    <p className={styles.dealsMinOrder}>*Applicable on orders above ₹{activeCoupon.min_cart_value.toLocaleString()}</p>
                  ) : null}

                  <div className={styles.dealsCodeBox}>
                    <TicketPercent size={24} className={styles.dealsIcon} />
                    <span className={styles.dealsCodeLabel}>Use Code:</span>
                    <span className={styles.dealsCodeValue}>{activeCoupon.code}</span>
                  </div>

                  <Link href={`/cart?coupon=${activeCoupon.code}`} style={{ textDecoration: 'none' }}>
                    <button className={styles.dealsBtn}>
                      Shop Deals Now <ArrowRight size={18} />
                    </button>
                  </Link>
                </div>

                <div className={styles.dealsGraphic}>
                  <div className={styles.dealsGraphicInner}>
                    <div className={styles.dealsGraphicContent}>
                      <Zap size={64} className={styles.dealsZapIcon} strokeWidth={1} />
                      <h3 className={styles.dealsGraphicTitle}>Flash Sale</h3>
                      <p className={styles.dealsGraphicSub}>Don't miss out on these exclusive savings.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </AnimatedSection>
        </section>
      )}

      {/* 3.8 BEST SELLERS */}
      <BestSellers />

      {/* 4. PRODUCT SPOTLIGHT (Samsung S26 Ultra) */}
      <section className={`${styles.section} ${styles.spotlightSection}`}>
        <div className={styles.spotlightContainer}>
          <AnimatedSection direction="left" delay={0.2} style={{ flex: 1 }}>
            <div className={styles.spotlightText}>
              <span className={styles.spotlightBadge}>FLAGSHIP MOBILE</span>
              <h2 className={styles.spotlightTitle}>Samsung Galaxy S26 Ultra.</h2>
              <p className={styles.spotlightDesc}>
                Redefine mobile communication, photography, and performance. The Samsung Galaxy S26 Ultra is the ultimate power tool for a connected world.
              </p>

              <div className={styles.spotlightFeatures}>
                <div className={styles.featureCard}>
                  <CameraIcon size={28} strokeWidth={1.5} className={styles.featureIcon} />
                  <span className={styles.featureText}>ULTRA<br />CAMERA</span>
                </div>
                <div className={styles.featureCard}>
                  <Cpu size={28} strokeWidth={1.5} className={styles.featureIcon} />
                  <span className={styles.featureText}>POWERFUL<br />CHIP</span>
                </div>
                <div className={styles.featureCard}>
                  <PenLine size={28} strokeWidth={1.5} className={styles.featureIcon} />
                  <span className={styles.featureText}>S PEN<br />SUPPORT</span>
                </div>
              </div>

              <div className={styles.spotlightActionButtons}>
                <button
                  className={styles.premiumBtnBlack}
                  onClick={() => {
                    if (spotlightProduct) {
                      addItem({
                        product_id: spotlightProduct.id,
                        name: spotlightProduct.name || 'Samsung Galaxy S26 Ultra',
                        price: spotlightProduct.price,
                        quantity: 1,
                        image_url: spotlightProduct.images?.[0] || '/Samsung-S26ultra-nobg.png',
                        stock: spotlightProduct.stock || 10,
                      });
                      setSpotlightAdded(true);
                      setTimeout(() => setSpotlightAdded(false), 1500);
                    }
                  }}
                >
                  {spotlightAdded ? '✓ Added!' : 'Add to Cart'}
                </button>
                <Link href={spotlightProduct ? `/product/${spotlightProduct.id}` : '/shop'} style={{ textDecoration: 'none' }}>
                  <button className={styles.premiumBtnBlack}>View Product</button>
                </Link>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.4} className={styles.spotlightImageWrap}>
            <Image
              src="/Samsung-S26ultra-nobg.png"
              alt="Samsung Galaxy S26 Ultra"
              width={800}
              height={1000}
              className={styles.spotlightImage}
              quality={85}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </AnimatedSection>
        </div>
      </section>

      {/* 5. BRAND STRIP */}
      <BrandStrip />

      {/* 6. WHY CHOOSE US */}
      <WhyChooseUs />

    </div>
  );
}
