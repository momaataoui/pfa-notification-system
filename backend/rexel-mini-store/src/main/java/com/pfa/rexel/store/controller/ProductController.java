package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.ProductDto;
import com.pfa.rexel.store.mapper.ProductMapper;
import com.pfa.rexel.store.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productService.getAll().stream()
                .map(ProductMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ProductDto getProduct(@PathVariable Long id) {
        return ProductMapper.toDto(productService.getById(id));
    }
}
