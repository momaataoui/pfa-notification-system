package com.pfa.rexel.store.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Demande d'un client pour un produit absent du catalogue.
@Entity
@Table(name = "product_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerFirstName;

    private String customerLastName;

    private String customerEmail;

    private String productName;

    private String description;

    @Enumerated(EnumType.STRING)
    private ProductRequestStatus status;

    private LocalDateTime createdAt;
}
