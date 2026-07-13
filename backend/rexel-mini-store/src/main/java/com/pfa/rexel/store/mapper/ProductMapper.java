package com.pfa.rexel.store.mapper;

import com.pfa.rexel.store.dto.ProductDto;
import com.pfa.rexel.store.entity.Product;

public class ProductMapper {

    private ProductMapper() {
    }

    public static ProductDto toDto(Product product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.getCategory(),
                product.getRating(),
                product.getReviewCount(),
                product.getVoltage(),
                product.getAmperage(),
                product.getProductType(),
                product.getCertifications()
        );
    }
}
