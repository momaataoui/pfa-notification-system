package com.pfa.rexel.store.repository;

import com.pfa.rexel.store.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
