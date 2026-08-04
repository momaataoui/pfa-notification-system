package com.pfa.rexel.store.dto;

import com.pfa.rexel.store.entity.ProductRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestResponse {
    private Long id;
    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String productName;
    private String description;
    private ProductRequestStatus status;
    private LocalDateTime createdAt;
}
