package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.ProductRequestResponse;
import com.pfa.rexel.store.entity.ProductRequestStatus;
import com.pfa.rexel.store.mapper.ProductRequestMapper;
import com.pfa.rexel.store.service.ProductRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/product-requests")
@RequiredArgsConstructor
public class AdminProductRequestController {

    private final ProductRequestService productRequestService;

    @GetMapping
    public List<ProductRequestResponse> getAll(@RequestParam(required = false) ProductRequestStatus status) {
        return productRequestService.getAll(status).stream()
                .map(ProductRequestMapper::toDto)
                .toList();
    }

    @PatchMapping("/{id}/approve")
    public ProductRequestResponse approve(@PathVariable Long id) {
        return ProductRequestMapper.toDto(productRequestService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ProductRequestResponse reject(@PathVariable Long id) {
        return ProductRequestMapper.toDto(productRequestService.reject(id));
    }
}
