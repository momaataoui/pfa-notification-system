package com.pfa.rexel.store.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotBlank
    private String customerFirstName;

    @NotBlank
    private String customerLastName;

    @NotBlank
    @Email
    private String customerEmail;
}
