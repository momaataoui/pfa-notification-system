package com.pfa.rexel.store.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductRequestCreateRequest {

    @NotBlank
    private String productName;

    private String description;

    @NotBlank
    private String customerFirstName;

    @NotBlank
    private String customerLastName;

    @NotBlank
    @Email
    private String customerEmail;
}
