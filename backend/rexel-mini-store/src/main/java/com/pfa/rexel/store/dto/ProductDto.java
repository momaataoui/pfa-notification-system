package com.pfa.rexel.store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer stockQuantity;
    private String imageUrl;
    private String category;
    private BigDecimal rating;
    private Integer reviewCount;
    private String voltage;
    private String amperage;
    private String productType;
    private String certifications;
}
