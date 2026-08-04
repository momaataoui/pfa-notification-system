package com.pfa.rexel.store.mapper;

import com.pfa.rexel.store.dto.ProductRequestResponse;
import com.pfa.rexel.store.entity.ProductRequest;

public class ProductRequestMapper {

    private ProductRequestMapper() {
    }

    public static ProductRequestResponse toDto(ProductRequest request) {
        return new ProductRequestResponse(
                request.getId(),
                request.getCustomerFirstName(),
                request.getCustomerLastName(),
                request.getCustomerEmail(),
                request.getProductName(),
                request.getDescription(),
                request.getStatus(),
                request.getCreatedAt()
        );
    }
}
