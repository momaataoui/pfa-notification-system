package com.pfa.rexel.store.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotNull
    @DecimalMin(value = "0", inclusive = true)
    private BigDecimal price;

    @NotNull
    @Min(0)
    private Integer stockQuantity;

    private String imageUrl;

    private String category;

    private BigDecimal originalPrice;
}
