package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.ProductRequestCreateRequest;
import com.pfa.rexel.store.dto.ProductRequestResponse;
import com.pfa.rexel.store.entity.ProductRequest;
import com.pfa.rexel.store.mapper.ProductRequestMapper;
import com.pfa.rexel.store.service.ProductRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/product-requests")
@RequiredArgsConstructor
public class ProductRequestController {

    private final ProductRequestService productRequestService;

    @PostMapping
    public ResponseEntity<ProductRequestResponse> create(@Valid @RequestBody ProductRequestCreateRequest request) {
        ProductRequest saved = productRequestService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductRequestMapper.toDto(saved));
    }

    @GetMapping("/my")
    public List<ProductRequestResponse> getMyRequests(@RequestParam String email) {
        return productRequestService.getForCustomer(email).stream()
                .map(ProductRequestMapper::toDto)
                .toList();
    }
}
