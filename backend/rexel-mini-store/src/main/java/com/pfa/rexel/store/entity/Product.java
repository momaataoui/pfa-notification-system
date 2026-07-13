package com.pfa.rexel.store.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    /**
     * Prix barre optionnel (avant remise). Null si pas de remise.
     */
    private BigDecimal originalPrice;

    private Integer stockQuantity;

    /**
     * URL d'image optionnelle saisie par l'admin. Si vide, le frontend utilise
     * une icone locale generique basee sur la categorie du produit.
     */
    private String imageUrl;

    private String category;

    private BigDecimal rating;

    private Integer reviewCount;

    /**
     * Fiche technique optionnelle, uniquement pertinente pour certaines categories
     * (ex: disjoncteurs). Null si non applicable.
     */
    private String voltage;

    private String amperage;

    private String productType;

    private String certifications;
}
