package com.pfa.rexel.store.repository;

import com.pfa.rexel.store.entity.Order;
import com.pfa.rexel.store.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerEmail(String customerEmail, Sort sort);

    List<Order> findByStatus(OrderStatus status, Sort sort);

    long countByStatus(OrderStatus status);

    long countByReadFalse();
}
