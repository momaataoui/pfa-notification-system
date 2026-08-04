package com.pfa.rexel.store.repository;

import com.pfa.rexel.store.entity.ProductRequest;
import com.pfa.rexel.store.entity.ProductRequestStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRequestRepository extends JpaRepository<ProductRequest, Long> {

    List<ProductRequest> findByCustomerEmail(String customerEmail, Sort sort);

    List<ProductRequest> findByStatus(ProductRequestStatus status, Sort sort);
}
