"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Plus, Minus, BookmarkPlus } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { SaveToListModal } from "@/components/lists/SaveToListModal";
import styles from "./ProductCard.module.css";

interface ProductCardProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    unit?: string;
    discount?: number;
    rating?: number;
}

interface ProductCardProps {
    product: ProductCardProduct;
    onAdd: (product: { id: string; name: string; price: number; image: string; unit?: string }) => void;
    quantity?: number;
    onUpdateQuantity?: (quantity: number) => void;
}

export function ProductCard({ product, onAdd, quantity = 0, onUpdateQuantity }: ProductCardProps) {
    const { id, name, image, price, unit, discount = 0, rating = 5 } = product;
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
    const productUrl = `/shop/product/${id}`;

    const handleAdd = () => {
        onAdd({
            id,
            name,
            price: discountedPrice,
            image,
            unit,
        });
    };

    const handleIncrement = () => {
        if (onUpdateQuantity) {
            onUpdateQuantity(quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (onUpdateQuantity && quantity > 0) {
            onUpdateQuantity(quantity - 1);
        }
    };

    const handleAddToListClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsListModalOpen(true);
    };

    return (
        <>
            <div className={styles.card}>
                <Link href={productUrl} className={styles.imageWrapper}>
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    {discount > 0 && (
                        <div className={styles.badgeWrapper}>
                            <Badge variant="discount">{discount}% OFF</Badge>
                        </div>
                    )}

                    {/* Add to List Bookmark Icon - Top Right */}
                    <button
                        onClick={handleAddToListClick}
                        className={styles.bookmarkButton}
                        title="Add to Shopping List"
                        aria-label="Add to Shopping List"
                    >
                        <BookmarkPlus size={20} />
                    </button>
                </Link>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <Link href={productUrl} className={styles.nameLink}>
                            <h3 className={styles.name}>{name}</h3>
                        </Link>
                        {unit && <span className={styles.weight}>{unit}</span>}
                    </div>

                    {rating > 0 && (
                        <div className={styles.rating}>
                            <Star size={14} fill="#FFB800" color="#FFB800" />
                            <span>{rating.toFixed(1)}</span>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>৳{discountedPrice.toFixed(0)}</span>
                            {discount > 0 && (
                                <span className={styles.originalPrice}>৳{price.toFixed(0)}</span>
                            )}
                        </div>

                        <div className={styles.action}>
                            {quantity > 0 ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={handleDecrement}
                                        style={{ padding: "0.25rem", minWidth: "auto" }}
                                    >
                                        <Minus size={16} />
                                    </Button>
                                    <span style={{ fontWeight: 600, minWidth: "1.5rem", textAlign: "center" }}>
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={handleIncrement}
                                        style={{ padding: "0.25rem", minWidth: "auto" }}
                                    >
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="small"
                                    onClick={handleAdd}
                                    className={styles.addButton}
                                >
                                    Add
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add to List Modal */}
            <SaveToListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                productId={Number(id)}
            />
        </>
    );
}
