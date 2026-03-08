"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './SearchSuggestionBar.module.css';

interface SearchResult {
    id: string;
    name: string;
    price: number;
    category_id: string;
    image_url: string | null;
}

export const SearchSuggestionBar = () => {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Click outside to close map
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const supabase = createClient();

        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            setIsOpen(true);

            // Doing an ilike match for simple search suggestions
            const { data, error } = await supabase
                .from('Products')
                .select('id, name, price, category_id, Product_Media(url)')
                .ilike('name', `%${query}%`)
                .limit(5);

            if (!error && data) {
                const formatted = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category_id: p.category_id,
                    // Get first image if exists
                    image_url: p.Product_Media?.[0]?.url || null
                }));
                setResults(formatted);
            }
            setIsLoading(false);
        };

        const debounceId = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounceId);
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <form className={styles.searchForm} onSubmit={handleSubmit}>
                <Search size={20} className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Search premium tech..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
                />
                {query && (
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                        }}
                    >
                        <X size={14} />
                    </button>
                )}
            </form>

            {isOpen && (
                <div className={styles.suggestionsContainer}>
                    {isLoading ? (
                        <div className={styles.loadingState}>Loading suggestions...</div>
                    ) : results.length > 0 ? (
                        <>
                            <ul className={styles.suggestionList}>
                                {results.map((product) => (
                                    <li key={product.id}>
                                        <Link
                                            href={`/product/${product.id}`}
                                            className={styles.suggestionItem}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className={styles.itemImage}>
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        style={{ objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    <div className={styles.placeholderImg} />
                                                )}
                                            </div>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemName}>{product.name}</span>
                                            </div>
                                            <span className={styles.itemPrice}>₹{product.price.toFixed(2)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={styles.viewAllBtn}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsOpen(false);
                                    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
                                }}
                            >
                                View all results for "{query}"
                            </button>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            No products found matching "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
